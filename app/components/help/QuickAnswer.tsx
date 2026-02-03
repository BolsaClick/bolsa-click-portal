import { ReactNode } from 'react'
import { Zap } from 'lucide-react'

interface QuickAnswerProps {
  children: ReactNode
}

export function QuickAnswer({ children }: QuickAnswerProps) {
  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-emerald-700">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        Resumo Rápido
      </h2>
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
