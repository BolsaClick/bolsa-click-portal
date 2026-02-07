'use client'

import { useState, useEffect, useMemo, ReactNode } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initStripe() {
      try {
        const res = await fetch('/api/stripe-config')
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Falha ao carregar configuração do Stripe')
        }
        const key = data.publishableKey?.trim()
        if (!key || key.length < 10) {
          throw new Error('Chave pública do Stripe inválida')
        }
        if (cancelled) return
        const promise = loadStripe(key)
        setStripePromise(() => promise)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao carregar Stripe')
        }
      }
    }

    initStripe()
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
        rules: {
          '.Input': {
            border: '1px solid #e5e7eb',
            boxShadow: 'none',
            padding: '12px',
          },
          '.Input:focus': {
            border: '1px solid #6366f1',
            boxShadow: '0 0 0 1px #6366f1',
          },
          '.Label': {
            fontWeight: '500',
            marginBottom: '8px',
          },
        },
      },
      locale: 'pt-BR' as const,
    }),
    [clientSecret]
  )

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>
        <p className="mt-2 text-xs text-red-600">
          Verifique NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no .env (mesma conta do Elysium).
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-8">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-600">Carregando formulário de pagamento...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
