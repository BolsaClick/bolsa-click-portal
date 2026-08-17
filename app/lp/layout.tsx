// Landings de conversão do ingressa.digital (tráfego pago). Servidas neste
// caminho /lp/* e reescritas de ingressa.digital/{parceiro} pelo middleware.
// Layout minimal — sem a nav/footer do site principal.
//
// Indexação é DECIDIDA POR MARCA, não aqui: cada `generateMetadata` de
// page.tsx define `robots` a partir de `isIndexable(partner)`
// (app/lp/_shared/partners.ts). Antes deste layout forçava noindex global —
// removido em 2026-08-11 quando a Estácio virou a 1ª marca indexável.
export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-ink-900">{children}</div>
}
