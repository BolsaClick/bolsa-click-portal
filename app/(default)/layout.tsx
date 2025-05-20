// app/(default)/layout.tsx ✅ CORRETO
import HeaderNew from '../components/molecules/Header/New'
import Footer from '../components/molecules/Footer'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNew />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
