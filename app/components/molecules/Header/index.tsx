'use client'
import { List, X } from '@phosphor-icons/react'

import Container from '../../atoms/Container'
import { Menu } from '../../molecules/Menu'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export const Header = () => {
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')

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
              width={130}
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

          <div className="hidden lg:flex items-center">
            <Menu isScrolled={isScrolled} />
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
        </div>
      </div>
    </header>
  )
}
