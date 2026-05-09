'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { LogOut, Menu as MenuIcon, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Menu } from '../../Menu'

const HeaderNew: React.FC = () => {
  const { user, logout } = useAuth()
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])

  const logoColor =
    currentTheme === 'anhanguera'
      ? '/assets/logo-anhanguera-bolsa-click.svg'
      : '/assets/logo-bolsa-click-rosa.png'

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

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (menuOpen) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [menuOpen])

  const toggleMenu = () => setMenuOpen((m) => !m)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-[1000] bg-white border-b border-hairline shadow-[0_1px_0_rgba(11,31,60,0.04)]">
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex items-center h-[68px] gap-4 xl:gap-6">
            <Link href="/" className="flex-shrink-0">
              <Image
                src={logoColor}
                alt="Bolsa Click"
                width={120}
                height={38}
                priority
                className="h-[36px] w-auto"
              />
            </Link>

            <Menu className="flex-1 justify-start ml-4" />

            <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    aria-label="Menu do usuário"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-ink-700 hover:bg-paper-warm transition-colors"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'Avatar'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-bolsa-primary text-white flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <span className="text-[14px] font-medium hidden xl:inline">
                      {user.name?.split(' ')[0] || 'Minha conta'}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-hairline rounded-xl shadow-[0_20px_50px_-20px_rgba(11,31,60,0.18)] py-2 z-50">
                      <Link
                        href="/minha-conta"
                        className="flex items-center gap-3 px-4 py-2.5 text-ink-700 hover:bg-paper-warm transition-colors text-[14px]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Minha conta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-bolsa-secondary hover:bg-bolsa-secondary/5 transition-colors text-[14px]"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-[14px] font-medium text-ink-900 hover:text-bolsa-secondary transition-colors whitespace-nowrap"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center px-4 xl:px-5 py-2.5 text-[13px] xl:text-[14px] font-semibold text-white bg-bolsa-secondary hover:bg-bolsa-secondary/90 rounded-full transition-colors shadow-sm whitespace-nowrap"
                  >
                    Cadastre-se grátis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BAR */}
      <div className="flex lg:hidden items-center justify-between bg-white px-4 h-[64px]">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMenu}
            className="p-2 -ml-2 text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-secondary rounded-md"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
          <Link href="/" className="flex-shrink-0">
            <Image src={logoColor} alt="Bolsa Click" width={108} height={36} priority className="h-[36px] w-auto" />
          </Link>
        </div>
        {!user && (
          <Link
            href="/cadastro"
            className="px-4 py-2 bg-bolsa-secondary text-white rounded-full font-semibold text-[13px] whitespace-nowrap hover:bg-bolsa-secondary/90 transition-colors"
          >
            Cadastre-se
          </Link>
        )}
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`lg:hidden fixed inset-0 z-[999] transition-all duration-300 ease-out ${
          menuOpen ? 'visible' : 'invisible'
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          tabIndex={-1}
          aria-label="Fechar menu"
          className={`absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleMenu}
        />
        <div
          className={`relative z-10 bg-white h-full w-[88%] max-w-[400px] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center px-5 h-[64px] border-b border-hairline">
            <Link href="/" onClick={toggleMenu}>
              <Image src={logoColor} alt="Bolsa Click" width={108} height={36} className="h-[36px] w-auto" />
            </Link>
            <button onClick={toggleMenu} aria-label="Fechar menu" className="p-2 -mr-2 text-ink-900">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-2">
            <Menu variant="mobile" onNavigate={toggleMenu} />

            <div className="mt-8 pt-6 border-t border-hairline pb-8">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'Avatar'}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-bolsa-primary text-white flex items-center justify-center">
                        <User size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 truncate">{user.name || 'Usuário'}</p>
                      <p className="text-sm text-ink-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/minha-conta"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-paper-warm rounded-full text-ink-900 font-semibold text-[14px]"
                    onClick={toggleMenu}
                  >
                    <User size={18} />
                    Minha conta
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      toggleMenu()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-hairline rounded-full text-bolsa-secondary font-semibold text-[14px]"
                  >
                    <LogOut size={18} />
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/cadastro"
                    onClick={toggleMenu}
                    className="flex items-center justify-center w-full px-4 py-3 bg-bolsa-secondary text-white rounded-full font-semibold text-[15px] hover:bg-bolsa-secondary/90 transition-colors"
                  >
                    Cadastre-se grátis
                  </Link>
                  <Link
                    href="/login"
                    onClick={toggleMenu}
                    className="flex items-center justify-center w-full px-4 py-3 border border-ink-900 text-ink-900 rounded-full font-semibold text-[15px] hover:bg-ink-900 hover:text-white transition-colors"
                  >
                    Entrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderNew
