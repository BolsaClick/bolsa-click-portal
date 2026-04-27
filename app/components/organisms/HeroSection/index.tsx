import { prisma } from '@/app/lib/prisma'
import HeroTextRotator from './HeroTextRotator'
import HeroBannerSlider from './HeroBannerSlider'

const Hero = async () => {
  const theme = process.env.NEXT_PUBLIC_THEME
  const sectionBg = theme === 'anhanguera' ? 'bg-[#d63c06]' : 'bg-emerald-700'

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
    // Fallback to text hero silently
  }

  const hasBanners = banners.length > 0

  return (
    <>
      {/* Text-based hero — always rendered, visible on mobile, hidden on desktop when banners exist */}
      <section
        aria-label="Seção principal de destaque"
        className={`relative ${sectionBg} text-white pt-36 pb-40 ${hasBanners ? 'md:hidden' : ''}`}
      >
        <div className="container mx-auto px-4 pt-10 text-center">
          <div className="h-[200px] md:h-[240px] flex flex-col pb-32 pt-20 md:pb-20 items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bolsa de Estudo em Faculdades com até 95% de Desconto
            </h1>
            <HeroTextRotator />
          </div>
        </div>

        {/* SVG decorativo na base */}
        <div className="absolute bottom-0 left-0 right-0 h-[150px] overflow-hidden z-10">
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
            style={{ height: '150px', width: '100%' }}
          >
            <path
              fill="#F8F8F8"
              d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F8F8F8] z-10" />
        </div>
      </section>

      {/* Banner slider — desktop only, lazy loaded */}
      {hasBanners && <HeroBannerSlider banners={banners} />}
    </>
  )
}

export default Hero
