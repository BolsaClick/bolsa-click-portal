import { getActiveBanners } from '@/app/lib/banners'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import HeroBannerSlider from './HeroBannerSlider'
import Filter from '@/app/components/molecules/Filter'

const Hero = async () => {
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = []
  try {
    banners = await getActiveBanners()
  } catch {
    // Fallback to placeholder hero silently
  }
  const hasBanners = banners.length > 0

  // H1 transacional + prova social — SEMPRE renderizado (mobile-first SEO).
  // Com banner ativo, esse bloco vira o `overlay` do carrossel: título e
  // números vivem SOBRE a imagem (não numa faixa separada abaixo dela), pra
  // a proposta de valor responder ao visitante antes da dobra.
  const heroOverlay = (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-2.5 text-center sm:gap-3">
      <h1 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
        Bolsas de até <span className="text-bolsa-secondary">{DISCOUNT_CEILING_PCT}%</span> nas{' '}
        <span className="text-bolsa-secondary">maiores redes de ensino</span> do Brasil
      </h1>
      {/* Stats strip — densidade marketplace. Sempre visível, dá prova
          social numérica antes do scroll. */}
      <dl className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-white sm:gap-x-6">
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Redes de ensino parceiras</dt>
          <dd className="text-sm font-semibold sm:text-base md:text-lg">6</dd>
          <span className="text-xs text-white/75 sm:text-sm md:text-base">redes parceiras</span>
        </div>
        <span aria-hidden="true" className="text-white/40">
          ·
        </span>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Cidades com polos</dt>
          <dd className="text-sm font-semibold sm:text-base md:text-lg">280+</dd>
          <span className="text-xs text-white/75 sm:text-sm md:text-base">cidades com polos</span>
        </div>
        <span aria-hidden="true" className="text-white/40">
          ·
        </span>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Desconto máximo</dt>
          <dd className="text-sm font-semibold sm:text-base md:text-lg">até {DISCOUNT_CEILING_PCT}%</dd>
          <span className="text-xs text-white/75 sm:text-sm md:text-base">de desconto</span>
        </div>
        <span aria-hidden="true" className="text-white/40">
          ·
        </span>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Mensalidade mínima com bolsa</dt>
          <dd className="text-sm font-semibold sm:text-base md:text-lg">a partir de R$99/mês</dd>
        </div>
      </dl>
    </div>
  )

  return (
    <section aria-label="Seção principal de destaque" className="relative bg-paper w-full overflow-x-clip">
      {/* SLIDE AREA — carrossel de banners do CMS. Visível em qualquer
          viewport (mobile inclusive — 74% do tráfego): cada slide pede a
          imagem no tamanho certo via `sizes` do next/image, então o celular
          não baixa a imagem "desktop" inteira. Título + prova social vivem
          SOBRE a imagem via `overlay` (ver comentário no HeroBannerSlider). */}
      {hasBanners && <HeroBannerSlider banners={banners} overlay={heroOverlay} />}

      {/* Hero completo com gradient — só quando NÃO há banner ativo (fallback). */}
      {!hasBanners && (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-bolsa-primary via-bolsa-primary to-blue-900">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-bolsa-secondary/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
          />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-4">
                Bolsas de até <span className="text-bolsa-secondary">{DISCOUNT_CEILING_PCT}%</span> nas{' '}
                <span className="text-bolsa-secondary">maiores redes de ensino</span> do Brasil
              </h1>
              <p className="text-white/85 text-base md:text-lg max-w-2xl leading-relaxed mb-6">
                Mensalidades a partir de R$99/mês em faculdades reconhecidas pelo MEC.
                Cadastro grátis, sem taxa de adesão. EAD ou presencial.
              </p>
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
                  <dd className="font-semibold text-base md:text-lg">até {DISCOUNT_CEILING_PCT}%</dd>
                  <span className="text-white/70 text-sm md:text-base">de desconto</span>
                </div>
                <span aria-hidden="true" className="text-white/30">·</span>
                <div className="flex items-baseline gap-1.5">
                  <dt className="sr-only">Mensalidade mínima com bolsa</dt>
                  <dd className="font-semibold text-base md:text-lg">a partir de R$99/mês</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* FILTER — abaixo do hero/banner, flutuando por cima da borda inferior
          da imagem (-mt) pra costurar visualmente o bloco de imagem+texto
          com o card de busca. */}
      <div className="relative z-20 -mt-10 md:-mt-14 pb-16 md:pb-20">
        <Filter />
      </div>
    </section>
  )
}

export default Hero
