// app/graduacao/layout.tsx

import Footer from "../components/molecules/Footer";
import { HeaderHelp } from "../components/molecules/HeaderHelp";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>
      <HeaderHelp/>
      </div>
      <div className="flex flex-1 flex-col bg-[#97ffc5]/5 pt-16">
    
      {children}
      </div>
      <Footer/>
    </>
  )
}
