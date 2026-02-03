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
      className="group block rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-[var(--bolsa-secondary)] hover:shadow-md"
    >
      <h3 className="mb-2 font-semibold text-[var(--bolsa-black)] group-hover:text-[var(--bolsa-secondary)]">
        {title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
    </Link>
  )
}
