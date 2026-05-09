import { ReactNode } from 'react'

interface QuickAnswerProps {
  children: ReactNode
}

export function QuickAnswer({ children }: QuickAnswerProps) {
  return (
    <aside className="not-prose mb-10 bg-paper-cream border border-hairline rounded-2xl p-6 md:p-7 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-bolsa-secondary" aria-hidden="true" />
      <div className="pl-2">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary inline-flex items-center gap-2 mb-3">
          <span className="h-px w-6 bg-bolsa-secondary/40" />
          Resumo rápido
        </span>
        <div className="prose prose-sm max-w-none text-ink-700 prose-p:text-ink-700 prose-p:leading-relaxed prose-strong:text-ink-900 prose-a:text-bolsa-secondary">
          {children}
        </div>
      </div>
    </aside>
  )
}
