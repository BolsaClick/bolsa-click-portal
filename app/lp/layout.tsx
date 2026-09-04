import type { Metadata } from 'next'

// Landings de conversão do ingressa.digital (tráfego pago). Servidas neste
// caminho /lp/* e reescritas de ingressa.digital/{parceiro} pelo middleware.
// Layout minimal — sem a nav/footer do site principal.
//
// NOINDEX é o DEFAULT, de propósito. A indexação é decidida por marca em
// `PARTNER_INDEXABLE` (app/lp/_shared/partners.ts) e aplicada no
// `generateMetadata` de cada página, que sobrescreve este valor — no Next o
// metadata é mesclado campo a campo e o segmento mais profundo vence.
//
// Por que default fechado: entre 2026-08-11 e 2026-08-17 este arquivo ficou
// sem `robots`, e o padrão passou a ser "indexável salvo indicação contrária".
// As duas páginas existentes declaravam robots, então nada vazou — mas a
// próxima página criada sob /lp entraria no índice do Google por esquecimento,
// e página de anúncio indexada por acidente canibaliza o SEO do
// bolsaclick.com.br. Esquecer de declarar agora resulta em noindex, que é o
// erro barato.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-ink-900">{children}</div>
}
