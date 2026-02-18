'use client'

import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/utils/fomartCurrency'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'

export default function MatriculaSuccessClient() {
  const searchParams = useSearchParams()
  const course = searchParams.get('course')
  const monthlyFeeParam = searchParams.get('monthlyFee')
  const paymentMethod = searchParams.get('paymentMethod')
  const installmentDescription = searchParams.get('installmentDescription')
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const { trackEvent } = usePostHogTracking()

  const monthlyFee = monthlyFeeParam ? Number(monthlyFeeParam) : null
  const isGraduacao = monthlyFee != null && !Number.isNaN(monthlyFee)
  const isPos = Boolean(paymentMethod && installmentDescription)

  useEffect(() => {
    trackEvent('enrollment_success_page_viewed', {
      course_name: course || undefined,
      monthly_fee: monthlyFee ?? undefined,
      payment_method: paymentMethod || undefined,
      installment_description: installmentDescription || undefined,
      is_graduacao: isGraduacao,
      is_pos: isPos,
    })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
      
      // Define o evento baseado no tema
      const eventName = theme === 'anhanguera' ? 'formSuccess' : 'formBSuccess'
      
      type DataLayerEvent = Record<string, unknown>;
      const w = window as Window & { dataLayer?: DataLayerEvent[] };
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({ event: eventName });
    }
  }, [])

  useEffect(() => {
    if (confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      })

      // Dispara confetes ao carregar
      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Dispara mais confetes após um pequeno intervalo
      setTimeout(() => {
        myConfetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })

        myConfetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })
      }, 500)
    }
  }, [])

  const portalUrl = isPos
    ? 'https://kroton.platosedu.io/v2/lms/login'
    : 'https://www.anhanguera.com/area-do-candidato/login'

  // Abre automaticamente o portal em nova aba quando a página carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open(portalUrl, '_blank')
    }, 1000)

    return () => clearTimeout(timer)
  }, [portalUrl])

  const handleAccessPortal = () => {
    window.open(portalUrl, '_blank')
  }

  return (
    <div className="w-full mt-[90px] max-w-3xl mx-auto p-4 relative">
      {/* Canvas para o efeito de confete */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      ></canvas>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full overflow-hidden relative">
        {/* Efeito de gradiente animado no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-green-glow animate-scale-in">
              <CheckCircle2 className="w-14 h-14 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
            Inscrição Realizada com Sucesso!
          </h2>
          <p className="text-gray-600 mt-2 animate-fade-in animation-delay-100">
            Parabéns! Sua inscrição foi realizada com sucesso e você garantiu seu desconto.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {(course || isGraduacao || isPos) && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 animate-fade-in animation-delay-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-medium">Detalhes da Inscrição</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {course && (
                  <>
                    <span className="text-gray-500">Curso:</span>
                    <span className="font-medium">{course}</span>
                  </>
                )}

                <span className="text-gray-500">Data:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>

                {isGraduacao && (
                  <>
                    <span className="text-gray-500">Mensalidade:</span>
                    <span className="font-medium text-green-700">
                      {formatCurrency(monthlyFee ?? 0)}
                    </span>
                  </>
                )}

                {isPos && (
                  <>
                    <span className="text-gray-500">Pagamento:</span>
                    <span className="font-medium text-green-700">
                      {paymentMethod} em {installmentDescription}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-up shadow-sm">
            <div className="flex gap-3">
              <div className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-green-800">
                  Inscrição realizada e garantida com desconto!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Sua inscrição foi realizada com sucesso e você garantiu seu desconto. Para confirmar sua matrícula, você precisará realizar o pagamento dentro da universidade. Você receberá um e-mail com os próximos passos e informações importantes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in animation-delay-300">
            <h4 className="font-medium text-blue-800 mb-2">
              Próximos Passos
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Acesse o portal do candidato para acompanhar sua inscrição</li>
              <li>Realize o pagamento dentro da universidade para confirmar sua matrícula</li>
              <li>Verifique seu e-mail para mais informações</li>
              <li>Entre em contato com a instituição se tiver dúvidas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={handleAccessPortal}
            className="w-full py-3 px-4 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg animate-bounce-in flex items-center justify-center gap-2"
          >
            <span>Acessar Portal do Aluno</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-gray-500">
            O link será aberto em uma nova aba
          </p>
        </div>
      </div>
    </div>
  )
}

