import {
  Info,
  BookOpen,
  Percent,
  CreditCard,
  GraduationCap,
  Headphones,
  Shield,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Info,
  BookOpen,
  Percent,
  CreditCard,
  GraduationCap,
  Headphones,
  Shield,
  HelpCircle,
}

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || HelpCircle
}

export function renderIcon(iconName: string, size: number = 24) {
  const IconComponent = getIconComponent(iconName)
  return <IconComponent size={size} />
}
