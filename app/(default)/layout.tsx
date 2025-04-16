// app/(default)/layout.tsx
import '../globals.css'

import { Header } from '../components/molecules/Header'
import Footer from '../components/molecules/Footer'


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="antialiased">
      <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex flex-1 flex-col">{children}</main>
              <Footer />
            </div>
      </body>
    </html>
  )
}
