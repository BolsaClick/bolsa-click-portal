// app/graduacao/layout.tsx

import Footer from "../components/molecules/Footer";
import { HeaderHelp } from "../components/molecules/HeaderHelp";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderHelp/>
      {children}
      <Footer/>
    </>
  )
}
