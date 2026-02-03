import { ArrowRight } from '@phosphor-icons/react'
import React from 'react'
import { NavLink } from '../../atoms/NavLink'

const menuItems = [
  { label: 'Cursos', href: '/cursos' },
  { label: 'Graduação', href: '/graduacao' },
  { label: 'Pós-graduação', href: '/pos-graduacao' },
  // { label: 'Meus favoritos', href: '/favoritos' },
  { label: 'Central de Ajuda', href: '/central-de-ajuda' },
]

interface MenuProps {
  className?: string
  isScrolled?: boolean
}

export const Menu: React.FC<MenuProps> = ({ isScrolled, className = '' }) => {
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
    <nav className={`flex lg:flex-row flex-col gap-6`}>
      {menuItems.map((item) => (
        <NavLink
          key={item.label}
          href={item.href}
          className={className}
          isScrolled={isScrolled}
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
