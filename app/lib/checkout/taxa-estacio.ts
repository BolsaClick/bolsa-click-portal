/**
 * Taxa de matrícula do Bolsa Click no checkout Estácio/YDUQS.
 *
 * Decisão de negócio (CEO, 2026-09-04): R$ 19,90 cobrados pelo Bolsa Click
 * ANTES de criar a inscrição na Athena — mesma mecânica da campanha
 * ingressa.digital (cobra → inscreve → estorna se o parceiro recusar).
 *
 * IMPORTANTE — esta taxa é NOSSA e é ADICIONAL. No fim do fluxo a própria
 * Estácio emite a cobrança dela (`cobranca.valorLiquido`, com PIX e
 * `urlPagamentoQuote`), que vai para a YDUQS. O aluno paga as duas coisas, e
 * as telas precisam deixar isso explícito — sem isso o aluno acha que foi
 * cobrado duas vezes pela mesma coisa e abre chargeback.
 *
 * NUNCA reaproveitar esta constante nos outros checkouts: o portal principal
 * (Cogna/ATHENAS) decide em `matricula-charge.ts`, com regra própria.
 *
 * ATENÇÃO: valor lido de env var SEM `NEXT_PUBLIC_` — só existe no servidor.
 * NÃO importar este módulo em componente client: lá `process.env` não tem a
 * variável e o valor exibido cairia no default, divergindo do valor realmente
 * cobrado. A tela recebe o valor por prop, a partir do server component
 * (`app/checkout/estacio/page.tsx`); quem cobra de verdade é o servidor, que
 * ignora qualquer valor vindo do cliente.
 */

/** Default de negócio: R$ 19,90. Usado quando a env var não existe ou é lixo. */
const TAXA_MATRICULA_ESTACIO_DEFAULT_CENTAVOS = 1990

/**
 * Valor da taxa em CENTAVOS (o Elysium e os gateways trabalham em centavos).
 *
 * A env var só é aceita quando é um inteiro positivo. Qualquer outra coisa
 * (vazio, texto, 0, negativo, fracionário, NaN) cai no default — cobrar
 * R$ 0,00 em silêncio é pior do que ignorar a configuração errada.
 */
function resolveTaxaEmCentavos(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') {
    return TAXA_MATRICULA_ESTACIO_DEFAULT_CENTAVOS
  }

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    console.error(
      '⚠️ TAXA_MATRICULA_ESTACIO_CENTAVOS inválida — usando o default de R$ 19,90',
      { raw },
    )
    return TAXA_MATRICULA_ESTACIO_DEFAULT_CENTAVOS
  }

  return parsed
}

export const TAXA_MATRICULA_ESTACIO_CENTAVOS = resolveTaxaEmCentavos(
  process.env.TAXA_MATRICULA_ESTACIO_CENTAVOS,
)

/** Descrição da cobrança no gateway (Asaas/AbacatePay) e no extrato do aluno. */
export function taxaMatriculaEstacioDescription(courseName?: string | null): string {
  return courseName
    ? `Taxa de matrícula Bolsa Click — ${courseName}`
    : 'Taxa de matrícula Bolsa Click'
}
