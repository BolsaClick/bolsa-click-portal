/**
 * Taxa de matrícula do Bolsa Click no checkout Cogna/ATHENAS
 * (`/checkout/matricula`).
 *
 * Decisão de negócio (CEO, 2026-09-06): a cobrança neste fluxo tinha sido
 * DESLIGADA porque a Cogna dobrava a comissão em troca de o pagamento não ser
 * coletado no nosso site. Esse acordo acabou — voltamos a cobrar R$ 19,90
 * ANTES de criar a inscrição, com a mesma mecânica já em produção no checkout
 * Estácio (cobra → inscreve → estorna se o parceiro recusar).
 *
 * IMPORTANTE — esta taxa é NOSSA e é ADICIONAL. A matrícula e as mensalidades
 * do CURSO continuam sendo pagas à instituição (payment-link da Cogna, na tela
 * de sucesso). O aluno paga as duas coisas, e as telas precisam deixar isso
 * explícito — sem isso ele acha que foi cobrado duas vezes pela mesma coisa e
 * abre chargeback.
 *
 * NÃO confundir com `getMatriculaCharge()` (matricula-charge.ts): aquele
 * decide APENAS *se* o segmento cobra (graduação + EAD/semi + ATHENAS). O
 * `amountInCents` que ele devolve é a matrícula/mensalidade da OFERTA — o
 * preço do curso, não a nossa taxa. Cobrar aquele valor aqui seria cobrar o
 * valor errado do aluno.
 *
 * ATENÇÃO: valor lido de env var SEM `NEXT_PUBLIC_` — só existe no servidor.
 * NÃO importar este módulo em componente client: lá `process.env` não tem a
 * variável e o valor exibido cairia no default, divergindo do valor realmente
 * cobrado. A tela recebe o valor por prop, a partir do server component
 * (`app/checkout/matricula/page.tsx`); quem cobra de verdade é o servidor, que
 * ignora qualquer valor vindo do cliente.
 */

/** Default de negócio: R$ 19,90. Usado quando a env var não existe ou é lixo. */
const TAXA_MATRICULA_COGNA_DEFAULT_CENTAVOS = 1990

/**
 * Valor da taxa em CENTAVOS (o Elysium e os gateways trabalham em centavos).
 *
 * A env var só é aceita quando é um inteiro positivo. Qualquer outra coisa
 * (vazio, texto, 0, negativo, fracionário, NaN) cai no default — cobrar
 * R$ 0,00 em silêncio é pior do que ignorar a configuração errada.
 */
function resolveTaxaEmCentavos(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') {
    return TAXA_MATRICULA_COGNA_DEFAULT_CENTAVOS
  }

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    console.error(
      '⚠️ TAXA_MATRICULA_COGNA_CENTAVOS inválida — usando o default de R$ 19,90',
      { raw },
    )
    return TAXA_MATRICULA_COGNA_DEFAULT_CENTAVOS
  }

  return parsed
}

export const TAXA_MATRICULA_COGNA_CENTAVOS = resolveTaxaEmCentavos(
  process.env.TAXA_MATRICULA_COGNA_CENTAVOS,
)

/** Descrição da cobrança no gateway (Asaas/AbacatePay) e no extrato do aluno. */
export function taxaMatriculaCognaDescription(courseName?: string | null): string {
  return courseName
    ? `Taxa de matrícula Bolsa Click — ${courseName}`
    : 'Taxa de matrícula Bolsa Click'
}
