import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import { ACADEMIC_LEVEL, isProfissionalizanteLevel } from '@/app/lib/academic-level'
import { capitalizeText, removeCourseSuffix } from '@/app/lib/seo/course-search-params'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import {
  OG_SIZE,
  OgCanvas,
  OgLogoRow,
  OgKicker,
  OgHeading,
  OgFooterMeta,
  getBolsaClickLogoDataUri,
} from '@/app/lib/og/shared'

export const runtime = 'nodejs'

/**
 * Imagem de compartilhamento de `/curso/resultado` — a página MAIS VISITADA
 * do site. Não existe como `opengraph-image.tsx` de propósito: essa rota é
 * dirigida inteiramente por query string (`?c=&cidade=&estado=&modalidade=&nivel=`),
 * e a convenção de arquivo de imagem do Next só recebe `params` de segmento
 * dinâmico — nunca `searchParams` (nem via `layout.tsx`, que também não
 * recebe query). Uma Route Handler comum, como esta, não tem essa limitação:
 * lê a query igual a qualquer outra API.
 *
 * `page.tsx` (`generateMetadata`) monta esta URL reaproveitando o mesmo
 * `canonicalParams` da própria página — o texto normalizado (`c`, `cidade`,
 * `estado`...) já vem daquela função, então o nome exibido aqui é
 * exatamente o que a página mostra, sem duplicar a validação geográfica.
 *
 * Sem preço: a busca usa duas APIs externas (Tartarus + Athena) sem cache
 * dedicado pra esta rota. Chamar isso a cada geração de imagem — potencialmente
 * a cada crawl de WhatsApp/Facebook/AI bot na página de maior tráfego —
 * arriscaria lentidão e custo real sem necessidade: o card já comunica o
 * teto de desconto verificado (`DISCOUNT_CEILING_PCT`), e o preço exato
 * continua na própria página.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const curso = searchParams.get('c') ?? ''
  const cidade = searchParams.get('cidade') ?? ''
  const estado = searchParams.get('estado') ?? ''
  const modalidade = searchParams.get('modalidade') || 'EAD'
  const nivel = searchParams.get('nivel') || 'GRADUACAO'

  const courseName = curso ? capitalizeText(removeCourseSuffix(curso)) : ''
  const modalidadeFormatted = capitalizeText(modalidade === 'EAD' ? 'A Distância' : modalidade)
  const isProfessionalizingLevel = isProfissionalizanteLevel(nivel)
  const isTecnicoLevel = nivel === ACADEMIC_LEVEL.CURSO_TECNICO || nivel === ACADEMIC_LEVEL.TECNICO
  const courseType = nivel === ACADEMIC_LEVEL.POS_GRADUACAO
    ? 'Pós-graduação'
    : isProfessionalizingLevel
      ? 'Profissionalizante'
      : isTecnicoLevel
        ? 'Técnico'
        : 'Graduação'

  const logoSrc = await getBolsaClickLogoDataUri()

  const kicker = cidade && estado ? `${courseType} · ${cidade}-${estado}` : `${courseType} · ${modalidadeFormatted}`
  const headingSize = courseName.length > 26 ? 56 : courseName.length > 16 ? 66 : 80

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        {courseName ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <OgKicker>{kicker}</OgKicker>
            <OgHeading line1={courseName} size={headingSize} />
          </div>
        ) : (
          <OgHeading line1="Bolsa de estudo" line2="em faculdades" size={80} />
        )}
        <OgFooterMeta>
          {`Até ${DISCOUNT_CEILING_PCT}% de desconto · faculdades reconhecidas pelo MEC`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    {
      ...OG_SIZE,
      // A combinação de curso×cidade×modalidade×nível é praticamente
      // ilimitada — sem cache, cada crawl (WhatsApp, Facebook, bots de IA)
      // na página de maior tráfego do site regeneraria a imagem do zero.
      // 1h no browser, 1 dia na CDN, com stale-while-revalidate de 7 dias.
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
