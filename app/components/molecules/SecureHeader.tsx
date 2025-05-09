'use client'
import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const SecureHeader: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState('bolsaclick')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])
  
  const logoColor = currentTheme === 'anhanguera'
    ? '/assets/logo-anhanguera-bolsa-click.svg'
    : '/assets/logo-bolsa-click-rosa.png'
  
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <Link href="/">
           <Image
               src={logoColor}
               alt="Logo"
               width={130}
               height={30}
             />
           </Link>
        <div className="flex items-center text-green-600">
          <Lock className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Ambiente Seguro</span>
        </div>
      </div>
    </header>
  );
};