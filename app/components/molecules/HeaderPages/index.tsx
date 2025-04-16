'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { Menu as MenuHamburguer, X } from 'lucide-react';
import { Menu } from '../Menu';
import Link from 'next/link';



export const HeaderPages = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsHeaderVisible(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className="z-50 bg-gray-100">
    <header 
      className={`fixed w-full bg-white shadow-md transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo-bolsa-click-green-dark.svg"
              alt="Logo Bolsa Click"
              width={150}
              height={30}
              priority
            />
          </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
          <Menu className="text-black font-semibold" />

          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-600"
            >
              {isMenuOpen ? <X size={24} /> : <MenuHamburguer size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
             <Menu />
            </div>
          </div>
        )}
      </nav>
    </header>

  </div>
  )
}
