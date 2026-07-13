import type { Metadata } from 'next'

// Landings de conversão do ingressa.digital (tráfego pago). Servidas neste
// caminho /lp/* e reescritas de ingressa.digital/{parceiro} pelo middleware.
// NOINDEX: são páginas de anúncio, não devem competir/duplicar com o SEO do
// bolsaclick.com.br. Layout minimal — sem a nav/footer do site principal.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-ink-900">{children}</div>
}
