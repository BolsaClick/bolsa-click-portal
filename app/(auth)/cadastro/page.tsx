'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/contexts/AuthContext'

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bolsa-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/minha-conta'

  const { signUpWithEmail, signInWithGoogle, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  const password = watch('password', '')

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte']

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      await signUpWithEmail(data.email, data.password, data.name)
      toast.success('Conta criada com sucesso!')
      router.push(redirectUrl)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso')
      } else if (firebaseError.code === 'auth/weak-password') {
        toast.error('Senha muito fraca')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
      toast.success('Conta criada com sucesso!')
      router.push(redirectUrl)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar conta com Google')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/assets/logo-bolsa-click-rosa.png"
              alt="Bolsa Click"
              width={150}
              height={56}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-blue-950 mt-6">
            Criar sua conta grátis
          </h1>
          <p className="text-gray-500 mt-2">
            Cadastre-se para salvar favoritos e acompanhar bolsas
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Força: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Digite uma senha'}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-bolsa-primary focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                id="acceptTerms"
                className="mt-1 w-4 h-4 text-bolsa-primary border-gray-300 rounded focus:ring-bolsa-primary"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                Li e aceito os{' '}
                <Link
                  href="/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso"
                  className="text-bolsa-primary hover:underline"
                  target="_blank"
                >
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link
                  href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade"
                  className="text-bolsa-primary hover:underline"
                  target="_blank"
                >
                  Política de Privacidade
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 bg-bolsa-primary text-white font-semibold rounded-xl hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Criar conta grátis
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Já tem uma conta?{' '}
            <Link
              href={`/login${redirectUrl !== '/minha-conta' ? `?redirect=${redirectUrl}` : ''}`}
              className="text-bolsa-primary font-semibold hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}
