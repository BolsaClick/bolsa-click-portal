'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Menu } from '../../Menu'

const HeaderNew: React.FC = () => {
  const { user, logout } = useAuth()
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')
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

      {/* MOBILE TOP BAR — sem hambúrguer/drawer: bottom nav (Início/Buscar/
          Favoritos/Conta) já cobre a navegação principal. Branding mínimo,
          só o essencial. Itens que sumiram do menu (Graduação/Pós/
          Profissionalizantes/Bolsas de Estudo) seguem linkados no Footer
          (crawl equity preservada); Simulador/Carreiras/Ajuda/Cursos viraram
          uma listinha em /minha-conta (tab "Conta" do bottom nav). */}
      <div className="flex lg:hidden items-center justify-between bg-white px-4 h-[64px]">
        <Link href="/" className="flex-shrink-0">
          <Image src={logoColor} alt="Bolsa Click" width={108} height={36} priority className="h-[32px] w-auto" />
        </Link>
        {!user && (
          <Link
            href="/cadastro"
            className="px-4 py-2 bg-bolsa-secondary text-white rounded-full font-semibold text-[13px] whitespace-nowrap hover:bg-bolsa-secondary/90 transition-colors"
          >
            Cadastre-se
          </Link>
        )}
      </div>
    </header>
  )
}

export default HeaderNew
