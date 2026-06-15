'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import QRCode from 'react-qr-code'
import ReviewInviteCard from '@/app/components/molecules/ReviewInviteCard'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackFbq } from '@/app/lib/analytics/fbq'
import { trackTikTokDual } from '@/app/lib/analytics/ttq'

export default function EstacioSuccessClient() {
  const searchParams = useSearchParams()
  const course = searchParams.get('course')
  const numeroInscricao = searchParams.get('numeroInscricao')
  const paymentUrl = searchParams.get('paymentUrl')
  const pixCode = searchParams.get('pixCode')
  const amount = searchParams.get('amount')
  const dueDate = searchParams.get('dueDate')
  const [pixCopied, setPixCopied] = useState(false)
  const { trackEvent } = usePostHogTracking()

  const formatBRL = (v?: string | null) => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0
      ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : null
  }
  const formatDate = (v?: string | null) => {
    if (!v) return null
    const [y, m, d] = v.split('-')
    return y && m && d ? `${d}/${m}/${y}` : v
  }

  useEffect(() => {
    trackEvent('estacio_success_page_viewed', {
      course_name: course || undefined,
      numero_inscricao: numeroInscricao || undefined,
      has_payment_url: !!paymentUrl,
    })

    // Conversão: inscrição realizada (pagamento será concluído na instituição).
    trackFbq('Lead', { content_name: course || undefined, currency: 'BRL' })
    void trackTikTokDual('SubmitForm', {
      content_name: course || undefined,
      content_type: 'product',
      currency: 'BRL',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Abre o link de pagamento da instituição em nova aba automaticamente.
  useEffect(() => {
    if (!paymentUrl) return
    const timer = setTimeout(() => window.open(paymentUrl, '_blank', 'noopener'), 1200)
    return () => clearTimeout(timer)
  }, [paymentUrl])

  return (
    <div className="w-full mt-[90px] max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Inscrição realizada com sucesso!</h1>
          <p className="text-gray-600 mt-2">
            Falta só um passo: finalize o pagamento da matrícula na instituição.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {(course || numeroInscricao) && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
              <h2 className="font-medium">Detalhes da inscrição</h2>
              {course && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Curso</span>
                  <span className="font-medium text-right">{course}</span>
                </div>
              )}
              {numeroInscricao && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Nº da inscrição</span>
                  <span className="font-medium">{numeroInscricao}</span>
                </div>
              )}
              {formatBRL(amount) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor da matrícula</span>
                  <span className="font-medium text-emerald-700">{formatBRL(amount)}</span>
                </div>
              )}
              {formatDate(dueDate) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vencimento</span>
                  <span className="font-medium">{formatDate(dueDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Data</span>
                <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}

          {pixCode && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-4 text-center">Pague com PIX</h3>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
                  <QRCode
                    value={pixCode}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mb-3">
                Escaneie o QR code com o app do seu banco
              </p>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-xs text-gray-500 mb-1 font-medium">Ou copie o código PIX:</p>
                <p className="text-xs text-gray-400 mb-2 break-all bg-gray-50 rounded p-2 font-mono leading-relaxed">
                  {pixCode}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(pixCode).then(() => {
                      setPixCopied(true)
                      setTimeout(() => setPixCopied(false), 2000)
                    })
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  <Copy className="w-4 h-4" />
                  {pixCopied ? 'Copiado!' : 'Copiar código PIX'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Próximos passos</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Acesse a página de pagamento da instituição para finalizar a matrícula.</li>
              <li>Você pode pagar via PIX ou boleto, conforme as opções exibidas lá.</li>
              <li>Verifique seu e-mail para acompanhar os próximos passos.</li>
            </ul>
          </div>

          {/* Coleta de reviews — checkout Estácio sempre é Estácio. */}
          <ReviewInviteCard brand="Estácio" />
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col gap-3">
          {paymentUrl ? (
            <>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 rounded-md text-sm font-medium text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Finalizar pagamento da matrícula</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-center text-xs text-gray-500">O link abre em uma nova aba.</p>
            </>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Você receberá por e-mail as instruções para finalizar o pagamento.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
