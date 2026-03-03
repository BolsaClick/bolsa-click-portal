import { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import MatriculaSuccessClient from './MatriculaSuccessClient'

export const metadata: Metadata = {
  title: 'Inscrição Realizada com Sucesso',
}

export default function MatriculaSuccessPage() {
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
      <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
        <MatriculaSuccessClient />
      </Suspense>
    </>
  )
}

