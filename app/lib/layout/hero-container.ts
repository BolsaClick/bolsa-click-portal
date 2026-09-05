/**
 * Container lateral COMPARTILHADO pela dobra do Hero.
 *
 * O banner (`app/components/organisms/HeroSection/HeroBannerSlider.tsx`) e o
 * card de busca (`app/components/molecules/Filter/index.tsx`) precisam ter
 * exatamente a MESMA largura e as MESMAS bordas laterais — decisão do CEO em
 * 09/2026: as duas peças devem ler como um bloco só, não como uma moldura em
 * volta de um widget mais estreito.
 *
 * Por isso a classe mora aqui, num lugar só. Quem mudar `max-w` ou o padding
 * lateral muda para os dois ao mesmo tempo, e eles não voltam a divergir na
 * próxima mexida. NÃO copie estes valores para dentro dos componentes.
 *
 * A fila de selos de confiança do `HeroSection` usa o mesmo container, pelo
 * mesmo motivo: as três peças da dobra compartilham a coluna.
 */
export const HERO_CONTAINER_CLASS = 'mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8'
