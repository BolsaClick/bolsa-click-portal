'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, X, ExternalLink, ChevronUp } from 'lucide-react'
import { AIChat } from '@/app/(default)/teste-vocacional/_components/AIChat'

const DISMISS_KEY = 'vocational-tab-dismissed-at'
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000 // 24h

// Não aparece nessas rotas (já é o teste, ou área crítica de checkout/admin)
const HIDE_ON_PATHS = [
  '/teste-vocacional',
  '/admin',
  '/checkout',
  '/login',
  '/signup',
  '/responder-review',
]

export function VocationalTab() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(true) // começa hidden até hidratar

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(DISMISS_KEY)
      if (!raw) {
        setDismissed(false)
        return
      }
      const ts = parseInt(raw, 10)
      if (Number.isNaN(ts) || Date.now() - ts > DISMISS_TTL_MS) {
        setDismissed(false)
      }
    } catch {
      setDismissed(false)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignora
    }
    setDismissed(true)
  }, [])

  // Fecha modal com Esc
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Lock body scroll quando modal aberto
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!mounted) return null
  if (dismissed && !open) return null
  if (HIDE_ON_PATHS.some(p => pathname?.startsWith(p))) return null

  return (
    <>
      {/* Side tab vertical — DESKTOP apenas.
          z-[1005] > navbar (z-[1000]) pra nunca ficar atrás do header sticky. */}
      {!open && (
        <div className="vocational-tab-wrap hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-[1005] group">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir teste vocacional"
            className="vocational-tab relative flex flex-col items-center gap-3 bg-paper border border-r-0 border-hairline rounded-l-md px-3 py-5 hover:bg-ink-900 transition-colors shadow-[-2px_2px_8px_rgba(11,31,60,0.06)]"
          >
            <Sparkles
              size={14}
              className="text-bolsa-secondary group-hover:text-paper transition-colors animate-vocational-pulse"
            />
            <span
              className="font-mono text-[10px] tracking-[0.32em] uppercase text-ink-900 group-hover:text-paper transition-colors"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Teste Vocacional
            </span>
            <span
              className="font-display italic text-[11px] text-ink-500 group-hover:text-paper/70 transition-colors"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              com IA
            </span>
          </button>

          {/* X dismiss flutuante acima da tab */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            aria-label="Esconder por 24 horas"
            className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-ink-900 text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Bottom bar — MOBILE apenas.
          z-[1005] > navbar (z-[1000]) por consistência (no mobile o navbar
          provavelmente não sobrepõe, mas evita surpresa em viewports curtos). */}
      {!open && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-[1005] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-slide-up-bottom"
          role="region"
          aria-label="Teste vocacional"
        >
          <div className="relative bg-bolsa-primary text-paper rounded-2xl shadow-[0_8px_30px_-5px_rgba(11,31,60,0.4)] flex items-center gap-3 pl-3 pr-2 py-2.5">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-bolsa-secondary flex items-center justify-center">
              <Sparkles size={15} className="text-paper animate-vocational-pulse" />
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="font-display text-[14px] font-semibold leading-tight">
                Teste Vocacional com IA
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper/70 leading-tight mt-0.5">
                Grátis · 3 min · sem CPF
              </p>
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir teste vocacional"
              className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-paper/15 text-paper hover:bg-paper/25 transition-colors"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Esconder por 24 horas"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink-900 text-paper flex items-center justify-center shadow-md border border-paper/20"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Drawer/modal — bottom sheet no mobile, side drawer no desktop.
          z-[1010] > navbar (z-[1000]) pra cobrir tudo incluindo header sticky. */}
      {open && (
        <div
          className="fixed inset-0 z-[1010] flex items-end md:items-stretch md:justify-end animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vocational-modal-title"
        >
          {/* Overlay */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div className="relative bg-paper w-full md:w-[640px] h-[92vh] md:h-full overflow-y-auto shadow-2xl rounded-t-2xl md:rounded-none animate-slide-in-bottom md:animate-slide-in-right">
            {/* Handle bar visual — só no mobile */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <span className="w-10 h-1 rounded-full bg-ink-300" aria-hidden="true" />
            </div>
            <div className="sticky top-0 bg-paper/95 backdrop-blur border-b border-hairline px-5 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5">
                  Bolsa Click
                </p>
                <h2
                  id="vocational-modal-title"
                  className="font-display text-lg md:text-xl font-semibold text-ink-900 flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-bolsa-secondary flex-shrink-0" />
                  <span className="truncate">Teste vocacional com IA</span>
                </h2>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href="/teste-vocacional"
                  onClick={() => setOpen(false)}
                  className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-900 hover:bg-white rounded-md transition-colors"
                  title="Abrir em página inteira"
                >
                  <ExternalLink size={12} />
                  Página inteira
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="w-9 h-9 flex items-center justify-center text-ink-700 hover:text-ink-900 hover:bg-white rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 md:px-6 py-5 md:py-8">
              <AIChat />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes vocational-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.7;
          }
        }
        :global(.animate-vocational-pulse) {
          animation: vocational-pulse 2.6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        :global(.animate-fade-in) {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        :global(.animate-slide-in-right) {
          animation: slide-in-right 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @keyframes slide-in-bottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        :global(.animate-slide-in-bottom) {
          animation: slide-in-bottom 0.32s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @keyframes slide-up-bottom {
          0% { transform: translateY(120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        :global(.animate-slide-up-bottom) {
          animation: slide-up-bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both;
        }
        .vocational-tab-wrap {
          /* Garante que fica acima do WATI (que costuma ser z-index ~9999) sem cobrir modais críticos */
        }
      `}</style>
    </>
  )
}
