import { ReactNode } from 'react'

interface QuickAnswerProps {
  children: ReactNode
}

export function QuickAnswer({ children }: QuickAnswerProps) {
  return (
    <div className="mb-8 rounded-xl border-l-4 border-[var(--bolsa-secondary)] bg-emerald-50 p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--bolsa-primary)]">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Resumo Rápido
      </h2>
      <div className="prose prose-sm max-w-none text-gray-700">{children}</div>
    </div>
  )
}
