import Footer from '../components/molecules/Footer'
import HeaderNew from '../components/molecules/Header/New'

export default function CursosProfissionalizantesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderNew />
      {children}
      <Footer />
    </>
  )
}
