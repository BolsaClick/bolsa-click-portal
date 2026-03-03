// app/graduacao/page.tsx
import { Metadata } from 'next'
import SuccessClient from './SuccessClient'
import { Suspense } from 'react'
import Script from 'next/script'


export const metadata: Metadata = {
  title: 'Parabéns | Bolsa Click',
  description: 'Sua matrícula foi realizada com sucesso, fique atento ao seu e-mail para mais informações.',
}

export default function Page() {
  return <>
    <Script id="utmify-pixel" strategy="afterInteractive">
      {`window.pixelId = "69a7352596ee946eac5f88dd";
      var a = document.createElement("script");
      a.setAttribute("async", "");
      a.setAttribute("defer", "");
      a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
      document.head.appendChild(a);`}
    </Script>
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando confirmação...</div>}>
      <SuccessClient />
    </Suspense>
  </>
}
