'use client'
import { List, X, User, SignOut, CaretDown } from '@phosphor-icons/react'

import Container from '../../atoms/Container'
import { Menu } from '../../molecules/Menu'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

export const Header = () => {
  const { user, loading, logout } = useAuth()
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (typeof window !== 'undefined') {
    setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
  }
}, [])
const theme = process.env.NEXT_PUBLIC_THEME
const sectionBg = theme === 'anhanguera' ? 'bg-[#d63c06]' : 'bg-emerald-700'


const logoWhite = currentTheme === 'anhanguera'
  ? '/assets/logo-anhanguera-bolsa-click-branco.svg'
  : '/assets/logo-bolsa-click-branco.png'

const logoColor = currentTheme === 'anhanguera'
  ? '/assets/logo-anhanguera-bolsa-click.svg'
  : '/assets/logo-bolsa-click-rosa.png'

  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50  transition-all duration-300 ${menuOpen
      ? 'bg-white text-emerald-950'
      : isScrolled
        ? 'bg-white/30 backdrop-blur-lg shadow-lg text-emerald-950'
        : sectionBg
      }`}>
      <Container>
        <div className="py-4 flex justify-between items-center">
          <Link href="/">
           <Image
              src={isScrolled ? logoColor : logoWhite}
              alt="Logo"
              width={100}
              height={33}
              priority
            />
          </Link>

          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`${isScrolled ? 'text-emerald-900' : 'text-white'} w-8 h-8 flex flex-col justify-between items-center space-y-1`}
            >
              <List size={32} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Menu isScrolled={isScrolled} />

            {/* User Menu */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isScrolled
                          ? 'text-emerald-900 hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                      }`}
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isScrolled ? 'bg-bolsa-primary text-white' : 'bg-white/20'
                        }`}>
                          <User size={18} />
                        </div>
                      )}
                      <span className="font-medium hidden xl:block">
                        {user.name?.split(' ')[0] || 'Minha Conta'}
                      </span>
                      <CaretDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
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
                          <SignOut size={18} />
                          Sair
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isScrolled
                        ? 'bg-bolsa-primary text-white hover:bg-bolsa-primary/90'
                        : 'bg-white text-bolsa-primary hover:bg-white/90'
                    }`}
                  >
                    <User size={18} />
                    Entrar
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      <div
        className={`fixed inset-0 bg-white transition-transform transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'
          } z-50 lg:hidden`}
      >
        <div className="flex justify-between items-center p-6 bg-bolsa-primary text-white">
        <Image
        src={logoWhite}
        alt="Logo"
        width={130}
        height={30}
      />
          <button onClick={toggleMenu} className="text-white text-3xl">
            <X size={32} />
          </button>
        </div>
        <div className="flex flex-col px-4 mt-10 w-full ">
          <Menu />

          {/* Mobile User Section */}
          {!loading && (
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
                    <SignOut size={20} />
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
          )}
        </div>
      </div>
    </header>
  )
}
