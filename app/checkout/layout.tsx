import { Metadata } from 'next'
import Script from 'next/script'
import { SecureFooter } from "../components/molecules/SecureFooter";
import { SecureHeader } from "../components/molecules/SecureHeader";

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="utmify-pixel" strategy="afterInteractive">
        {`window.pixelId = "69a7352596ee946eac5f88dd";
        var a = document.createElement("script");
        a.setAttribute("async", "");
        a.setAttribute("defer", "");
        a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
        document.head.appendChild(a);`}
      </Script>
      <SecureHeader/>
      {children}
      <SecureFooter/>
    </>
  )
}
