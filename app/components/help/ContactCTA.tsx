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
  description = 'Nossa equipe responde no WhatsApp em poucos minutos — sem fila, sem robô, com gente de verdade.',
  className = '',
}: ContactCTAProps) {
  const showWhatsapp = useWhatsappFeatureFlag()

  return (
    <aside
      className={`${className} relative bg-paper-warm border border-hairline rounded-2xl p-7 md:p-10 overflow-hidden`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
        <div className="md:col-span-7">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-ink-300" />
            Suporte humano
          </span>
          <h2 className="font-display text-2xl md:text-[30px] text-ink-900 leading-tight mb-2">
            {title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="italic text-ink-700">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-ink-500 text-[14px] md:text-[15px] leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        <div className="md:col-span-5 flex flex-col gap-2.5">
          {showWhatsapp && (
            <a
              href="https://wa.me/5511936200198"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] hover:bg-bolsa-secondary/90 transition-colors shadow-lg shadow-bolsa-secondary/25"
            >
              <MessageCircle size={16} />
              Falar no WhatsApp
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          )}
          <a
            href="/contato"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-hairline text-ink-900 font-semibold rounded-full text-[14px] hover:border-ink-900 hover:bg-ink-900 hover:text-white transition-all"
          >
            <Mail size={16} />
            Enviar mensagem
          </a>
        </div>
      </div>
    </aside>
  )
}
