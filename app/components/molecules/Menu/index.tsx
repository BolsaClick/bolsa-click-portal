import { ArrowRight } from '@phosphor-icons/react'
import React from 'react'
import { NavLink } from '../../atoms/NavLink'

const menuItems = [
  { label: 'Graduação', href: '/graduacao' },
  { label: 'Buscar cursos', href: '/cursos' },
  { label: 'Quem somos', href: '/quem-somos' },
  { label: 'Contato', href: '/contato' },
]

interface MenuProps {
  className?: string
}

export const Menu: React.FC<MenuProps> = ({ className = '' }) => {
  const handleScrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <nav className={`flex lg:flex-row flex-col gap-6 `}>
      {menuItems.map((item) => (
        <NavLink
          key={item.label}
          href={item.href}
          className={className}
          onClick={(e) => {
            e.preventDefault()
            handleScrollToSection(item.href)
          }}
        >
          {item.label}
          <div className="lg:hidden">
            <ArrowRight size={24} />
          </div>
        </NavLink>
      ))}
    </nav>
  )
}
