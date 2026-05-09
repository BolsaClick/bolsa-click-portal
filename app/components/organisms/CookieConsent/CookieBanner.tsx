'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
  onAcceptAll: () => void
  onReject: () => void
  onCustomize: () => void
}

export function CookieBanner({ onAcceptAll, onReject, onCustomize }: Props) {
  return (
    <motion.div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="fixed bottom-3 left-3 right-3 z-[1100] md:bottom-6 md:left-auto md:right-6 md:max-w-[480px]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-paper-warm shadow-[0_30px_70px_-20px_rgba(11,31,60,0.35)]">
        <div className="grain-overlay" />

        <div className="relative p-5 md:p-6">
          {/* topo: chip + dispensar */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-2">
              <span className="h-px w-6 bg-ink-300" />
              Cookies · 01
            </span>
            <button
              type="button"
              onClick={onReject}
              aria-label="Recusar e fechar"
              className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors"
            >
              <X size={12} className="transition-transform group-hover:rotate-90" />
              recusar
            </button>
          </div>

          {/* copy */}
          <h2 className="font-display display-tight text-[22px] md:text-[26px] leading-[1.15] text-ink-900 mb-2">
            Usamos cookies para mostrar bolsas
            <br />
            <span className="italic text-ink-700">relevantes para você</span>
            <span className="text-ink-300"> — </span>
            <span className="text-ink-700">e medir o que funciona.</span>
          </h2>

          <p className="text-[13px] leading-relaxed text-ink-500 mb-5">
            Você pode aceitar todos, recusar ou escolher categoria por categoria.
            Necessários ficam sempre ativos para o site funcionar.
          </p>

          {/* ações */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onCustomize}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-ink-900/20 bg-transparent text-[13px] font-medium text-ink-900 hover:border-ink-900 hover:bg-white transition-all"
            >
              Personalizar
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-bolsa-secondary text-white text-[13px] font-semibold hover:bg-bolsa-secondary/90 transition-all shadow-[0_8px_24px_-12px_rgba(242,29,68,0.6)]"
            >
              Aceitar tudo
              <span className="inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>

          {/* footer link */}
          <div className="mt-4 hairline-t pt-3 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-300">
              LGPD · Brasil
            </span>
            <Link
              href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
            >
              ler política →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
