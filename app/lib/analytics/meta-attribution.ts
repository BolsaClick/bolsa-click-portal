import type { NextRequest } from 'next/server'

/**
 * Identificadores de navegador que a Meta usa para atribuir uma conversão ao
 * anúncio que a gerou — capturados na CRIAÇÃO da cobrança e persistidos, para
 * serem relidos na CONFIRMAÇÃO.
 *
 * Por que existe: o `Purchase` do portal não sai de uma request do visitante.
 * Ele sai de `confirm-estacio.ts` / `confirm-matricula.ts`, que rodam por
 * webhook do Elysium e por polling — sem browser do outro lado. `_fbp` e `_fbc`
 * são cookies, e `client_ip_address`/`client_user_agent` vêm de headers: nada
 * disso existe naquele instante. Procurá-los na hora da confirmação é procurar
 * um navegador que já foi embora.
 *
 * Medido em 2026-09-08 no painel de qualidade do pixel `3830716730578943`:
 * das 7 chamadas de `sendFacebookEvent` do portal, as duas ÚNICAS sem esses
 * campos eram justamente os dois `Purchase` — o evento pelo qual as campanhas
 * otimizam. Todo `Lead` já os enviava, porque nasce dentro da request.
 *
 * Consequência dupla de não mandar:
 *  1. Sem `fbc` não há id do clique no anúncio, e a Meta não fecha o ciclo
 *     entre a verba gasta e a compra — a campanha otimiza às cegas.
 *  2. Com `action_source: 'website'` e nenhum de `client_ip_address`,
 *     `client_user_agent`, `fbc` ou `fbp`, a Meta pode RECUSAR o payload como
 *     incompleto. Como `sendFacebookEvent` é best-effort e só faz
 *     `console.error`, a recusa é invisível nos dois lados.
 *
 * Onde mora: `Transaction.metadata.metaAttribution`, chave própria e irmã de
 * `metadata.estacio` / `metadata.confirm`. Fora do blob de inscrição de
 * propósito — o blob é "o que a Athena/Cogna precisa para inscrever", isto é
 * rastreio, e os dois fluxos leem a mesma chave.
 */

/** Chave em `Transaction.metadata` onde a atribuição é persistida. */
export const META_ATTRIBUTION_KEY = 'metaAttribution'

export interface MetaAttribution {
  /** Cookie `_fbp` (id de navegador do pixel). */
  fbp?: string
  /** Cookie `_fbc`, ou o valor sintetizado a partir do `fbclid` da URL. */
  fbc?: string
  clientIp?: string
  userAgent?: string
  /** URL onde a cobrança nasceu — a página de checkout, não a de sucesso. */
  eventSourceUrl?: string
}

/**
 * O que o navegador manda no corpo do charge. Complementa (não substitui) os
 * cookies da própria request: o `_fbc` pode NÃO existir como cookie quando o
 * pixel carregou depois do consentimento, e nesse caso o cliente manda um
 * valor montado a partir do `fbclid` da URL de chegada (ver `fbq.ts`).
 */
export interface MetaBrowserIds {
  fbp?: string
  fbc?: string
}

function limpar(valor: string | undefined | null): string | undefined {
  const v = valor?.trim()
  return v ? v : undefined
}

/**
 * Monta a atribuição no momento em que a cobrança é criada, juntando o que o
 * navegador informou com o que a própria request carrega.
 *
 * Precedência de `fbp`/`fbc`: o valor do CLIENTE ganha do cookie da request.
 * Não é arbitrário — o cliente já resolve `cookie ?? fbclid sintetizado`, então
 * quando ele manda algo é o cookie ou o único identificador que existe. O
 * cookie da request é o fallback para quem chama sem passar `browserIds`.
 */
export function metaAttributionFromRequest(
  request: NextRequest,
  browserIds?: MetaBrowserIds,
): MetaAttribution {
  const clientIp =
    limpar(request.headers.get('x-forwarded-for')?.split(',')[0]) ??
    limpar(request.headers.get('x-real-ip'))

  return {
    fbp: limpar(browserIds?.fbp) ?? limpar(request.cookies.get('_fbp')?.value),
    fbc: limpar(browserIds?.fbc) ?? limpar(request.cookies.get('_fbc')?.value),
    clientIp,
    userAgent: limpar(request.headers.get('user-agent')),
    eventSourceUrl: limpar(request.headers.get('referer')),
  }
}

/**
 * Relê a atribuição de `Transaction.metadata` na confirmação.
 *
 * Devolve um objeto vazio — nunca lança — para transações criadas antes desta
 * mudança, ou por fluxos que não a gravam. Um `Purchase` sem estes campos é
 * pior que um com eles, mas melhor que uma inscrição derrubada por um parse.
 */
export function readMetaAttribution(metadata: unknown): MetaAttribution {
  if (!metadata || typeof metadata !== 'object') return {}
  const bruto = (metadata as Record<string, unknown>)[META_ATTRIBUTION_KEY]
  if (!bruto || typeof bruto !== 'object') return {}

  const obj = bruto as Record<string, unknown>
  const texto = (chave: string): string | undefined =>
    typeof obj[chave] === 'string' ? limpar(obj[chave] as string) : undefined

  return {
    fbp: texto('fbp'),
    fbc: texto('fbc'),
    clientIp: texto('clientIp'),
    userAgent: texto('userAgent'),
    eventSourceUrl: texto('eventSourceUrl'),
  }
}
