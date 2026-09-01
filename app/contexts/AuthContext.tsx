'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
// `type` de propósito: importa só os tipos, sem puxar o SDK pro bundle.
import type { User as FirebaseUser } from 'firebase/auth'
import { whenIdle } from '@/app/lib/utils/when-idle'
import { precisaCarregarAuthAutomaticamente } from '@/app/lib/auth/public-auth-visibility'

/**
 * O SDK do Firebase (~100KB comprimidos) era importado estaticamente aqui, e
 * este provider envolve o layout raiz — então TODO visitante baixava e
 * inicializava autenticação, mesmo com o login público escondido da navegação
 * desde julho de 2026. Quase ninguém loga; todo mundo pagava a conta.
 *
 * Isso sobreviveu à troca pra import dinâmico (`import()` dentro de
 * `whenIdle()`): o import dinâmico só adia QUANDO o download acontece, não
 * SE ele acontece — e o efeito abaixo disparava `whenIdle()` incondicionalmente
 * em todo mount do provider (que envolve o app/layout inteiro via
 * ClientProviders), ou seja, em toda rota, mesmo com o login público
 * escondido da navegação (PUBLIC_AUTH_ENTRYPOINTS_ENABLED = false, ver
 * public-auth-visibility.ts). `carregarFirebaseAuth()` importa
 * `firebase/config`, cujo `getAuth(app)` roda no topo do módulo — é essa
 * chamada, ao rodar em toda visita, que dispara os requests pra
 * firebaseapp.com/__/auth/iframe.js e apis.google.com medidos em
 * /curso/resultado (27% do pageviews, TBT 580ms, Max Potential FID 270ms).
 *
 * Agora o efeito só dispara quando `precisaCarregarAuthAutomaticamente`
 * (app/lib/auth/public-auth-visibility.ts) diz que a ROTA precisa saber se
 * tem sessão sem esperar clique — hoje: /minha-conta, /favoritos, /admin,
 * /login, /cadastro, /recuperar-senha. Fora dessas rotas, o SDK só carrega
 * sob ação explícita de login/cadastro (signInWithEmail etc., já lazy via
 * exigirAuth() abaixo) — zero request de auth em página pública sem
 * interação de login.
 *
 * Deliberadamente NÃO condicionamos o carregamento, DENTRO dessas rotas, a
 * "existe sessão salva?": o Firebase persiste em IndexedDB na maioria dos
 * navegadores, e um palpite errado deixaria quem está logado aparecendo
 * como deslogado. Adiar por rota é seguro; adivinhar não seria.
 */
type FirebaseAuthModule = typeof import('firebase/auth')
type FirebaseConfigModule = typeof import('@/app/lib/firebase/config')

let carregamento: Promise<{
  mod: FirebaseAuthModule
  auth: FirebaseConfigModule['auth']
  googleProvider: FirebaseConfigModule['googleProvider']
}> | null = null

/** Carrega o SDK uma única vez por sessão; chamadas seguintes reusam a promise. */
function carregarFirebaseAuth() {
  if (!carregamento) {
    carregamento = Promise.all([
      import('firebase/auth'),
      import('@/app/lib/firebase/config'),
    ]).then(([mod, config]) => ({
      mod,
      auth: config.auth,
      googleProvider: config.googleProvider,
    }))
  }
  return carregamento
}

/** Como acima, mas estoura quando o Firebase não está configurado no ambiente. */
async function exigirAuth() {
  const { mod, auth, googleProvider } = await carregarFirebaseAuth()
  if (!auth) throw new Error('Firebase não configurado')
  return { mod, auth, googleProvider }
}

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
  // Vem da env, que o Next inlina no build — não precisa do SDK carregado pra
  // saber se o Firebase existe neste ambiente.
  const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY

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

  const pathname = usePathname()
  // Trava monotônica: uma vez que a rota atual justifica carregar o
  // Firebase automaticamente, continua justificando mesmo se o usuário
  // navegar de volta pra uma rota pública (não desmonta o listener por
  // troca de rota — só decide, uma vez, se chegou a hora de ligar).
  const [needsAuthLoad, setNeedsAuthLoad] = useState(() =>
    precisaCarregarAuthAutomaticamente(pathname)
  )

  useEffect(() => {
    if (!needsAuthLoad && precisaCarregarAuthAutomaticamente(pathname)) {
      setNeedsAuthLoad(true)
    }
  }, [pathname, needsAuthLoad])

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    if (!needsAuthLoad) {
      // Rota pública sem necessidade de auth automática: não baixa o SDK.
      // `loading` fica `true` — consumidores (Header, checkout, ...) já
      // tratam "ainda não sei se tem sessão" escondendo a UI dependente de
      // auth em vez de travar, então isso é seguro mesmo indefinidamente.
      return
    }

    let unsubscribe: (() => void) | undefined
    let cancelado = false

    whenIdle(() => {
      void carregarFirebaseAuth().then(({ mod, auth }) => {
        // Desmontou antes do SDK chegar: não assina nada.
        if (cancelado || !auth) {
          if (!cancelado) setLoading(false)
          return
        }
        unsubscribe = mod.onAuthStateChanged(auth, async (fbUser) => {
          setFirebaseUser(fbUser)

          if (fbUser) {
            const dbUser = await syncUserWithDatabase(fbUser)
            setUser(dbUser)
          } else {
            setUser(null)
          }

          setLoading(false)
        })
      })
    })

    return () => {
      cancelado = true
      unsubscribe?.()
    }
  }, [isConfigured, needsAuthLoad])

  // Login com email e senha
  const signInWithEmail = async (email: string, password: string) => {
    const { mod, auth } = await exigirAuth()
    setLoading(true)
    try {
      await mod.signInWithEmailAndPassword(auth, email, password)
    } finally {
      setLoading(false)
    }
  }

  // Cadastro com email e senha
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { mod, auth } = await exigirAuth()
    setLoading(true)
    try {
      const result = await mod.createUserWithEmailAndPassword(auth, email, password)
      await mod.updateProfile(result.user, { displayName: name })
    } finally {
      setLoading(false)
    }
  }

  // Login com Google
  const signInWithGoogle = async () => {
    const { mod, auth, googleProvider } = await exigirAuth()
    if (!googleProvider) throw new Error('Firebase não configurado')
    setLoading(true)
    try {
      await mod.signInWithPopup(auth, googleProvider)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    const { mod, auth } = await carregarFirebaseAuth()
    if (!auth) return
    setLoading(true)
    try {
      await mod.signOut(auth)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Recuperar senha
  const resetPassword = async (email: string) => {
    const { mod, auth } = await exigirAuth()
    await mod.sendPasswordResetEmail(auth, email)
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

export function useOptionalAuth() {
  return useContext(AuthContext)
}
