'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Loader2, AlertCircle, CheckCircle, Mail, Lock, UserPlus, User } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function AdminSetupPage() {
  const router = useRouter()
  const { firebaseUser, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [setupSecret, setSetupSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          setupSecret,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Forçar refresh do token para pegar as novas claims
        await firebaseUser.getIdToken(true)
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setError(data.error || 'Erro ao configurar admin')
      }
    } catch (err) {
      console.error('Setup error:', err)
      setError('Erro ao configurar admin')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setError(null)

    try {
      if (isRegistering) {
        await signUpWithEmail(email, password, name)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: unknown) {
      console.error('Auth error:', err)
      if (err instanceof Error) {
        if (err.message.includes('invalid-credential') || err.message.includes('wrong-password')) {
          setError('Email ou senha incorretos')
        } else if (err.message.includes('email-already-in-use')) {
          setError('Este email já está cadastrado. Faça login.')
        } else if (err.message.includes('weak-password')) {
          setError('A senha deve ter pelo menos 6 caracteres')
        } else {
          setError(isRegistering ? 'Erro ao criar conta' : 'Erro ao fazer login')
        }
      } else {
        setError('Erro inesperado')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  if (authLoading) {
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
            <span className="text-white font-medium">Configuração Inicial</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Admin Configurado!
              </h2>
              <p className="text-gray-500 mb-4">
                Você foi configurado como Super Admin. Redirecionando...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-bolsa-primary mx-auto" />
            </div>
          ) : !firebaseUser ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                {isRegistering ? 'Criar Conta Admin' : 'Faça Login'}
              </h2>
              <p className="text-gray-500 text-center mb-6">
                {isRegistering
                  ? 'Crie sua conta de administrador'
                  : 'Entre com email e senha para configurar o admin'}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

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
                      placeholder="admin@email.com"
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
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-bolsa-primary text-white py-3 rounded-lg font-semibold hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isRegistering ? 'Criando...' : 'Entrando...'}
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Criar Conta
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              <p className="text-center mt-4 text-sm text-gray-500">
                {isRegistering ? 'Já tem conta?' : 'Não tem conta?'}{' '}
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError(null)
                  }}
                  className="text-bolsa-primary hover:underline font-medium"
                >
                  {isRegistering ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Configurar Primeiro Admin
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Insira o secret para criar seu acesso de Super Admin
              </p>

              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Logado como:</p>
                <p className="font-medium text-gray-900">{firebaseUser.email}</p>
                <p className="text-xs text-gray-400 mt-1">UID: {firebaseUser.uid}</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setup Secret
                  </label>
                  <input
                    type="password"
                    value={setupSecret}
                    onChange={(e) => setSetupSecret(e.target.value)}
                    placeholder="Digite o secret de configuração"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verifique a variável ADMIN_SETUP_SECRET no .env
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !setupSecret}
                  className="w-full bg-bolsa-primary text-white py-3 rounded-lg font-semibold hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Configurar Admin
                    </>
                  )}
                </button>
              </form>
            </>
          )}

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
