'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, Loader2, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAdmin } from '@/app/contexts/AdminAuthContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { signInWithEmail, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirecionar se já estiver logado como admin
  useEffect(() => {
    if (!authLoading && !adminLoading && isAdmin) {
      router.push('/admin')
    }
  }, [isAdmin, authLoading, adminLoading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signInWithEmail(email, password)
      // O useEffect vai redirecionar se for admin
      // Se não for admin, mostrar erro
      setTimeout(() => {
        setError(
          'Você não tem permissão de administrador. Entre em contato com o suporte.'
        )
        setIsSubmitting(false)
      }, 2000)
    } catch (err: unknown) {
      console.error('Login error:', err)
      if (err instanceof Error) {
        if (err.message.includes('invalid-credential')) {
          setError('Email ou senha incorretos')
        } else if (err.message.includes('too-many-requests')) {
          setError('Muitas tentativas. Tente novamente mais tarde.')
        } else {
          setError('Erro ao fazer login. Tente novamente.')
        }
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
      setIsSubmitting(false)
    }
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bolsa-primary via-blue-800 to-blue-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/assets/logo-bolsa-click-branco.png"
            alt="Bolsa Click"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <Shield size={18} className="text-white" />
            <span className="text-white font-medium">Área Administrativa</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Login Admin
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Acesse o painel administrativo
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-bolsa-primary text-white py-3 rounded-lg font-semibold hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Back to site */}
          <p className="text-center mt-6 text-sm text-gray-500">
            <Link href="/" className="text-bolsa-primary hover:underline">
              Voltar para o site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
