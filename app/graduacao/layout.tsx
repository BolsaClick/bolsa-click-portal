// app/graduacao/layout.tsx

import Footer from "../components/molecules/Footer";
import { HeaderPages } from "../components/molecules/HeaderPages";

export default function GraduacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderPages />
      {children}
      <Footer/>
    </>
  )
}
