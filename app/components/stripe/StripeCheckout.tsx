'use client'

import { useState, useMemo } from 'react'
import { StripeProvider } from './StripeProvider'
import { CardPaymentForm } from './CardPaymentForm'
import { Loader2, AlertCircle, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/utils/fomartCurrency'

interface StripeCheckoutProps {
  // Dados do cliente
  customerData: {
    name: string
    cpf: string
    email: string
    phone: string
  }
  // Valor em centavos
  amountInCents: number
  // Descrição do produto/serviço
  description: string
  // Metadados adicionais
  metadata?: Record<string, unknown>
  // Brand (anhanguera, unopar, etc.)
  brand?: string
  // Callbacks
  onSuccess?: (paymentIntentId: string, transactionId: string) => void
  onError?: (error: string) => void
  // URL de retorno após pagamento
  returnUrl?: string
  // Se o formulário principal está válido
  isFormValid?: boolean
}

interface CheckoutResponse {
  success: boolean
  transactionId: string
  paymentMethod: string
  clientSecret: string
  paymentIntentId: string
  amount: number
}

export function StripeCheckout({
  customerData,
  amountInCents,
  description,
  metadata,
  brand,
  onSuccess,
  onError,
  returnUrl,
  isFormValid = true,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Validação dos dados do cliente (validação dupla como segurança)
  const isCustomerDataValid = useMemo(() => {
    if (!isFormValid) return false // Respeitar validação do formulário principal
    
    const cleanCpf = customerData.cpf?.replace(/\D/g, '') || ''
    const cleanPhone = customerData.phone?.replace(/\D/g, '') || ''
    
    // Validar nome (mínimo 3 caracteres)
    const isValidName = customerData.name?.trim().length >= 3
    
    // Validar CPF (11 dígitos)
    const isValidCpf = cleanCpf.length === 11
    
    // Validar email (formato básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValidEmail = emailRegex.test(customerData.email || '')
    
    // Validar telefone (11 dígitos para celular brasileiro)
    const isValidPhone = cleanPhone.length === 11 && cleanPhone[2] === '9'
    
    return isValidName && isValidCpf && isValidEmail && isValidPhone
  }, [customerData.name, customerData.cpf, customerData.email, customerData.phone, isFormValid])

  const createCheckout = async () => {
    // Validar dados antes de criar checkout
    if (!isCustomerDataValid) {
      setError('Preencha todos os dados pessoais e de contato corretamente antes de continuar')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerData.name,
          cpf: customerData.cpf.replace(/\D/g, ''),
          email: customerData.email,
          phone: customerData.phone?.replace(/\D/g, '') || '',
          amountInCents,
          description,
          paymentMethod: 'card',
          brand: brand || 'anhanguera',
          metadata,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      if (!data.clientSecret) {
        throw new Error('Client secret não retornado pela API')
      }

      setCheckoutData(data)
      setShowForm(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar checkout'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (paymentIntentId: string) => {
    if (checkoutData) {
      onSuccess?.(paymentIntentId, checkoutData.transactionId)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    onError?.(errorMessage)
  }

  // Mostrar formulário de cartão quando checkout criado
  if (showForm && checkoutData?.clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Dados do Cartão</h3>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setCheckoutData(null)
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Voltar
          </button>
        </div>
        <StripeProvider clientSecret={checkoutData.clientSecret}>
          <CardPaymentForm
            amount={checkoutData.amount}
            transactionId={checkoutData.transactionId}
            onSuccess={handleSuccess}
            onError={handleError}
            returnUrl={returnUrl}
          />
        </StripeProvider>
      </div>
    )
  }

  // Estado inicial - botão para abrir formulário de cartão
  return (
    <div className="space-y-3">
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botão para iniciar pagamento com cartão */}
      <button
        type="button"
        onClick={createCheckout}
        disabled={isLoading || !isCustomerDataValid}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg
                   font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Preparando pagamento...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pagar {formatCurrency(amountInCents / 100)} com Cartão
          </>
        )}
      </button>

      {/* Mensagem quando dados incompletos */}
      {!isCustomerDataValid && !isLoading && (
        <p className="text-xs text-amber-600 text-center">
          Preencha todos os dados pessoais e de contato para continuar
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Pagamento seguro
      </p>
    </div>
  )
}
