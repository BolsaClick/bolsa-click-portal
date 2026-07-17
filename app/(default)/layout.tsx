// app/(default)/layout.tsx ✅ CORRETO
import HeaderNew from '../components/molecules/Header/New'
import Footer from '../components/molecules/Footer'
import ChatWidget from '../components/chat/ChatWidget'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNew />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      {/* Chat de suporte (Bob) — só no grupo (default); fora de /admin e /lp */}
      <ChatWidget />
    </div>
  )
}
