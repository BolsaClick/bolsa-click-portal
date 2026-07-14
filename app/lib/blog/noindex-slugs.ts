// Posts off-topic (não relacionados a bolsas/educação superior) que devem sair
// do índice: biografias, esporte, gramática. Foram gerados por content drift
// (ver auditoria SEO 2026-07) e diluem a autoridade temática do domínio no
// nicho de bolsas de estudo — Helpful Content trata conjunto off-topic como
// sinal negativo. Decisão do dono: noindex (não deletar) — a página segue viva
// (200 + noindex,follow), mas some do índice e do sitemap.
//
// Denylist explícita (não há campo no BlogPost). Para tirar da lista, é só
// remover o slug aqui. Se a categoria crescer, migrar pra um campo `noindex`
// no schema + toggle no admin.

const NOINDEX_SLUGS = new Set<string>([
  'quem-foi-isaac-newton-vida-descobertas-legado',
  'quem-foi-galileu-galilei-vida-descobertas-ciencia',
  'quem-foi-marie-curie-trajetoria-premios-nobel-legado',
  'quem-foi-monteiro-lobato-literatura-infantil-legado',
  'quem-foi-carl-sagan-divulgacao-cientifica-cosmos',
  'arraia-ou-arraial-qual-e-o-certo',
  'eliminacao-do-brasil-na-copa-licoes-para-estudar',
])

/** True se o post deve receber noindex e ficar fora do sitemap. */
export function isOffTopicNoindex(slug: string): boolean {
  return NOINDEX_SLUGS.has(slug)
}

/** Lista imutável dos slugs off-topic (pra filtrar no sitemap). */
export const OFF_TOPIC_NOINDEX_SLUGS: readonly string[] = Array.from(NOINDEX_SLUGS)
