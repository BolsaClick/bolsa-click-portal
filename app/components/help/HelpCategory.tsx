import Link from 'next/link'
import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface HelpCategoryProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  articleCount: number
}

export function HelpCategory({ icon, title, description, href, articleCount }: HelpCategoryProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bolsa-primary to-blue-700 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-200">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="mb-1.5 text-lg font-bold text-blue-950 group-hover:text-bolsa-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {articleCount} artigos
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-bolsa-primary group-hover:gap-2 transition-all">
          Ver todos
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  )
}
