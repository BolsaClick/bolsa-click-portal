'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

type NavLinkProps = ComponentProps<typeof Link> & {
  isScrolled?: boolean
}


export function NavLink({ href, children, isScrolled, className = '', ...rest }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        font-montserrat relative w-full lg:w-auto
        justify-between lg:justify-center flex items-center
        transition-all duration-300 text-zinc-900 ${isScrolled ? 'lg:text-zinc-800 hover:text-emerald-500' : 'lg:text-zinc-200 hover:text-bolsa-secondary'}  px-3 font-medium
        
        ${isActive && 'text-zinc-900'}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Link>
  )
}
