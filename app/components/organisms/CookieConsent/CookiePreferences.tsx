'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import {
  CATEGORY_META,
  ConsentCategoriesState,
  ConsentCategory,
  DEFAULT_DENIED,
} from '@/app/lib/consent/categories'

type Props = {
  open: boolean
  initial: ConsentCategoriesState
  onClose: () => void
  onSave: (categories: ConsentCategoriesState) => void
  onAcceptAll: () => void
  onReject: () => void
}

const ORDER: ConsentCategory[] = [
  'necessary',
  'analytics',
  'marketing',
  'personalization',
]

export function CookiePreferences({
  open,
  initial,
  onClose,
  onSave,
  onAcceptAll,
  onReject,
}: Props) {
  const [draft, setDraft] = useState<ConsentCategoriesState>(initial)

  useEffect(() => {
    if (open) setDraft({ ...DEFAULT_DENIED, ...initial, necessary: true })
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const toggle = (cat: ConsentCategory) => {
    if (CATEGORY_META[cat].locked) return
    setDraft((d) => ({ ...d, [cat]: !d[cat] }))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1200] overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Preferências de cookies"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="fixed inset-0 bg-ink-900/45 backdrop-blur-sm"
          />

          {/* painel — flex container pra alinhar no topo com padding */}
          <div className="relative min-h-full flex items-start justify-center px-3 py-6 md:py-10">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[560px] rounded-2xl border border-hairline bg-white shadow-[0_40px_100px_-30px_rgba(11,31,60,0.45)] flex flex-col"
            >
            {/* header */}
            <div className="relative px-6 md:px-7 pt-6 pb-5 border-b border-hairline">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="absolute top-5 right-5 inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-warm transition-all"
              >
                <X size={16} />
              </button>
              <h2 className="text-[20px] md:text-[22px] font-bold text-ink-900 leading-tight pr-10">
                Preferências de cookies
              </h2>
              <p className="text-[14px] text-ink-500 leading-relaxed mt-1.5 pr-6">
                Escolha quais categorias de cookies o site pode usar.
              </p>
            </div>

            {/* lista */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7 py-1">
              <ul className="divide-y divide-hairline">
                {ORDER.map((cat) => {
                  const meta = CATEGORY_META[cat]
                  const enabled = draft[cat]
                  return (
                    <li key={cat} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[15px] font-semibold text-ink-900">
                              {meta.label}
                            </h3>
                            {meta.locked && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 bg-paper-warm rounded-full px-2 py-[2px]">
                                Sempre ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] leading-relaxed text-ink-500">
                            {meta.description}
                          </p>
                        </div>

                        <ConsentToggle
                          checked={enabled}
                          locked={meta.locked}
                          onChange={() => toggle(cat)}
                          label={meta.label}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* footer ações */}
            <div className="px-6 md:px-7 py-4 border-t border-hairline bg-paper">
              {/* Botões — stacked no mobile (com Aceitar primeiro), inline no desktop */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onReject}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full text-[13px] font-medium text-ink-700 hover:text-ink-900 hover:bg-white transition-colors"
                >
                  Recusar tudo
                </button>
                <button
                  type="button"
                  onClick={() => onSave(draft)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-hairline bg-white text-[13px] font-semibold text-ink-900 hover:border-ink-900 transition-all"
                >
                  Salvar escolhas
                </button>
                <button
                  type="button"
                  onClick={onAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-bolsa-secondary text-white text-[13px] font-semibold hover:bg-bolsa-secondary/90 transition-all"
                >
                  Aceitar tudo
                </button>
              </div>
              {/* Link política — abaixo dos botões */}
              <div className="mt-3 pt-3 border-t border-hairline text-center sm:text-left">
                <Link
                  href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies"
                  className="text-[12px] font-medium text-ink-500 hover:text-ink-900 transition-colors inline-flex items-center gap-1"
                >
                  Ler política completa <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ConsentToggle({
  checked,
  locked,
  onChange,
  label,
}: {
  checked: boolean
  locked?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label} — ${checked ? 'ativado' : 'desativado'}`}
      disabled={locked}
      onClick={onChange}
      className={`relative inline-flex h-[26px] w-[46px] flex-shrink-0 items-center rounded-full transition-colors duration-200 mt-0.5 ${
        checked ? 'bg-bolsa-primary' : 'bg-ink-100'
      } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
    >
      <span
        className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(11,31,60,0.2)] transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}
