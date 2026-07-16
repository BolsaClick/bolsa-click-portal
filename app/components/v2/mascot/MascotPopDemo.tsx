'use client'

/**
 * Demo interativa do MascotPop pro /dev/design-preview:
 * clique no botão e o mascote-joinha pipoca ao lado (uma vez por clique).
 */

import { useState } from 'react'

import MascotPop from './MascotPop'

export default function MascotPopDemo() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-ink-100 bg-white p-6">
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="flex min-h-[48px] items-center justify-center rounded-xl bg-bolsa-primary px-6 text-[15px] font-bold text-white transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary focus-visible:ring-offset-2"
      >
        Garantir bolsa (teste do pop)
      </button>

      {/* área reservada evita layout shift quando o mascote aparece */}
      <div className="flex h-24 w-24 items-end justify-center">
        <MascotPop pose="comemorando" trigger={count} size={96} />
      </div>

      <p className="max-w-xs text-[12px] leading-snug text-ink-500">
        Pop de ≤600ms, roda uma vez por clique e some sozinho. Com{' '}
        <code className="rounded bg-ink-100/60 px-1 font-mono text-[11px]">prefers-reduced-motion</code>,
        aparece estático. Não bloqueia nem atrasa a navegação do CTA.
      </p>
    </div>
  )
}
