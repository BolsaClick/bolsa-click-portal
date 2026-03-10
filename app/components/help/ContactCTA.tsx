'use client'

import { MessageCircle, Mail } from 'lucide-react'
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'

interface ContactCTAProps {
  title?: string
  description?: string
  className?: string
}

export function ContactCTA({
  title = 'Ainda com dúvidas?',
  description = 'Nossa equipe está pronta para ajudar você a encontrar a bolsa ideal',
  className = 'mt-10',
}: ContactCTAProps) {
  const showWhatsapp = useWhatsappFeatureFlag()

  return (
    <div className={`${className} rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 p-8 md:p-10 text-center relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <h2 className="mb-2 text-2xl font-bold text-white">
          {title}
        </h2>
        <p className="mb-6 text-blue-200">
          {description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showWhatsapp && (
            <a
              href="https://wa.me/5511936200198"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-400 hover:scale-105 shadow-lg shadow-green-500/30"
            >
              <MessageCircle size={20} />
              Falar no WhatsApp
            </a>
          )}
          <a
            href="/contato"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20"
          >
            <Mail size={20} />
            Enviar mensagem
          </a>
        </div>
      </div>
    </div>
  )
}
