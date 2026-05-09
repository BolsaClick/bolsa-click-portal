import Link from 'next/link'
import { ReactNode } from 'react'

interface HelpCategoryProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  articleCount: number
}

export function HelpCategory({
  icon,
  title,
  description,
  href,
  articleCount,
}: HelpCategoryProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col h-full bg-white border border-hairline rounded-2xl p-6 md:p-7 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_20px_50px_-30px_rgba(11,31,60,0.18)]"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-paper-warm text-ink-900 group-hover:bg-bolsa-secondary group-hover:text-white transition-colors">
          {icon}
        </span>
        <span className="font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500">
          {String(articleCount).padStart(2, '0')} artigos
        </span>
      </div>

      <h3 className="font-display text-2xl text-ink-900 leading-tight mb-2 group-hover:italic transition-all duration-200">
        {title}
      </h3>
      <p className="text-ink-500 text-[14px] leading-relaxed line-clamp-2">
        {description}
      </p>

      <div className="mt-auto pt-5 hairline-t flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink-700 group-hover:text-bolsa-secondary transition-colors">
          Ver categoria
        </span>
        <span
          aria-hidden="true"
          className="text-ink-300 group-hover:text-bolsa-secondary group-hover:translate-x-1 transition-all duration-300"
        >
          →
        </span>
      </div>
    </Link>
  )
}
