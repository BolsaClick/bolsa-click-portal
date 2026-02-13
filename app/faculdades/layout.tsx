import HeaderNew from '../components/molecules/Header/New'
import Footer from '../components/molecules/Footer'

export default function FaculdadesLayout({
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
