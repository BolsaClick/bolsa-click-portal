/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CreditCard,
  Loader2,
  QrCode,
  ShieldAlert,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useHookFormMask } from 'use-mask-input'
import Image from 'next/image'
import { formatCurrency } from '@/utils/fomartCurrency'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>
    gtag?: (...args: any[]) => void
  }
}

interface PaymentGatewayProps {
  amount: number
  onSubmit: (data: any) => void
  transactionDenied?: boolean
  transactionDeniedByIssuer?: boolean
  transactionError?: boolean
  paymentMethod: string
  generatePix: any
  imagePix: string
  codePix: string
  isSubmitting: boolean
  customerEmail?: string
  customerPhone?: string
  customerName?: string
}

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  expDate: z.string().length(5, 'Data de expiração inválida'),
  cvv: z.string().length(3, 'CVV deve ter 3 dígitos'),
  cardNumber: z.string().length(19, 'Número do cartão inválido'),
})

type FormSchema = z.infer<typeof formSchema>

export default function PaymentForm({
  amount,
  onSubmit,
  transactionDenied,
  transactionError,
  generatePix,
  imagePix,
  codePix,
  isSubmitting,
  transactionDeniedByIssuer,
  customerEmail,
  customerName,
  customerPhone,
}: PaymentGatewayProps) {
  const [installments, setInstallments] = useState('1')
  const [activeTab, setActiveTab] = useState<'credit_card' | 'pix'>('credit_card')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({ resolver: zodResolver(formSchema) })

  const registerWithMask = useHookFormMask(register)

  // 🔔 Empurra os dados para o GTM quando o Step 2 (PaymentForm) renderiza
  useEffect(() => {
    if (!customerEmail && !customerPhone && !customerName) return
    if (typeof window === 'undefined') return

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'enhanced_conversion_data',
      user_data: {
        email: customerEmail || undefined,
        phone_number: customerPhone || undefined,
        name: customerName || undefined,
      },
    })
  }, [customerEmail, customerPhone, customerName])

  const getInstallmentOptions = () => {
    const options = []
    const maxInstallments = 12
    const safeAmount = Number(amount || 0)
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentAmount = safeAmount / i
      options.push({
        value: i.toString(),
        label: `${i}x de ${formatCurrency(installmentAmount)} `,
      })
    }
    return options
  }

  const handleFormSubmit = async (formData: FormSchema) => {
    const paymentData = {
      ...formData,
      paymentMethod: activeTab,
      installments,
      // ⛔️ não será enviado ao backend se você não usar; serve só para leitura no step 2
      customer: {
        email: customerEmail,
        phone: customerPhone,
        name: customerName,
      },
    }
    onSubmit(paymentData)
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="p-6">

        {/* 🔒 Inputs invisíveis mas renderizados no DOM para captação por Ads/EC */}
        <div aria-hidden="true" className="sr-only">
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={customerEmail ?? ''}
            readOnly
            tabIndex={-1}
          />
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={customerPhone ?? ''}
            readOnly
            tabIndex={-1}
          />
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={customerName ?? ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Abas */}
        <div className="flex w-full rounded-md border border-gray-200 overflow-hidden mb-6">
          <button
            className={`flex items-center justify-center flex-1 py-2.5 px-3 text-sm font-medium ${
              activeTab === 'credit_card'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('credit_card')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Cartão de Credito
          </button>
          <button
            className={`flex items-center justify-center flex-1 py-2.5 px-3 text-sm font-medium ${
              activeTab === 'pix'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={async () => {
              setActiveTab('pix')
              await generatePix({
                amount,
                paymentMethod: 'pix',
                // também pode mandar os dados aqui para o gerador de Pix, se quiser
                customer: {
                  email: customerEmail,
                  phone: customerPhone,
                  name: customerName,
                },
              })
            }}
          >
            <QrCode className="mr-2 h-4 w-4" />
            PIX
          </button>
        </div>

        {/* Cartão */}
        <div className={activeTab === 'credit_card' ? 'block' : 'hidden'}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="flex justify-between items-center w-full gap-4">
              <div className="w-1/2 space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome do Cartão
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              <div className="w-1/2 space-y-2">
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                  Número do Cartão
                </label>
                <input
                  {...register('cardNumber')}
                  {...registerWithMask('cardNumber', ['9999 9999 9999 9999'], { required: true })}
                  placeholder="0000 0000 0000 0000"
                  className={`w-full px-4 py-2 text-base border ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent pr-12`}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                  Data de Expiração
                </label>
                <input
                  {...register('expDate')}
                  {...registerWithMask('expDate', 'datetime', { inputFormat: 'mm/yy' })}
                  placeholder="MM/YYYY"
                  className={`w-full px-4 py-2 text-base border ${
                    errors.expDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent`}
                />
                {errors.expDate && <p className="text-red-500 text-sm">{errors.expDate.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  {...register('cvv')}
                  className={`${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  } w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent`}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="installments" className="block text-sm font-medium text-gray-700">
                Parcelamento
              </label>
              <select
                id="installments"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
                required
              >
                {getInstallmentOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - sem juros
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-bolsa-primary hover:bg-bolsa-primary/95 text-white py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-bolsa-secondary focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-full flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando pagamento...
                </div>
              ) : (
                'Finalizar pagamento'
              )}
            </button>

            {transactionDenied && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Transação Negada</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Seu cartão foi recusado pelo banco emissor. Verifique os dados do cartão ou tente outro método de pagamento.
                  </p>
                </div>
              </div>
            )}

            {transactionError && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-md p-4 flex items-start">
                <WifiOff className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800">Falha na Transação</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Ocorreu um erro técnico durante o processamento do pagamento. Por favor, tente novamente em alguns instantes.
                  </p>
                </div>
              </div>
            )}

            {transactionDeniedByIssuer && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 flex items-start">
                <ShieldAlert className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Transação Negada pelo Emissor</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    O banco emissor do seu cartão negou esta transação por motivos de segurança. Entre em contato com seu banco para mais informações.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* PIX */}
        <div className={activeTab === 'pix' ? 'block' : 'hidden'}>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              {isSubmitting ? (
                <div className="w-full flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              ) : imagePix ? (
                <Image
                  alt="Economize no Pix Bolsa Click"
                  src={imagePix}
                  className="h-32 w-32 mb-4"
                  width={128}
                  height={128}
                />
              ) : null}
              <p className="text-center text-sm text-gray-500">
                Escaneie o código QR com o aplicativo do seu banco para pagar via PIX
              </p>
              <div className="mt-4 p-3 bg-gray-100 rounded-md w-full max-w-xs text-center">
                <p className="text-xs text-gray-500 mb-1">Ou copie o código PIX</p>
                <p className="text-sm font-mono break-all select-all">{codePix}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                O pagamento via PIX é processado instantaneamente. Após o pagamento, você receberá a confirmação por e-mail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
