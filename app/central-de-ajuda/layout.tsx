import { ReactNode } from 'react'
import HeaderNew from '../components/molecules/Header/New'
import Footer from '../components/molecules/Footer'

export default function CentralDeAjudaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNew />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
