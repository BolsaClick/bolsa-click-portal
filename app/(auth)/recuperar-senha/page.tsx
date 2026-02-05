'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/contexts/AuthContext'

const resetSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true)
    try {
      await resetPassword(data.email)
      setEmailSent(true)
      toast.success('E-mail de recuperação enviado!')
    } catch (error: unknown) {
      const firebaseError = error as { code?: string }
      if (firebaseError.code === 'auth/user-not-found') {
        toast.error('E-mail não encontrado')
      } else {
        toast.error('Erro ao enviar e-mail. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
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
            Recuperar senha
          </h1>
          <p className="text-gray-500 mt-2">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                E-mail enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Enviamos um link de recuperação para{' '}
                <span className="font-medium text-gray-900">{getValues('email')}</span>.
                <br />
                Verifique sua caixa de entrada e spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-bolsa-primary font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail cadastrado
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-bolsa-primary text-white font-semibold rounded-xl hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>

              {/* Back to Login */}
              <Link
                href="/login"
                className="block text-center text-gray-600 hover:text-gray-800 mt-4"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Voltar para o login
              </Link>
            </form>
          )}
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
