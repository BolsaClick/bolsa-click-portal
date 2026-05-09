import Link from 'next/link'
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

export function HelpCategoryHero({
  title,
  description,
  icon,
  breadcrumb,
}: HelpCategoryHeroProps) {
  return (
    <section className="relative bg-bolsa-primary overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
      />
      <div className="container mx-auto px-4 pt-16 pb-14 md:pt-20 md:pb-16 relative">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 mb-6">
            <Link href="/central-de-ajuda" className="hover:text-white transition-colors">
              Central de ajuda
            </Link>
            {breadcrumb && (
              <>
                <span aria-hidden="true">/</span>
                <Link
                  href={breadcrumb.href}
                  className="hover:text-white transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-start gap-5">
            {icon && (
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white flex-shrink-0 border border-white/20">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-4xl lg:text-[44px] font-semibold text-white leading-[1.05] mb-3">
                {title}
              </h1>
              <p className="text-white/75 text-[15px] md:text-base max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
