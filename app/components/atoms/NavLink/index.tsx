'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

type NavLinkProps = ComponentProps<typeof Link>

export function NavLink({ href, children, className = '', ...rest }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        font-montserrat relative w-full lg:w-auto
        justify-between lg:justify-center flex items-center
        transition-all duration-300 text-zinc-900 lg:text-zinc-200 px-3 font-medium
        hover:text-bolsa-secondary
        ${isActive && 'text-zinc-900'}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Link>
  )
}
