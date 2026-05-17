'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, X, ExternalLink } from 'lucide-react'
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
      {/* Side tab vertical */}
      {!open && (
        <div className="vocational-tab-wrap fixed right-0 top-1/2 -translate-y-1/2 z-40 group">
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

      {/* Drawer/modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end animate-fade-in"
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
          <div className="relative bg-paper w-full md:w-[640px] h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="sticky top-0 bg-paper/95 backdrop-blur border-b border-hairline px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-0.5">
                  Bolsa Click
                </p>
                <h2
                  id="vocational-modal-title"
                  className="font-display text-xl font-semibold text-ink-900 flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-bolsa-secondary" />
                  Teste vocacional com IA
                </h2>
              </div>
              <div className="flex items-center gap-1">
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

            <div className="px-6 py-6 md:py-8">
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
        .vocational-tab-wrap {
          /* Garante que fica acima do WATI (que costuma ser z-index ~9999) sem cobrir modais críticos */
        }
      `}</style>
    </>
  )
}
