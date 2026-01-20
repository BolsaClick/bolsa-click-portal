'use client'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { getCurrentTheme } from '@/app/lib/themes'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const theme = getCurrentTheme()
  const siteUrl = theme.siteUrl

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": siteUrl
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `${siteUrl}${item.href}`
      }))
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="text-neutral-200 hover:text-emerald-300 transition-colors"
              aria-label="Ir para página inicial"
            >
              <Home size={16} />
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight size={16} className="text-neutral-400 mx-2" />
              {index === items.length - 1 ? (
                <span className="text-neutral-100 font-medium" aria-current="page">{item.label}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-neutral-100 hover:text-emerald-200 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

