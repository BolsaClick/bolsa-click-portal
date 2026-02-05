'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useAuth } from './AuthContext'

interface AdminContextType {
  isAdmin: boolean
  role: string | null
  permissions: string[]
  loading: boolean
  hasPermission: (permission: string) => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!firebaseUser) {
        setIsAdmin(false)
        setRole(null)
        setPermissions([])
        setLoading(false)
        return
      }

      try {
        // Força refresh do token para obter claims atualizados
        const tokenResult = await firebaseUser.getIdTokenResult(true)
        const claims = tokenResult.claims

        if (claims.admin) {
          setIsAdmin(true)
          setRole(claims.role as string)
          setPermissions((claims.permissions as string[]) || [])
        } else {
          setIsAdmin(false)
          setRole(null)
          setPermissions([])
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setRole(null)
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [firebaseUser, authLoading])

  const hasPermission = (permission: string): boolean => {
    // SUPER_ADMIN tem todas as permissões
    if (role === 'SUPER_ADMIN') return true
    return permissions.includes(permission)
  }

  return (
    <AdminContext.Provider
      value={{ isAdmin, role, permissions, loading, hasPermission }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
