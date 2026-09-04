import { getActiveBanners } from '@/app/lib/banners'
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

  // A dobra tem DOIS blocos: banner e card de busca. O terceiro — h1, subtítulo
  // e a linha de estatísticas — foi removido em 03/09 a pedido do Rodrigo: com o
  // banner e a busca ali, o texto não estava puxando peso nenhum.
  //
  // O h1 não sumiu junto. Ele era o ÚNICO da home, que é a página disputando
  // "bolsas de estudo", então passou pro título do card de busca via
  // `asPageHeading` — ver o comentário na chamada do `Filter` abaixo.
  //
  // O card monta SOBRE o banner: parte dentro, parte fora. Antes eram 16px
  // (`-mt-4`), que só encostava, e as duas peças liam como blocos empilhados.
  // Agora ~1/3 do card fica sobre a arte, que é o que dá a costura. O banner
  // resolve em ~1052px (ver HEIGHT_BUDGET_PX) contra os 896px do card: ~78px de
  // moldura de cada lado, para o banner emoldurar em vez de competir.
  //
  // No mobile o banner é `hidden md:block` (nunca existiu arte pra celular), não
  // ocupa espaço no flex, e a busca ganha uma folga normal em vez da negativa.
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

      </div>
    </section>
  )
}

export default Hero
