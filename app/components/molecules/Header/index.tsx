'use client'
import { List, X } from '@phosphor-icons/react'

import Container from '../../atoms/Container'
import { Menu } from '../../molecules/Menu'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="w-full flex bg-bolsa-primary">
      <Container>
        <div className="py-4 flex justify-between items-center">
          <Link href="/">
            <Image src="/assets/logo-bolsa-click-white-green.svg" alt="Logo" width={193} height={33}/>
          </Link>

          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white w-8 h-8 flex flex-col justify-between items-center space-y-1"
            >
              <List size={32} />
            </button>
          </div>

          <div className="hidden lg:flex items-center">
            <Menu />
          </div>
        </div>
      </Container>

      <div
        className={`fixed inset-0 bg-white transition-transform transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 lg:hidden`}
      >
        <div className="flex justify-between items-center p-6 bg-bolsa-primary text-white">
          <Image src="/assets/logo-bolsa-click-white-green.svg" alt="Logo"  width={130} height={30}/>
          <button onClick={toggleMenu} className="text-white text-3xl">
            <X size={32} />
          </button>
        </div>
        <div className="flex flex-col px-4 mt-10 w-full ">
          <Menu />
        </div>
      </div>
    </div>
  )
}
