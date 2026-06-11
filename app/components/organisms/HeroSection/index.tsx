import { prisma } from '@/app/lib/prisma'
import HeroBannerSlider from './HeroBannerSlider'
import Filter from '@/app/components/molecules/Filter'

const Hero = async () => {
  let banners: { id: string; title: string; subtitle: string | null; imageUrl: string; linkUrl: string | null }[] = []
  try {
    banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
      },
    })
  } catch {
    // Fallback to placeholder hero silently
  }

  const hasBanners = banners.length > 0

  return (
    <section aria-label="Seção principal de destaque" className="relative bg-paper w-full overflow-x-clip">
      {/* SLIDE AREA — banner do CMS (desktop apenas, segue config original) */}
      {hasBanners && <HeroBannerSlider banners={banners} />}

      {/* H1 transacional — SEMPRE renderizado (mobile-first SEO).
          Quando há banner ativo no desktop, ele aparece como compact hero
          abaixo do slider. Sem banner, vira o hero completo com gradient. */}
      <div
        className={
          hasBanners
            ? // Compacto quando há banner: barra fina abaixo do slider (visível mobile + desktop)
              'relative w-full bg-gradient-to-br from-bolsa-primary via-bolsa-primary to-blue-900 py-6 md:py-8 overflow-hidden'
            : // Hero completo quando NÃO há banner
              'relative w-full bg-gradient-to-br from-bolsa-primary via-bolsa-primary to-blue-900 overflow-hidden'
        }
      >
        {!hasBanners && (
          <>
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-bolsa-secondary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
            />
          </>
        )}
        <div className={hasBanners ? 'container mx-auto px-4 relative' : 'container mx-auto px-4 py-16 md:py-24 relative'}>
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h1
              className={
                hasBanners
                  ? 'font-display text-2xl md:text-3xl font-semibold text-white leading-tight mb-2'
                  : 'font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-4'
              }
            >
              Bolsas de até <span className="text-bolsa-secondary">80%</span> nas{' '}
              <span className="text-bolsa-secondary">maiores redes de ensino</span> do Brasil
            </h1>
            {!hasBanners && (
              <p className="text-white/85 text-base md:text-lg max-w-2xl leading-relaxed mb-6">
                Compare mensalidades em centenas de cursos de graduação, pós e técnicos.
                Sem ENEM, matrícula 100% online — cadastro grátis.
              </p>
            )}
            {/* Stats strip — densidade marketplace. Sempre visível, dá prova
                social numérica antes do scroll. */}
            <dl className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/95">
              <div className="flex items-baseline gap-1.5">
                <dt className="sr-only">Redes de ensino parceiras</dt>
                <dd className="font-semibold text-base md:text-lg">6</dd>
                <span className="text-white/70 text-sm md:text-base">redes parceiras</span>
              </div>
              <span aria-hidden="true" className="text-white/30">·</span>
              <div className="flex items-baseline gap-1.5">
                <dt className="sr-only">Cidades com polos</dt>
                <dd className="font-semibold text-base md:text-lg">280+</dd>
                <span className="text-white/70 text-sm md:text-base">cidades com polos</span>
              </div>
              <span aria-hidden="true" className="text-white/30">·</span>
              <div className="flex items-baseline gap-1.5">
                <dt className="sr-only">Desconto máximo</dt>
                <dd className="font-semibold text-base md:text-lg">até 80%</dd>
                <span className="text-white/70 text-sm md:text-base">de desconto</span>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* FILTER — abaixo do hero/banner, sem flutuar */}
      <div className="relative z-20 -mt-10 md:-mt-14 pb-16 md:pb-20">
        <Filter />
      </div>
    </section>
  )
}

export default Hero
