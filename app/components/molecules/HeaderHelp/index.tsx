'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { List, X } from '@phosphor-icons/react'

import Container from '../../atoms/Container'
import { Menu } from '../../molecules/Menu'

export const HeaderHelp = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-md">
      <Container>
        <div className="py-4 flex justify-between items-center">
          {/* Logo centralizado */}
          <Link href="/">
            <Image
              src="/assets/logo-bolsa-click-green-dark.svg"
              alt="Logo Bolsa Click"
              width={130}
              height={33}
              priority
            />
          </Link>

          {/* Menu mobile button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-zinc-800 w-8 h-8 flex items-center justify-center"
            >
              <List size={32} />
            </button>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center">
            <Menu isScrolled/>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-white transition-transform transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } z-[9999] lg:hidden`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <Image
            src="/assets/logo-bolsa-click-green-dark.svg"
            alt="Logo Bolsa Click"
            width={150}
            height={30}
          />
          <button onClick={toggleMenu} className="text-zinc-800">
            <X size={32} />
          </button>
        </div>
        <div className="flex flex-col px-4 mt-6 w-full">
          <Menu />
        </div>
      </div>
    </div>
  )
}
