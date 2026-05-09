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
    <section aria-label="Seção principal de destaque" className="relative bg-paper">
      {/* SLIDE AREA — banner do CMS quando existir, senão um placeholder editorial */}
      {hasBanners ? (
        <HeroBannerSlider banners={banners} />
      ) : (
        <div className="relative bg-gradient-to-br from-bolsa-primary via-bolsa-primary to-blue-900 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-bolsa-secondary/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
          />
          <div className="container mx-auto px-4 py-20 md:py-28 relative">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-5">
                A bolsa de estudo{' '}
                <span className="italic text-white/85">que cabe no seu plano.</span>
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                Compare ofertas de mais de 30 mil faculdades em todo o Brasil. Sem ENEM, sem fila,
                sem complicação — você escolhe, a gente cuida do resto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FILTER — abaixo do slide, sem flutuar */}
      <div className="relative z-20 -mt-10 md:-mt-14 pb-16 md:pb-20">
        <Filter />
      </div>
    </section>
  )
}

export default Hero
