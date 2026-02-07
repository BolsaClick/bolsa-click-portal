'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'

const STRIPE_LOAD_TIMEOUT_MS = 15000

interface CardPaymentFormProps {
  amount: number
  transactionId: string
  onSuccess?: (paymentIntent: string) => void
  onError?: (error: string) => void
  returnUrl?: string
}

export function CardPaymentForm({
  amount,
  transactionId,
  onSuccess,
  onError,
  returnUrl,
}: CardPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoadTimeout(true)
    }, STRIPE_LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/checkout/sucesso?transactionId=${transactionId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Erro no pagamento
        const message = error.message || 'Ocorreu um erro ao processar o pagamento'
        setErrorMessage(message)
        onError?.(message)
      } else if (paymentIntent) {
        // Pagamento bem sucedido
        if (paymentIntent.status === 'succeeded') {
          setIsComplete(true)
          onSuccess?.(paymentIntent.id)
          // Se o parent não passou onSuccess, redireciona; caso contrário o parent cuida do redirect após matrícula
          if (!onSuccess) {
            window.location.href = returnUrl || `/checkout/sucesso?transactionId=${transactionId}&paymentIntent=${paymentIntent.id}`
          }
        } else if (paymentIntent.status === 'processing') {
          setErrorMessage('Pagamento em processamento. Você receberá uma confirmação em breve.')
        } else if (paymentIntent.status === 'requires_action') {
          // Stripe vai lidar com a ação necessária (3D Secure, etc.)
          setErrorMessage('Ação adicional necessária. Siga as instruções na tela.')
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setErrorMessage(message)
      onError?.(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pagamento Confirmado!
        </h3>
        <p className="text-gray-600">
          Redirecionando para a página de confirmação...
        </p>
      </div>
    )
  }

  // Stripe ainda não carregou — mostra loading; após timeout, mostra mensagem de erro
  if (!stripe || !elements) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Total a pagar</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(amount / 100)}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]">
          {loadTimeout ? (
            <>
              <AlertCircle className="h-10 w-10 text-amber-500" />
              <p className="text-sm font-medium text-gray-900">Formulário demorou para carregar</p>
              <p className="text-xs text-center text-gray-600">
                Recarregue a página. Se continuar, verifique se a chave pública do Stripe está configurada (mesma conta do Elysium).
              </p>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 text-bolsa-primary animate-spin" />
              <p className="text-sm text-gray-600">Carregando formulário de pagamento seguro...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo do pagamento */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Total a pagar</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(amount / 100)}
          </span>
        </div>
      </div>

      {/* Formulário do Stripe — número do cartão, validade, CVV */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'BR', // País padrão: Brasil
                },
              },
            },
          }}
        />
      </div>

      {/* Mensagem de erro */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Botão de pagamento */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className="w-full bg-bolsa-primary text-white py-4 px-6 rounded-xl font-semibold
                   hover:bg-bolsa-primary/90 transition-colors disabled:opacity-50
                   disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando pagamento...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pagar {formatCurrency(amount / 100)}
          </>
        )}
      </button>

      {/* Informações de segurança */}
      <p className="text-xs text-gray-500 text-center">
        Pagamento processado de forma segura pelo Stripe.
        Seus dados estão protegidos com criptografia de ponta a ponta.
      </p>
    </div>
  )
}
