import { Metadata } from 'next';
import { SecureFooter } from "../components/molecules/SecureFooter";
import { SecureHeader } from "../components/molecules/SecureHeader";
import { InscriptionRouteFlag } from "./InscriptionRouteFlag";

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Before hydration: hide cookie/Wati overlays on first paint (375px). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('on-inscription-route')`,
        }}
      />
      <InscriptionRouteFlag />
      <SecureHeader/>
      <div data-checkout-inscription className="max-md:pb-52">
        {children}
      </div>
      <SecureFooter/>
    </>
  )
}
