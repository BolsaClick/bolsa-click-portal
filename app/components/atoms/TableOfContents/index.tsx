'use client'

import { useEffect, useState } from 'react'
import { List, ChevronDown } from 'lucide-react'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsOpen(false)
  }

  const tocContent = (
    <nav aria-label="Sumário do artigo">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={`text-left w-full text-sm py-1 px-2 rounded transition-colors ${
                item.level === 3 ? 'ml-3' : ''
              } ${
                activeId === item.id
                  ? 'text-bolsa-primary font-medium bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden lg:block bg-white rounded-2xl border p-5">
        <h3 className="font-bold text-blue-950 mb-3 flex items-center gap-2 text-sm">
          <List size={16} />
          Neste artigo
        </h3>
        {tocContent}
      </div>

      {/* Mobile: collapsible */}
      <div className="lg:hidden bg-white rounded-xl border">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-blue-950"
        >
          <span className="flex items-center gap-2">
            <List size={16} />
            Neste artigo
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && <div className="px-4 pb-4">{tocContent}</div>}
      </div>
    </>
  )
}
