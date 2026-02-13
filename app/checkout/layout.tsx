import { Metadata } from 'next'
import { SecureFooter } from "../components/molecules/SecureFooter";
import { SecureHeader } from "../components/molecules/SecureHeader";

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SecureHeader/>
      {children}
      <SecureFooter/>
    </>
  )
}
