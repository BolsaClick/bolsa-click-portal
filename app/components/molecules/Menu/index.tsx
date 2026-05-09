'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

type SubItem = {
  label: string
  description?: string
  href: string
}

type MenuItem = {
  label: string
  href: string
  submenu?: SubItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Cursos',
    href: '/cursos',
    submenu: [
      { label: 'Graduação EAD', description: 'Estude online com bolsa', href: '/curso/resultado?nivel=GRADUACAO&modalidade=EAD' },
      { label: 'Graduação Presencial', description: 'Faculdade perto de você', href: '/curso/resultado?nivel=GRADUACAO&modalidade=PRESENCIAL' },
      { label: 'Pós-Graduação', description: 'MBA e especialização', href: '/pos-graduacao' },
      { label: 'Profissionalizantes', description: 'Cursos práticos pro mercado', href: '/cursos-profissionalizantes' },
      { label: 'Ver todos os cursos', description: 'Catálogo completo', href: '/cursos' },
    ],
  },
  { label: 'Graduação', href: '/graduacao' },
  { label: 'Pós', href: '/pos-graduacao' },
  { label: 'Profissionalizantes', href: '/cursos-profissionalizantes' },
  { label: 'Ajuda', href: '/central-de-ajuda' },
]

interface MenuProps {
  className?: string
  // Compat: aceita mas ignora.
  isScrolled?: boolean
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

const DesktopMenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isActive = pathname === item.href || (item.submenu?.some((s) => pathname === s.href.split('?')[0]) ?? false)

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    enterTimer.current = setTimeout(() => setOpen(true), 80)
  }
  const handleLeave = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current)
    leaveTimer.current = setTimeout(() => setOpen(false), 200)
  }

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ;(containerRef.current?.querySelector('button') as HTMLButtonElement | null)?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!item.submenu) {
    return (
      <Link
        href={item.href}
        className={`relative font-montserrat text-[14px] font-medium whitespace-nowrap transition-colors duration-150 py-2 ${
          isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
        }`}
      >
        {item.label}
        {isActive && (
          <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-bolsa-secondary rounded-full" />
        )}
      </Link>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <Link
        href={item.href}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group inline-flex items-center gap-1 font-montserrat text-[14px] font-medium whitespace-nowrap transition-colors duration-150 py-2 ${
          isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
        }`}
      >
        {item.label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </Link>

      {/* Painel */}
      <div
        role="menu"
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-150 ${
          open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="min-w-[320px] bg-white border border-hairline rounded-2xl shadow-[0_20px_50px_-20px_rgba(11,31,60,0.18)] overflow-hidden">
          <ul className="py-2">
            {item.submenu.map((sub) => (
              <li key={sub.href} role="none">
                <Link
                  role="menuitem"
                  href={sub.href}
                  className="group flex items-start gap-3 px-5 py-3 text-ink-700 hover:bg-paper-warm transition-colors"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold text-ink-900 group-hover:text-bolsa-secondary transition-colors">
                      {sub.label}
                    </span>
                    {sub.description && (
                      <span className="block text-[12px] text-ink-500 mt-0.5">{sub.description}</span>
                    )}
                  </span>
                  <span className="text-ink-300 group-hover:text-bolsa-secondary transition-colors text-lg leading-none">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const MobileMenuItem: React.FC<{ item: MenuItem; onNavigate?: () => void }> = ({ item, onNavigate }) => {
  const [expanded, setExpanded] = useState(false)
  const hasSub = !!item.submenu

  if (!hasSub) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="flex items-center justify-between py-4 border-b border-hairline text-[16px] font-medium text-ink-900 hover:text-bolsa-secondary transition-colors"
      >
        {item.label}
        <span className="text-ink-300">→</span>
      </Link>
    )
  }

  return (
    <div className="border-b border-hairline">
      <div className="flex items-center justify-between py-4">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 text-[16px] font-medium text-ink-900 hover:text-bolsa-secondary transition-colors"
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? `Fechar submenu ${item.label}` : `Abrir submenu ${item.label}`}
          onClick={() => setExpanded((e) => !e)}
          className="p-2 -mr-2 text-ink-500"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {expanded && item.submenu && (
        <ul className="pb-3 pl-4 space-y-1">
          {item.submenu.map((sub) => (
            <li key={sub.href}>
              <Link
                href={sub.href}
                onClick={onNavigate}
                className="block py-2.5 text-[14px] text-ink-700 hover:text-bolsa-secondary transition-colors"
              >
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const Menu: React.FC<MenuProps> = ({ variant = 'desktop', onNavigate, className = '' }) => {
  if (variant === 'mobile') {
    return (
      <nav className={`flex flex-col ${className}`}>
        {menuItems.map((item) => (
          <MobileMenuItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    )
  }

  return (
    <nav className={`flex items-center gap-1 lg:gap-2 xl:gap-5 ${className}`}>
      {menuItems.map((item) => (
        <DesktopMenuItem key={item.label} item={item} />
      ))}
    </nav>
  )
}
