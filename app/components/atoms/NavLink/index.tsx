'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

type NavLinkProps = ComponentProps<typeof Link> & {
  // Mantida apenas para compat com chamadas antigas; ignorada visualmente.
  isScrolled?: boolean
}

export function NavLink({ href, children, className = '', ...rest }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        font-montserrat relative inline-flex items-center justify-center w-full lg:w-auto
        text-[15px] font-medium transition-colors duration-150 px-1.5 py-2
        ${isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Link>
  )
}
