'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useExitIntent } from '@/app/lib/hooks/useExitIntent'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'

const WHATSAPP_URL = 'https://wa.me/551153043216'

export default function ExitIntentModal() {
  const showWhatsapp = useWhatsappFeatureFlag()
  const triggered = useExitIntent()
  const [open, setOpen] = useState(false)
  const { trackEvent } = usePostHogTracking()

  useEffect(() => {
    if (!triggered || !showWhatsapp) return
    setOpen(true)
    trackEvent('exit_intent_shown', {
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered, showWhatsapp])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const handleClose = () => {
    trackEvent('exit_intent_closed')
    setOpen(false)
  }

  const handleWhatsappClick = () => {
    trackEvent('exit_intent_whatsapp_clicked')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Precisa de ajuda para escolher seu curso? Fale com a gente no WhatsApp"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-paper shadow-[0_40px_80px_-30px_rgba(11,31,60,0.6)] animate-[scale-in_0.3s_cubic-bezier(0.22,1,0.36,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-white/80 text-ink-500 backdrop-blur-sm transition-colors hover:border-ink-300 hover:text-ink-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* O banner já traz a mensagem completa (título + CTA + selos) — sem
            título/parágrafo duplicado ao lado. Container no aspect-ratio exato
            da imagem (3:2) pra object-cover não precisar cortar nada. */}
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/assets/images/exit-intent/bolsa-click.png"
            alt="Precisa de ajuda para escolher seu curso? Fale com a gente no WhatsApp"
            fill
            sizes="(min-width: 768px) 448px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-2.5 p-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsappClick}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-bolsa-secondary px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-bolsa-secondary/25 transition-all hover:bg-bolsa-secondary/90"
          >
            Quero tirar dúvidas
          </a>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-hairline bg-white px-6 py-3.5 text-[15px] font-semibold text-ink-700 transition-colors hover:border-ink-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
