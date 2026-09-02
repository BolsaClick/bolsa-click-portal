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

  return (
    <section aria-label="Seção principal de destaque" className="relative bg-paper w-full overflow-x-clip pb-16 md:pb-20">
      {/* FAIXA AZUL — h1 real (crítico pra SEO/GEO: estamos disputando a
          busca "bolsas de estudo") + strip de estatísticas. Busca primeiro
          (decisão de produto, 2026-09): esse bloco e o card de busca vêm
          ANTES do carrossel de banners publicitários — a busca é a porta de
          conversão principal e não pode nascer depois de uma peça de UMA
          campanha. Antes o h1 só existia como `sr-only` quando havia banner
          ativo (pra não competir visualmente com o criativo do parceiro);
          como o card de busca agora fica entre os dois, essa concorrência
          não existe mais, então o h1 fica sempre visível. Renderiza
          incondicionalmente — não só no fallback sem banner — e é o mesmo
          bloco de sempre (mesmo texto, mesma prova social, sem copy nova). */}
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
            {/* No mobile (abaixo de `md`) essa é a única prova social que a
                maioria dos visitantes vê antes de rolar — o banner de
                campanha é desktop-only. Por isso vira grade 2×2 de cartões
                (`bg-white/10`, mesmo padrão de "vidro" já usado no projeto
                sobre fundo colorido) em vez da linha corrida de texto: mais
                escaneável num relance, sem aumentar a altura da faixa mais
                que alguns px. A partir de `md` volta a ser exatamente a
                linha original com separadores "·" — não compete com o
                banner, que só existe nesse breakpoint. Números e textos são
                os mesmos de sempre. */}
            <dl className="grid grid-cols-2 gap-1 w-full max-w-[22rem] mx-auto md:flex md:w-auto md:max-w-none md:mx-0 md:flex-wrap md:items-center md:justify-center md:gap-x-6 md:gap-y-2 text-white/95">
              <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
                <dt className="sr-only">Redes de ensino parceiras</dt>
                <dd className="font-semibold text-base md:text-lg whitespace-nowrap md:whitespace-normal">6</dd>
                <span className="text-white/70 text-sm md:text-base whitespace-nowrap md:whitespace-normal">redes parceiras</span>
              </div>
              <span aria-hidden="true" className="hidden md:inline text-white/30">·</span>
              <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
                <dt className="sr-only">Cidades com polos</dt>
                <dd className="font-semibold text-base md:text-lg whitespace-nowrap md:whitespace-normal">280+</dd>
                <span className="text-white/70 text-sm md:text-base whitespace-nowrap md:whitespace-normal">cidades com polos</span>
              </div>
              <span aria-hidden="true" className="hidden md:inline text-white/30">·</span>
              <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
                <dt className="sr-only">Desconto máximo</dt>
                <dd className="font-semibold text-base md:text-lg whitespace-nowrap md:whitespace-normal">até {DISCOUNT_CEILING_PCT}%</dd>
                <span className="text-white/70 text-sm md:text-base whitespace-nowrap md:whitespace-normal">de desconto</span>
              </div>
              <span aria-hidden="true" className="hidden md:inline text-white/30">·</span>
              <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
                <dt className="sr-only">Mensalidade mínima com bolsa</dt>
                <dd className="font-semibold text-base md:text-lg">a partir de R$99/mês</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* FILTER — card de busca, logo abaixo da faixa azul. Sobe por cima da
          borda inferior da faixa (-mt-10/-mt-14, tratamento existente) pra
          costurar visualmente os dois blocos. Fica por cima de tudo (z-20)
          — inclusive do banner, que vem a seguir só em telas md+. */}
      <div className="relative z-20 -mt-10 md:-mt-14">
        <Filter />
      </div>

      {/* BANNER — carrossel de banners do CMS, agora ABAIXO do card de
          busca e só em telas md+ (o próprio HeroBannerSlider já é
          `hidden md:block` — não há arte pensada pra celular). Em telas
          md+, encaixa 16px por baixo da borda inferior do card (`md:-mt-4`,
          fixo — decisão do dono do produto) pra costurar visualmente o card
          com o banner; o card fica por cima (z-20 acima) porque só o topo
          do banner — onde mora só a logo do parceiro — fica coberto, nunca
          o cupom nem o CTA, que ficam na base da arte. Sem `md:`, essa
          margem negativa não existe: no mobile o banner não renderiza, e a
          dobra vai direto da faixa pro card, sem vão nem costura órfã. */}
      {hasBanners && (
        <div className="relative md:-mt-4">
          <HeroBannerSlider banners={banners} />
        </div>
      )}
    </section>
  )
}

export default Hero
