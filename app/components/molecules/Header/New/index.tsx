'use client'

import React, { useState, useEffect } from 'react'
import { Menu } from '../../Menu'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'

const HeaderNew: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')
  const [menuOpen, setMenuOpen] = useState(false)


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])

  const theme = process.env.NEXT_PUBLIC_THEME
  const sectionBg =
    theme === 'anhanguera'
      ? 'mt-2 p-3 rounded-full bg-[#d63c06]/10 backdrop-blur-md border-[#d63c06]/70 border-[1px]'
      : 'mt-2 p-2 max-w-5xl w-full rounded-full bg-bolsa-secondary/10 backdrop-blur-md border-bolsa-secondary/70 border-[1px]'

  const logoWhite =
    currentTheme === 'anhanguera'
      ? '/assets/logo-anhanguera-bolsa-click-branco.svg'
      : '/assets/logo-bolsa-click-branco.png'

  const logoColor =
    currentTheme === 'anhanguera'
      ? '/assets/logo-anhanguera-bolsa-click.svg'
      : '/assets/logo-bolsa-click-rosa.png'

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 40
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  const toggleMenu = () => setMenuOpen(!menuOpen)

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] transition-all duration-500">
      <div
        className={`hidden max-w-6xl md:flex  items-center mx-auto transition-all duration-500 ${
          menuOpen
            ? 'bg-white text-emerald-950'
            : scrolled
            ? sectionBg
            : 'py-4 border-transparent'
        }`}
      >
        <div
          className={`flex items-center justify-between w-full mx-auto transition-all duration-500 ${
            scrolled && 'bg-white px-10 py-4 rounded-full '
          }`}
        >
          <Link href="/" className="flex items-center">
            <Image
              src={scrolled ? logoColor : logoWhite}
              alt="Logo"
              width={90}
              height={33}
              priority
            />
          </Link>

          <nav className="hidden md:flex gap-10">
            <Menu isScrolled={scrolled} />
          </nav>
        </div>
      </div>
      {/* MOBILE HEADER */}
      <div className="flex md:hidden items-center justify-between bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src={logoColor} alt="Logo" width={90} height={33} priority />
        </Link>
        <button
          onClick={toggleMenu}
          className="text-gray-800 focus:outline-none"
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={28} /> : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* MENU MOBILE COM TRANSIÇÃO */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Overlay */}
        {menuOpen && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={toggleMenu}
          />
        )}

        {/* Side Menu */}
        <div className="relative z-10 bg-white h-full w-[80%] p-6 shadow-xl rounded-r-xl transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-6  w-full">
            <Image src={logoColor} alt="Logo" width={80} height={30} />
            <button onClick={toggleMenu}>
              <X size={28} />
            </button>
          </div>
            <Menu />
        </div>
      </div>
    </header>
  )
}

export default HeaderNew
