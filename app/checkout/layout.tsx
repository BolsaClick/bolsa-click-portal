// app/graduacao/layout.tsx

import { SecureFooter } from "../components/molecules/SecureFooter";
import { SecureHeader } from "../components/molecules/SecureHeader";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SecureHeader/>
      {children}
      <SecureFooter/>
    </>
  )
}
