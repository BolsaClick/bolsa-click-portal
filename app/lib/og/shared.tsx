/* eslint-disable @next/next/no-img-element */
/**
 * Base compartilhada das imagens de Open Graph (WhatsApp/Facebook/LinkedIn/X)
 * geradas por código com `ImageResponse` (next/og).
 *
 * Todo `opengraph-image.tsx` do site deve montar sua imagem a partir destas
 * peças em vez de reimplementar fundo/logo/tipografia — é o que garante que
 * quem vir vários links do Bolsa Click no WhatsApp reconheça que são do
 * mesmo site. Padrão originado em `app/bolsas-de-estudo/opengraph-image.tsx`.
 *
 * Cores e fonte de verdade do desconto (`DISCOUNT_CEILING_PCT`) vêm de
 * `app/lib/copy/claims.ts` — nunca hardcodear 80/85/92 aqui ou em quem
 * consome este módulo.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ReactNode } from 'react'
import { seoSite } from '@/app/lib/seo/site-config'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png' as const

export const OG_PAPER = '#F4EFE5'
export const OG_INK = '#0B1F3C'
export const OG_ACCENT = '#f21d44'
export const OG_MUTED = '#5A6B82'

/**
 * Logo embutido como data URI. `ImageResponse` roda no servidor sem fetch de
 * URL relativa — e uma URL absoluta dependeria do host estar de pé no
 * momento exato da geração — então lemos do disco. Cacheado em memória do
 * processo: paga o custo de I/O uma vez por instância viva, não a cada
 * imagem gerada.
 *
 * Este módulo (e o restante das imagens OG do site) foi desenhado pro tema
 * `bolsaclick`, com o logo ESCURO (contraste pro fundo papel claro). O código
 * é compartilhado com as builds `bolsamais`/`anhanguera` (mesmo repo,
 * `NEXT_PUBLIC_THEME`) via rotas como `/cursos/[slug]` — pra essas, cai pro
 * logo genérico de `seoSite.logo` (sem variante escura própria) em vez de
 * vazar a marca Bolsa Click pra outro site. Não é redesenho completo por
 * marca — fora do escopo deste trabalho, que é bolsaclick.com.br.
 */
let cachedLogoDataUri: string | null = null
let cachedLogoKey: string | null = null
export async function getBolsaClickLogoDataUri(): Promise<string> {
  if (cachedLogoDataUri && cachedLogoKey === seoSite.key) return cachedLogoDataUri
  const relativePath =
    seoSite.key === 'bolsaclick'
      ? 'public/assets/logo-bolsa-click-dark.png'
      : `public${new URL(seoSite.logo).pathname}`
  const logo = await readFile(path.join(process.cwd(), relativePath))
  cachedLogoDataUri = `data:image/png;base64,${logo.toString('base64')}`
  cachedLogoKey = seoSite.key
  return cachedLogoDataUri
}

/**
 * Moldura padrão: fundo papel, padding, coluna flex, fonte sans-serif do
 * sistema (sem custo de embutir uma fonte custom — next/og já usa uma fonte
 * embutida sensata como fallback, e o objetivo aqui é legibilidade em
 * miniatura, não fidelidade tipográfica).
 */
export function OgCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: OG_PAPER,
        padding: '64px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      {children}
    </div>
  )
}

/** Linha do topo com o logo da marca. */
export function OgLogoRow({ logoSrc }: { logoSrc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={logoSrc} alt="Bolsa Click" height={64} />
    </div>
  )
}

/** Rótulo pequeno em caixa alta com marcador — "Teste vocacional · Bolsa Click". */
export function OgKicker({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 20,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: OG_ACCENT,
        fontWeight: 700,
      }}
    >
      <div style={{ width: 8, height: 8, background: OG_ACCENT, borderRadius: 999 }} />
      {children}
    </div>
  )
}

/**
 * Título grande de duas linhas — primeira linha tinta, segunda (opcional)
 * acento. Tamanho pensado pra miniatura do WhatsApp: nunca abaixo de ~48px
 * pro texto principal.
 */
export function OgHeading({
  line1,
  line2,
  size = 76,
}: {
  line1: string
  line2?: string
  size?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          color: OG_INK,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        }}
      >
        {line1}
      </div>
      {line2 ? (
        <div
          style={{
            fontSize: size,
            fontWeight: 700,
            color: OG_ACCENT,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        >
          {line2}
        </div>
      ) : null}
    </div>
  )
}

/** Rodapé padrão: traço de acento + linha de metadados/estatísticas reais. */
export function OgFooterMeta({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ height: 6, width: 72, background: OG_ACCENT }} />
      <div style={{ display: 'flex', fontSize: 28, color: OG_INK, opacity: 0.75 }}>
        {children}
      </div>
    </div>
  )
}

/** Pílula de destaque (ex.: badge de desconto) — sempre a partir de um valor real. */
export function OgPill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 24px',
        background: OG_ACCENT,
        color: OG_PAPER,
        fontSize: 30,
        fontWeight: 700,
        borderRadius: 999,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Fallback mínimo pra quando a rota não resolve entidade nenhuma (ex.: slug
 * inválido acessado direto na URL da imagem). Nunca deixa o crawler receber
 * um erro 500 nem um card vazio — mostra a marca.
 */
export async function OgNotFoundFrame({ label }: { label: string }) {
  const logoSrc = await getBolsaClickLogoDataUri()
  return (
    <OgCanvas>
      <OgLogoRow logoSrc={logoSrc} />
      <OgHeading line1={label} />
      <OgFooterMeta>bolsaclick.com.br</OgFooterMeta>
    </OgCanvas>
  )
}
