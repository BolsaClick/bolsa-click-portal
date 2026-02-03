import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ReactNode } from 'react'

interface HelpCategoryHeroProps {
  title: string
  description: string
  icon?: ReactNode
  breadcrumb?: {
    label: string
    href: string
  }
}

export function HelpCategoryHero({ title, description, icon, breadcrumb }: HelpCategoryHeroProps) {
  return (
    <div className="bg-gradient-to-br from-bolsa-primary via-blue-800 to-blue-900 pt-28 pb-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="mx-auto max-w-5xl px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-white/70">
          <Link href="/central-de-ajuda" className="hover:text-white transition-colors">
            Central de Ajuda
          </Link>
          {breadcrumb && (
            <>
              <ChevronRight size={14} />
              <Link href={breadcrumb.href} className="hover:text-white transition-colors">
                {breadcrumb.label}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon && (
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center text-white flex-shrink-0">
              {icon}
            </div>
          )}

          {/* Content */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {title}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
