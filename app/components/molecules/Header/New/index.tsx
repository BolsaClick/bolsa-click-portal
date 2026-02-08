'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { ChevronDown, LogOut, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Menu } from '../../Menu'

const HeaderNew: React.FC = () => {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)


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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${scrolled ? '' : 'bg-gradient-to-r from-bolsa-primary to-blue-700'
      }`}>
      <div
        className={`hidden max-w-6xl lg:flex items-center mx-auto transition-all duration-500 ${menuOpen
          ? 'bg-white text-emerald-950'
          : scrolled
            ? sectionBg
            : 'py-4 border-transparent'
          }`}
      >
        <div
          className={`flex items-center justify-between w-full mx-auto transition-all duration-500 ${scrolled ? 'bg-white px-10 py-4 rounded-full' : 'px-4'
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

          <nav className="hidden lg:flex gap-10 items-center">
            <Menu isScrolled={scrolled} />

            {/* User Icon + Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'Avatar'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${scrolled ? 'bg-bolsa-primary text-white' : 'bg-white/20'
                    }`}>
                    <User size={18} />
                  </div>
                )}
                <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <Link
                        href="/minha-conta"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={18} />
                        Minha Conta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={18} />
                        Entrar
                      </Link>
                      <Link
                        href="/cadastro"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={18} />
                        Criar conta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Inscreva-se Button - only when not logged in */}
            {!user && (
              <Link
                href="/curso/resultado"

                className={`px-6 py-2 rounded-full font-semibold transition-colors ${scrolled
                  ? 'bg-bolsa-primary text-white hover:bg-bolsa-primary/90'
                  : 'bg-white text-bolsa-primary hover:bg-white/90'
                  }`}
              >
                Inscreva-se
              </Link>
            )}
          </nav>
        </div>
      </div>
      {/* MOBILE HEADER */}
      <div className="flex lg:hidden items-center justify-between bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="flex-shrink-0 p-1 text-gray-800 focus:outline-none"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={24} /> : (
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
          <Link href="/" className="flex-shrink-0">
            <Image src={logoColor} alt="Logo" width={80} height={30} priority />
          </Link>
        </div>
        {!user && (
          <Link
            href="/curso/resultado"
            className="px-4 py-2 mr-2 bg-bolsa-primary text-white rounded-full font-semibold text-sm whitespace-nowrap hover:bg-bolsa-primary/90 transition-colors"
          >
            Inscreva-se
          </Link>
        )}
      </div>

      {/* MENU MOBILE COM TRANSIÇÃO */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

          {/* Mobile User Section - Show login by default, user info when logged in */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'Avatar'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-bolsa-primary text-white flex items-center justify-center">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{user.name || 'Usuário'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/minha-conta"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={20} />
                  Minha Conta
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl text-red-600 font-medium"
                >
                  <LogOut size={20} />
                  Sair da conta
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-bolsa-primary text-white rounded-xl font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={20} />
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-bolsa-primary text-bolsa-primary rounded-xl font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  Criar conta grátis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderNew
