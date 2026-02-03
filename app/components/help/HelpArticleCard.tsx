import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface HelpArticleCardProps {
  title: string
  description: string
  href: string
}

export function HelpArticleCard({ title, description, href }: HelpArticleCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-blue-950 group-hover:text-bolsa-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-bolsa-primary group-hover:text-white transition-all duration-300">
          <ChevronRight size={18} />
        </div>
      </div>
    </Link>
  )
}
