import { BadgePercent, Building2, Zap } from 'lucide-react'

import { getActiveBanners } from '@/app/lib/banners'
import HeroBannerSlider from './HeroBannerSlider'
import { HERO_CONTAINER_CLASS } from '@/app/lib/layout/hero-container'
import Filter from '@/app/components/molecules/Filter'

// Selos de confiança: a terceira peça da dobra, logo abaixo do card de busca e
// sobre o `bg-mist`. Vem da referência aprovada pelo Rodrigo em 09/2026 — três
// itens lado a lado separados por hairlines verticais. Fica AQUI, e não na
// home, pra entrar entre o card e a fila de atalhos de curso (que vive em
// `app/(default)/page.tsx`, logo depois desta section).
const TRUST_BADGES = [
  {
    Icon: Building2,
    title: 'As melhores faculdades',
    support: 'Parcerias com instituições reconhecidas',
  },
  {
    Icon: BadgePercent,
    title: 'Descontos de verdade',
    support: 'Compare e economize',
  },
  {
    Icon: Zap,
    title: 'Processo rápido e online',
    support: 'Sua bolsa em poucos cliques',
  },
]

const Hero = async () => {
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = []
  try {
    banners = await getActiveBanners()
  } catch {
    // Fallback to placeholder hero silently
  }

  const hasBanners = banners.length > 0

  // A dobra tem TRÊS blocos: banner, card de busca e a fila de selos de
  // confiança. O bloco de h1 + subtítulo + estatísticas foi removido em 03/09 a
  // pedido do Rodrigo: com o banner e a busca ali, o texto não puxava peso.
  //
  // O h1 não sumiu junto. Ele era o ÚNICO da home, que é a página disputando
  // "bolsas de estudo", então passou pro título do card de busca via
  // `asPageHeading` — ver o comentário na chamada do `Filter` abaixo.
  //
  // O card monta SOBRE o banner: parte dentro, parte fora. Os valores já foram
  // 16px (`-mt-4`, que só encostava) e depois 64/96px (`-mt-16 lg:-mt-24`, que
  // comia quase metade da arte). Em 09/2026 baixaram pra 32/48px: na referência
  // aprovada o card apenas ENCOSTA na borda de baixo do banner — na conta atual
  // fica algo em torno de 1/5 da altura do card sobre a arte, nunca mais de um
  // terço. Banner, card e selos dividem a MESMA largura — `HERO_CONTAINER_CLASS`,
  // decisão do CEO em 09/2026 — então não há mais moldura lateral: as bordas dos
  // três batem e a dobra lê como um bloco só. Quem mexer na largura mexe lá, num
  // lugar só, e as três peças acompanham.
  //
  // No mobile o banner é `hidden md:block` (nunca existiu arte pra celular), não
  // ocupa espaço no flex, e a busca ganha uma folga normal em vez da negativa.
  // NÃO reintroduza `md:mt-0` aqui. Ele e `md:-mt-8` mexem na MESMA propriedade
  // no MESMO breakpoint, então quem vence é quem sai depois no CSS gerado — não
  // quem vem depois nesta string. Medido em 09/2026: o Tailwind emitia
  // `.md\:-mt-8` ANTES de `.md\:mt-0`, o `mt-0` ganhava, e a sobreposição do
  // card sobre o banner virava 0px em silêncio. O `mt-4` do mobile já é
  // sobrescrito pela negativa a partir de `md`; não precisa de zero no meio.
  const searchTopSpacingClass = hasBanners
    ? 'mt-4 md:-mt-8 lg:-mt-12'
    : 'mt-4 md:mt-6'

  return (
    <section aria-label="Seção principal de destaque" className="relative bg-mist w-full overflow-x-clip pb-16 md:pb-20">
      <div className="relative flex flex-col pt-4 md:pt-6">
        {/* BANNER — peça CONTIDA do parceiro (margem lateral, cantos
            arredondados — ver `HeroBannerSlider`), não mais sangrada.
            Só existe (e só ocupa espaço) em telas `md+`; sem banners
            ativos, este bloco simplesmente não renderiza. */}
        {hasBanners && (
          <div className="order-1">
            <HeroBannerSlider banners={banners} />
          </div>
        )}

        {/* BUSCA — card do `Filter`. Com banner, sobe 32/48px pra costurar na
            borda inferior dele; sem banner, segue o conteúdo com uma folga
            normal, nunca negativa. */}
        <div className={`relative z-20 order-2 ${searchTopSpacingClass}`}>
          {/* `asPageHeading` move o h1 da home pra cá. O bloco de texto que o
              carregava saiu da dobra (decisão do Rodrigo, 03/09: o banner e a
              busca bastam ali), mas a home não pode ficar SEM h1 — ela é a
              página que disputa "bolsas de estudo". */}
          <Filter asPageHeading />
        </div>

        {/* SELOS — mesma largura do banner e do card (HERO_CONTAINER_CLASS). */}
        <div className="order-3 mt-8 md:mt-12">
          <div className={HERO_CONTAINER_CLASS}>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink-100">
              {TRUST_BADGES.map(({ Icon, title, support }) => (
                <li key={title} className="flex items-center gap-3 sm:px-5 lg:px-8">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-bolsa-primary">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-ink-900">{title}</p>
                    <p className="text-[13px] leading-snug text-ink-500">{support}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
