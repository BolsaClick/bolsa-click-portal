'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  HelpCircle,
  GraduationCap,
  Users,
  Target,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Ticket,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminProvider, useAdmin } from '@/app/contexts/AdminAuthContext'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'dashboard',
  },
  {
    name: 'Central de Ajuda',
    href: '/admin/central-de-ajuda',
    icon: HelpCircle,
    permission: 'help_center',
  },
  {
    name: 'Cursos em Destaque',
    href: '/admin/cursos',
    icon: GraduationCap,
    permission: 'courses',
  },
  {
    name: 'Faculdades',
    href: '/admin/faculdades',
    icon: Building2,
    permission: 'courses',
  },
  {
    name: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
    permission: 'users',
  },
  {
    name: 'Leads',
    href: '/admin/leads',
    icon: Target,
    permission: 'users',
  },
  {
    name: 'Matrículas',
    href: '/admin/matriculas',
    icon: BookOpen,
    permission: 'users',
  },
  {
    name: 'Administradores',
    href: '/admin/administradores',
    icon: Shield,
    permission: 'admin_management',
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
    permission: 'admin_management',
  },
  {
    name: 'Cupons',
    href: '/admin/cupons',
    icon: Ticket,
    permission: 'dashboard',
  },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, loading: authLoading } = useAuth()
  const { isAdmin, role, loading: adminLoading, hasPermission } = useAdmin()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loading = authLoading || adminLoading
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!loading && !isLoginPage) {
      if (!user || !isAdmin) {
        router.push('/admin/login')
      }
    }
  }, [user, isAdmin, loading, router, isLoginPage])

  // Se estiver na página de login, renderizar apenas o children
  if (isLoginPage) {
    return <><meta name="robots" content="noindex, nofollow" />{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bolsa-primary"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  )

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-bolsa-primary to-blue-800 text-white transform transition-transform duration-200
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo-bolsa-click-branco.png"
              alt="Admin"
              width={100}
              height={35}
              className="object-contain"
            />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || 'Admin'}
              </p>
              <p className="text-xs text-white/60 truncate">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-white/10 transition-colors text-left text-white/80"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find((n) => n.href === pathname)?.name || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Ver site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
    </>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  )
}
