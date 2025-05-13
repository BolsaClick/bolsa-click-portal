// app/(default)/layout.tsx
import '../globals.css'

import { Header } from '../components/molecules/Header'
import Footer from '../components/molecules/Footer'
import HeaderNew from '../components/molecules/Header/New'


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="antialiased">
      <div className="flex min-h-screen flex-col">
              <HeaderNew />
              <main className="flex flex-1 flex-col">{children}</main>
              <Footer />
            </div>
      </body>
    </html>
  )
}
