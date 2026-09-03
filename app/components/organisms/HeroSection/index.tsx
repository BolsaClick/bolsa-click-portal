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

  // Ordem visual dos três blocos (decisão de produto, 2026-09, referência:
  // home do Quero Bolsa) muda por breakpoint E por `hasBanners`, mas o DOM
  // continua com um h1 SÓ (nunca duplicado — ruim pra SEO/a11y). Resolvido
  // com `order` do flexbox, não com duas cópias do conteúdo:
  //
  // - Sem banner (`hasBanners === false`): conteúdo (h1+estatísticas) vem
  //   ANTES da busca, em QUALQUER breakpoint. Sem vão órfão, sem margem
  //   negativa pendurada — o card de busca só tem uma folga normal
  //   (`mt-4 md:mt-6`) depois do conteúdo.
  // - Com banner (`hasBanners === true`):
  //   - Mobile: o banner é `hidden md:block` (nunca existiu arte pra
  //     celular) — não ocupa espaço no flex, então a ordem visível é
  //     conteúdo → busca, igual ao caso sem banner.
  //   - Desktop (`md+`): banner → busca (sobreposta 16px na borda inferior
  //     do banner, a costura já combinada) → conteúdo, agora abaixo do
  //     card, sobre o fundo cinza-claro da tarja.
  const contentOrderClass = hasBanners ? 'order-1 md:order-3' : 'order-1'
  const contentTopSpacingClass = hasBanners ? 'mt-0 md:mt-8' : 'mt-0'
  // O card de busca monta SOBRE o banner: parte dentro, parte fora. Antes eram
  // 16px (`-mt-4`), que só encostava — as duas peças liam como blocos empilhados.
  // Agora ~1/3 do card fica sobre a arte, que é o que dá a costura. O banner é
  // `max-w-screen-xl` e o card `max-w-4xl`, então a diferença de largura também
  // é visível: o banner emoldura o card em vez de competir com ele.
  const searchTopSpacingClass = hasBanners
    ? 'mt-4 md:mt-0 md:-mt-16 lg:-mt-24'
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

        {/* BUSCA — card do `Filter` (não alterado). Com banner, sobe 16px
            pra costurar na borda inferior dele (`md:-mt-4`); sem banner,
            seguido do conteúdo com uma folga normal, nunca negativa. */}
        <div className={`relative z-20 order-2 ${searchTopSpacingClass}`}>
          {/* `asPageHeading` move o h1 da home pra cá. O bloco de texto que o
              carregava saiu da dobra (decisão do Rodrigo, 03/09: o banner e a
              busca bastam ali), mas a home não pode ficar SEM h1 — ela é a
              página que disputa "bolsas de estudo". */}
          <Filter asPageHeading />
        </div>

        {/* CONTEÚDO — h1 real (crítico pra SEO/GEO: estamos disputando a
            busca "bolsas de estudo") + subtítulo + estatísticas, sobre o
            fundo `bg-mist` (cinza muito claro e frio, puxado pro azul da
            marca — ver token `mist` no tailwind.config) da seção inteira.
            Deixou de ser o bloco grande centralizado com gradiente azul:
            agora é uma faixa compacta, tipografia menor, discreta — mas
            SEMPRE texto real e visível (nunca `sr-only`, nunca dentro de
            imagem): é o único h1 da home e o domínio precisa do sinal.
            Mesmo texto de sempre, mesmo percentual (via
            `DISCOUNT_CEILING_PCT`, nunca chumbado), mesma prova social —
            sem copy nova. */}
        <div
          className={`relative mx-auto w-full max-w-screen-lg px-4 py-5 sm:px-6 md:py-4 lg:px-8 ${contentOrderClass} ${contentTopSpacingClass}`}
        >
          {/* No mobile (abaixo de `md`) essa é a única prova social que a
              maioria dos visitantes vê antes de rolar — o banner de
              campanha é desktop-only. Por isso vira grade 2×2 de cartões
              (já em produção) em vez da linha corrida de texto: mais
              escaneável num relance. A partir de `md` volta a ser a linha
              original com separadores "·". Números e textos são os mesmos
              de sempre — só a paleta muda (fundo claro agora, não mais
              vidro sobre azul). */}
          <dl className="grid grid-cols-2 gap-1.5 w-full max-w-[22rem] md:flex md:w-auto md:max-w-none md:flex-wrap md:items-center md:gap-x-5 md:gap-y-1.5 lg:gap-x-6 text-ink-900">
            <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white border border-ink-100 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
              <dt className="sr-only">Redes de ensino parceiras</dt>
              <dd className="font-semibold text-sm whitespace-nowrap">6</dd>
              <span className="text-ink-500 text-xs whitespace-nowrap">redes parceiras</span>
            </div>
            <span aria-hidden="true" className="hidden md:inline text-ink-300">·</span>
            <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white border border-ink-100 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
              <dt className="sr-only">Cidades com polos</dt>
              <dd className="font-semibold text-sm whitespace-nowrap">280+</dd>
              <span className="text-ink-500 text-xs whitespace-nowrap">cidades com polos</span>
            </div>
            <span aria-hidden="true" className="hidden md:inline text-ink-300">·</span>
            <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white border border-ink-100 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
              <dt className="sr-only">Desconto máximo</dt>
              <dd className="font-semibold text-sm whitespace-nowrap">até {DISCOUNT_CEILING_PCT}%</dd>
              <span className="text-ink-500 text-xs whitespace-nowrap">de desconto</span>
            </div>
            <span aria-hidden="true" className="hidden md:inline text-ink-300">·</span>
            <div className="flex flex-wrap items-baseline justify-center gap-1.5 rounded-lg bg-white border border-ink-100 px-2 py-1 md:flex-nowrap md:justify-start md:rounded-none md:bg-transparent md:border-0 md:px-0 md:py-0">
              <dt className="sr-only">Mensalidade mínima com bolsa</dt>
              <dd className="font-semibold text-sm whitespace-nowrap">a partir de R$99/mês</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

export default Hero
