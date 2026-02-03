import Link from 'next/link'
import { ReactNode } from 'react'

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
      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-bolsa-secondary hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bolsa-primary text-white transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="mb-1.5 text-base font-semibold text-bolsa-black group-hover:text-bolsa-secondary">
            {title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">{articleCount} artigos</span>
        <span className="text-sm font-medium text-bolsa-primary group-hover:text-bolsa-secondary">
          Ver todos →
        </span>
      </div>
    </Link>
  )
}
