'use client'

import confetti from 'canvas-confetti'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/utils/fomartCurrency'



export default function SuccessClient() {

  const searchParams = useSearchParams()
  const course = searchParams.get('course')
  const paymentMethod = searchParams.get('paymentMethod')
  const payToday = searchParams.get('price')


  const [status, setStatus] = useState<'waiting' | 'processing' | 'confirmed'>(
    'waiting',
  )
  const [progress, setProgress] = useState(0)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

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
    if (status === 'waiting') {
      const timer = setTimeout(() => {
        setStatus('processing')
        setProgress(50)
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (status === 'processing') {
      const timer = setTimeout(() => {
        setStatus('confirmed')
        setProgress(100)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  useEffect(() => {
    if (status === 'confirmed' && confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      })

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
  }, [status])

  const MethodPayment =
    paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'

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
          <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
            Confirmação de Pagamento
          </h2>
          <p className="text-gray-600 mt-1 animate-fade-in animation-delay-100">
            Estamos verificando seu pagamento via {MethodPayment}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-6">
            {status === 'waiting' && (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center animate-pulse">
                  <div className="w-12 h-12 text-amber-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium">
                  Aguardando confirmação do pagamento
                </h3>
              </div>
            )}

            {status === 'processing' && (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <div className="w-12 h-12 text-blue-500 animate-spin">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium">
                  Processando seu pagamento
                </h3>
              </div>
            )}

            {status === 'confirmed' && (
              <div className="flex flex-col items-center gap-4 animate-bounce-in">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-green-glow animate-scale-in">
                  <div className="w-14 h-14 text-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-green-600">
                  Pagamento confirmado!
                </h3>
              </div>
            )}
          </div>

          <div className="space-y-2 animate-fade-in animation-delay-200">
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span
                className={
                  status === 'confirmed'
                    ? 'text-green-600 font-medium'
                    : status === 'processing'
                      ? 'text-blue-600 font-medium'
                      : 'text-amber-600 font-medium'
                }
              >
                {status === 'waiting' && 'Aguardando'}
                {status === 'processing' && 'Processando'}
                {status === 'confirmed' && 'Confirmado'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                  status === 'confirmed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 space-y-3 animate-fade-in animation-delay-300 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-medium">Detalhes da transação</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Curso:</span>
              <span className="font-medium">{course}</span>

              <span className="text-gray-500">Valor pago:</span>
              <span className="font-medium">{formatCurrency(payToday ?? '0')}</span>

              <span className="text-gray-500">Data:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('pt-BR')}
              </span>

              <span className="text-gray-500">Método:</span>
              <span className="font-medium">{MethodPayment}</span>
            </div>
          </div>

          {status === 'confirmed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-up shadow-sm">
              <div className="flex gap-3">
                <div className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">
                    Matrícula garantida!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Seu pagamento foi confirmado e sua matrícula foi efetivada
                    com sucesso. Você receberá um e-mail com os próximos passos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex flex-col gap-3">
          {status === 'waiting' && (
            <button
              className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:shadow animate-fade-in"
              onClick={() => setStatus('processing')}
            >
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 mr-2 animate-spin">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                Verificar pagamento
              </div>
            </button>
          )}

          {status === 'confirmed' && (
            <button className="w-full py-2.5 px-4 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg animate-bounce-in">
              Acessar área do aluno
            </button>
          )}

          <div className="text-center text-sm text-gray-500 animate-fade-in animation-delay-400">
            {status !== 'confirmed' &&
              paymentMethod === 'pix' &&
              'O pagamento via PIX é processado instantaneamente. Se você já realizou o pagamento, aguarde alguns instantes.'}
          </div>
        </div>
      </div>
    </div>
  )
}
