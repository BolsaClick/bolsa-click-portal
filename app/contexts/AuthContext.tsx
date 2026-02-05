'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/app/lib/firebase/config'

interface User {
  id: string
  firebaseUid: string
  email: string
  name: string | null
  avatar: string | null
  phone: string | null
  cpf: string | null
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  isConfigured: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = !!auth

  // Sincronizar usuário do Firebase com o banco de dados
  const syncUserWithDatabase = async (fbUser: FirebaseUser): Promise<User | null> => {
    try {
      const idToken = await fbUser.getIdToken()

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          avatar: fbUser.photoURL,
          emailVerified: fbUser.emailVerified,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to sync user')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Error syncing user:', error)
      return null
    }
  }

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        const dbUser = await syncUserWithDatabase(fbUser)
        setUser(dbUser)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Login com email e senha
  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase não configurado')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } finally {
      setLoading(false)
    }
  }

  // Cadastro com email e senha
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase não configurado')
    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
    } finally {
      setLoading(false)
    }
  }

  // Login com Google
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase não configurado')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    if (!auth) return
    setLoading(true)
    try {
      await signOut(auth)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Recuperar senha
  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase não configurado')
    await sendPasswordResetEmail(auth, email)
  }

  // Atualizar perfil do usuário
  const updateUserProfile = async (data: Partial<User>) => {
    if (!firebaseUser) throw new Error('User not authenticated')

    const idToken = await firebaseUser.getIdToken()

    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    setUser(updatedUser.user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
