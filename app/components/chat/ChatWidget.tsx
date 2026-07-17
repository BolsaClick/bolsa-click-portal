'use client'

/**
 * Widget de chat de suporte (estilo Zendesk) com o Bob de atendente.
 *
 * - Launcher circular fixo no canto inferior direito, com badge de
 *   "mensagem nova" pulsando até o chat ser aberto pela 1ª vez na sessão.
 * - Teaser (balãozinho de convite) após ~6s, dismissível (sessionStorage).
 * - Painel carregado sob demanda (next/dynamic) pra não pesar o bundle inicial.
 *
 * Montado apenas no layout do grupo (default) — fora de /admin e /lp.
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { mascotSrc } from '../v2/mascot/Mascot'
import { captureChatEvent, CHAT_OPEN_EVENT, CHAT_TEASER_DISMISS_KEY } from './chat-types'

const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false })

const TEASER_DELAY_MS = 6000
const BADGE_SEEN_KEY = 'bolsaclick_chat_badge_seen'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [teaserVisible, setTeaserVisible] = useState(false)
  // Badge "1 mensagem nova": some pra sempre (na sessão) após o 1º open.
  const [badgeVisible, setBadgeVisible] = useState(false)

  useEffect(() => {
    try {
      setBadgeVisible(window.sessionStorage.getItem(BADGE_SEEN_KEY) !== '1')
    } catch {
      setBadgeVisible(true)
    }
  }, [])

  // Teaser: aparece após TEASER_DELAY_MS, a menos que já tenha sido
  // dispensado nesta sessão ou o chat esteja aberto.
  useEffect(() => {
    if (open) return
    let dismissed = false
    try {
      dismissed = window.sessionStorage.getItem(CHAT_TEASER_DISMISS_KEY) === '1'
    } catch {
      // storage indisponível — mostra mesmo assim
    }
    if (dismissed) return
    const timer = window.setTimeout(() => setTeaserVisible(true), TEASER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  const dismissTeaser = useCallback(() => {
    setTeaserVisible(false)
    try {
      window.sessionStorage.setItem(CHAT_TEASER_DISMISS_KEY, '1')
    } catch {
      // no-op
    }
  }, [])

  const openChat = useCallback(() => {
    dismissTeaser()
    setBadgeVisible(false)
    try {
      window.sessionStorage.setItem(BADGE_SEEN_KEY, '1')
    } catch {
      // no-op
    }
    setOpen(true)
    captureChatEvent('chat_widget_opened')
  }, [dismissTeaser])

  const closeChat = useCallback(() => setOpen(false), [])

  // Abertura programática de qualquer lugar do site (ex.: Bob Mago do FAQ).
  useEffect(() => {
    window.addEventListener(CHAT_OPEN_EVENT, openChat)
    return () => window.removeEventListener(CHAT_OPEN_EVENT, openChat)
  }, [openChat])

  return (
    <>
      {/* Teaser — convite dismissível */}
      {teaserVisible && !open && (
        <div
          role="status"
          className="fixed bottom-24 right-4 z-[70] w-[min(260px,calc(100vw-2rem))] animate-slide-pulse rounded-2xl rounded-br-md border border-ink-100 bg-white p-3.5 pr-8 shadow-xl motion-reduce:animate-none sm:right-6"
        >
          <button
            type="button"
            onClick={dismissTeaser}
            aria-label="Dispensar convite do chat"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 motion-reduce:transition-none"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" onClick={openChat} className="text-left">
            <p className="text-sm leading-snug text-ink-900">
              Oi! 👋 Posso te ajudar a encontrar sua bolsa?
            </p>
            <p className="mt-1 text-xs font-semibold text-bolsa-primary">Falar com o Bob</p>
          </button>
        </div>
      )}

      {/* Launcher */}
      <button
        type="button"
        onClick={open ? closeChat : openChat}
        aria-label={open ? 'Fechar chat de ajuda' : 'Abrir chat de ajuda com o Bob'}
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-[70] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-bolsa-primary shadow-lg shadow-bolsa-primary/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolsa-primary motion-reduce:transition-none motion-reduce:hover:scale-100 sm:right-6"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 7l6 6 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <Image
            src={mascotSrc('acenando')}
            alt=""
            width={56}
            height={56}
            draggable={false}
            className="h-full w-full select-none object-contain object-top pt-1.5"
          />
        )}
      </button>

      {/* Badge "mensagem nova" — fora do button (que tem overflow-hidden) */}
      {badgeVisible && !open && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed bottom-[3.85rem] right-[0.85rem] z-[71] flex h-5 w-5 sm:right-[1.35rem]"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bolsa-secondary opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-bolsa-secondary text-[10px] font-bold text-white ring-2 ring-white">
            1
          </span>
        </span>
      )}

      {open && <ChatPanel onClose={closeChat} />}
    </>
  )
}
