import Link from 'next/link'

interface HelpArticleCardProps {
  title: string
  description: string
  href: string
}

export function HelpArticleCard({ title, description, href }: HelpArticleCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-start justify-between gap-5 bg-white border border-hairline rounded-2xl p-6 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_20px_50px_-30px_rgba(11,31,60,0.15)]"
    >
      <div className="min-w-0 flex-1">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2 block">
          Artigo
        </span>
        <h3 className="font-display text-xl text-ink-900 leading-snug mb-2 group-hover:italic transition-all duration-200">
          {title}
        </h3>
        <p className="text-ink-500 text-[14px] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-paper-warm text-ink-700 group-hover:bg-ink-900 group-hover:text-white transition-colors mt-1"
      >
        →
      </span>
    </Link>
  )
}
