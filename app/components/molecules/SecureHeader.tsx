'use client'
import React, { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const SecureHeader: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])

  const logoColor =
    currentTheme === 'anhanguera'
      ? '/assets/logo-anhanguera-bolsa-click.svg'
      : '/assets/logo-bolsa-click-rosa.png'

  return (
    <header className="bg-white border-b border-hairline fixed top-0 left-0 right-0 z-50 shadow-[0_1px_0_rgba(11,31,60,0.04)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Bolsa Click">
          <Image
            src={logoColor}
            alt="Bolsa Click"
            width={120}
            height={36}
            priority
            className="h-[34px] w-auto"
          />
        </Link>
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-warm">
          <Lock className="w-3 h-3 text-ink-700" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-700">
            Ambiente seguro
          </span>
        </div>
      </div>
    </header>
  )
}
