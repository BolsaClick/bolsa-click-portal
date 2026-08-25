/* eslint-disable @next/next/no-img-element */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'

/**
 * Imagem de compartilhamento da página que disputa o head term "bolsas de
 * estudo".
 *
 * Antes desta rota a página não tinha og:image NENHUMA — declarar `openGraph`
 * no metadata substitui o objeto do layout raiz inteiro, então todo
 * compartilhamento em WhatsApp, Facebook e LinkedIn saía sem preview. Numa
 * página cujo gargalo é autoridade e link, isso desperdiça cada divulgação.
 *
 * Gerada por código (e não um PNG estático) para os números acompanharem o
 * catálogo: a contagem de cidades vem da mesma fonte que a página usa.
 *
 * Convenção de arquivo do Next tem precedência sobre `metadata.openGraph.images`
 * — esta rota é a fonte de verdade da imagem desta página.
 */
export const runtime = 'nodejs' // lê o logo do disco
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt =
  'Bolsas de estudo de até 80% em faculdades reconhecidas pelo MEC — Bolsa Click'

const PAPER = '#F4EFE5'
const INK = '#0B1F3C'
const ACCENT = '#f21d44'

export default async function OGImage() {
  // Logo escuro sobre fundo claro. Lido do disco e embutido como data URI:
  // ImageResponse não busca URL relativa, e uma absoluta dependeria do host
  // estar de pé no momento da geração.
  const logo = await readFile(
    path.join(process.cwd(), 'public/assets/logo-bolsa-click-dark.png'),
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <img src={logoSrc} alt="Bolsa Click" height={64} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Bolsas de estudo
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: ACCENT,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            de até 80%
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ height: 6, width: 72, background: ACCENT }} />
          <div style={{ fontSize: 30, color: INK, opacity: 0.75 }}>
            {`1.000+ cursos · ${BRAZILIAN_CITIES.length} cidades · faculdades reconhecidas pelo MEC`}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
