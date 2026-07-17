'use client'

/**
 * Bob Mago — atendente mágico do FAQ (homenagem ao assistente clássico do
 * Office, mas com o Bob de chapéu de mago e varinha).
 *
 * Comportamentos:
 * - Idle: mago acenando com glow radial + sparkles pulsando e balão de fala
 *   que troca de frase a cada poucos segundos.
 * - Clippy-mode: ao abrir qualquer pergunta do accordion (toggle de <details>
 *   dentro de [data-faq-root]), o Bob "lança a magia" — pose da varinha pro
 *   alto + burst de estrelinhas por ~1.4s.
 * - CTA "Perguntar pro Bob" dispara CHAT_OPEN_EVENT e abre o chat widget.
 *
 * Respeita prefers-reduced-motion (sem pulse/burst; a troca de pose fica).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { CHAT_OPEN_EVENT } from '@/app/components/chat/chat-types'
import Mascot from '@/app/components/v2/mascot/Mascot'

const IDLE_BUBBLES = [
  'Parece que você tá procurando uma bolsa! Posso ajudar? ✨',
  'Pergunte sem medo — bolsa de até 80% não é magia, é real.',
  'Abre uma pergunta aí que eu conjuro a resposta. 🪄',
  'Dica do mago: sem nota de corte, sem ENEM obrigatório.',
]

const CAST_BUBBLE = 'Boa pergunta! ✨'
const CAST_MS = 1400
const BUBBLE_ROTATE_MS = 6000

export default function BobWizard() {
  const [casting, setCasting] = useState(false)
  const [bubbleIdx, setBubbleIdx] = useState(0)
  const castTimer = useRef<number | null>(null)

  // Balão idle rotativo
  useEffect(() => {
    if (casting) return
    const t = window.setInterval(
      () => setBubbleIdx((i) => (i + 1) % IDLE_BUBBLES.length),
      BUBBLE_ROTATE_MS,
    )
    return () => window.clearInterval(t)
  }, [casting])

  // Clippy-mode: reage à abertura de qualquer <details> do FAQ. `toggle` não
  // borbulha — listener em capture no document pega mesmo assim.
  useEffect(() => {
    const onToggle = (e: Event) => {
      const el = e.target as HTMLElement | null
      if (!el || !(el instanceof HTMLDetailsElement)) return
      if (!el.open || !el.closest('[data-faq-root]')) return
      setCasting(true)
      if (castTimer.current) window.clearTimeout(castTimer.current)
      castTimer.current = window.setTimeout(() => setCasting(false), CAST_MS)
    }
    document.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('toggle', onToggle, true)
      if (castTimer.current) window.clearTimeout(castTimer.current)
    }
  }, [])

  const openChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT))
  }, [])

  return (
    <div className="mt-8">
      {/* Balão de fala — estilo assistente clássico */}
      <div
        role="status"
        className="relative hidden w-56 rounded-2xl rounded-bl-md border border-ink-100 bg-white p-3.5 shadow-md md:block"
      >
        <p className="text-sm leading-snug text-ink-900">
          {casting ? CAST_BUBBLE : IDLE_BUBBLES[bubbleIdx]}
        </p>
        {/* rabinho do balão */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-ink-100 bg-white"
        />
      </div>

      {/* Bob Mago + glow + sparkles */}
      <div
        className="relative mt-3 hidden h-56 w-56 md:flex md:items-center md:justify-center"
        aria-hidden="true"
      >
        <span className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,206,84,0.24)_0%,rgba(255,206,84,0.08)_48%,transparent_72%)]" />
        <span className="absolute left-3 top-12 text-xl text-bolsa-secondary motion-safe:animate-pulse">✦</span>
        <span className="absolute right-5 top-3 text-sm text-bolsa-secondary/80 motion-safe:animate-pulse">✧</span>
        <span className="absolute right-1 top-24 text-lg text-bolsa-secondary motion-safe:animate-pulse">✦</span>
        <span className="absolute bottom-6 left-8 text-xs text-bolsa-secondary/70 motion-safe:animate-pulse">✧</span>
        {/* burst extra enquanto "lança a magia" */}
        {casting && (
          <>
            <span className="absolute right-8 top-6 text-2xl text-bolsa-secondary motion-safe:animate-ping">✦</span>
            <span className="absolute left-10 top-4 text-base text-bolsa-secondary/90 motion-safe:animate-ping">✧</span>
            <span className="absolute bottom-10 right-4 text-lg text-bolsa-secondary/80 motion-safe:animate-ping">✦</span>
          </>
        )}
        <Mascot
          pose={casting ? 'mago-magia' : 'mago-acenando'}
          size={190}
          className="relative z-10 drop-shadow-[0_14px_18px_rgba(12,35,64,0.12)]"
        />
      </div>

      {/* CTA — abre o chat (visível também no mobile, sem o mascote) */}
      <button
        type="button"
        onClick={openChat}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:border-bolsa-primary hover:text-bolsa-primary motion-reduce:transition-none"
      >
        <span aria-hidden="true">🪄</span>
        Não achou? Pergunta pro Bob
      </button>
    </div>
  )
}
