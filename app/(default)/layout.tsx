// app/(default)/layout.tsx ✅ CORRETO
import HeaderNew from '../components/molecules/Header/New'
import Footer from '../components/molecules/Footer'
import ChatWidget from '../components/chat/ChatWidget'
import BottomNav from '../components/BottomNav'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    // pb no mobile: espaço pro BottomNav fixo (64px + safe-area) não cobrir
    // o fim do Footer ao rolar até o final da página.
    <div className="flex min-h-screen flex-col pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
      <HeaderNew />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      {/* Chat de suporte (Bob) — só no grupo (default); fora de /admin e /lp */}
      <ChatWidget />
      <BottomNav />
    </div>
  )
}
