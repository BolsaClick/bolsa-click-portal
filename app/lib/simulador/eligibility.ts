// Lógica determinística de elegibilidade a programas de bolsa/financiamento.
//
// IMPORTANTE: nenhum dado de ENEM ou renda existe no catálogo ou nas APIs — esta
// lógica é uma ESTIMATIVA construída a partir dos critérios oficiais públicos do
// MEC/gov.br. Nunca apresentar como decisão final: o resultado oficial depende de
// edital, nota de corte e conferência documental. Ver DISCLAIMER abaixo.
//
// Fontes dos critérios (whitelist editorial — .gov.br):
// - ProUni:  https://www.gov.br/mec/pt-br  (Portaria Normativa MEC do ProUni)
//   • Bolsa integral (100%): renda bruta familiar per capita ≤ 1,5 salário mínimo.
//   • Bolsa parcial (50%):   renda bruta familiar per capita ≤ 3 salários mínimos.
//   • ENEM: média ≥ 450 pontos nas 5 áreas E nota da redação > 0.
// - FIES:    https://www.gov.br/fnde  /  http://fies.mec.gov.br
//   • Renda bruta familiar per capita ≤ 3 salários mínimos.
//   • ENEM (a partir de 2010): média ≥ 450 pontos E redação > 0.
// - SISU: vagas em instituições públicas, sem critério de renda — depende da nota
//   de corte de cada curso/instituição.

/**
 * Salário mínimo de referência (R$). Atualize quando o valor nacional mudar —
 * é o único número que precisa de manutenção manual aqui. Referência: 2025.
 */
export const SALARIO_MINIMO_REFERENCIA = 1518

/** Nota mínima de média no ENEM exigida por ProUni e FIES. */
export const ENEM_NOTA_MINIMA = 450

export interface SimuladorInput {
  /** Média das 5 áreas do ENEM (0–1000), ou null se não fez / não informou. */
  enemScore: number | null
  /** Se a redação foi zerada — invalida ProUni/FIES mesmo com média ≥ 450. */
  redacaoZerada?: boolean
  /** Renda bruta mensal somada da família, em R$. */
  rendaFamiliar: number
  /** Nº de pessoas que vivem dessa renda (inclui o candidato). */
  pessoasNaFamilia: number
}

export type ProgramaId =
  | 'prouni-integral'
  | 'prouni-parcial'
  | 'fies'
  | 'sisu'
  | 'bolsa-propria'

export type ProgramaStatus = 'provavel' | 'talvez' | 'nao'

export interface ProgramaResultado {
  id: ProgramaId
  nome: string
  /** Nível de indicação estimado. */
  status: ProgramaStatus
  /** Frase curta explicando o porquê, personalizada com os inputs. */
  resumo: string
  /** O critério oficial resumido, pra transparência. */
  criterio: string
  /** Rota interna com o conteúdo do programa. */
  href: string
}

export interface ElegibilidadeResultado {
  rendaPerCapita: number
  rendaPerCapitaSM: number
  enemQualifica: boolean
  /** Título de destaque mostrado no topo do resultado. */
  headline: string
  programas: ProgramaResultado[]
}

export const DISCLAIMER =
  'Estimativa baseada nos critérios oficiais públicos de ProUni e FIES (MEC/gov.br). ' +
  'Não é uma aprovação: o resultado real depende do edital vigente, da nota de corte de ' +
  'cada curso e da análise documental. Use como orientação inicial.'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Calcula, de forma determinística e auditável, a indicação de cada programa a
 * partir dos critérios oficiais. Não chama nenhuma API nem modelo.
 */
export function computeElegibilidade(input: SimuladorInput): ElegibilidadeResultado {
  const pessoas = Math.max(1, Math.floor(input.pessoasNaFamilia || 1))
  const rendaPerCapita = round2((input.rendaFamiliar || 0) / pessoas)
  const rendaPerCapitaSM = round2(rendaPerCapita / SALARIO_MINIMO_REFERENCIA)

  const temEnem = input.enemScore != null
  const enemQualifica =
    temEnem &&
    (input.enemScore as number) >= ENEM_NOTA_MINIMA &&
    !input.redacaoZerada

  const programas: ProgramaResultado[] = []

  // --- ProUni integral (100%) ---
  programas.push({
    id: 'prouni-integral',
    nome: 'ProUni — bolsa integral (100%)',
    status:
      enemQualifica && rendaPerCapitaSM <= 1.5
        ? 'provavel'
        : !temEnem
          ? 'nao'
          : 'nao',
    resumo:
      enemQualifica && rendaPerCapitaSM <= 1.5
        ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} salário mínimo) está dentro do teto de 1,5 e sua nota atende ao mínimo.`
        : !temEnem
          ? 'Exige nota do ENEM (média ≥ 450 e redação acima de zero).'
          : rendaPerCapitaSM > 1.5
            ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} SM) passa do teto de 1,5 salário mínimo da bolsa integral.`
            : 'Sua média no ENEM ficou abaixo de 450 pontos (ou a redação foi zerada).',
    criterio: 'Renda per capita ≤ 1,5 salário mínimo + ENEM média ≥ 450 e redação > 0.',
    href: '/prouni',
  })

  // --- ProUni parcial (50%) ---
  programas.push({
    id: 'prouni-parcial',
    nome: 'ProUni — bolsa parcial (50%)',
    status:
      enemQualifica && rendaPerCapitaSM > 1.5 && rendaPerCapitaSM <= 3
        ? 'provavel'
        : enemQualifica && rendaPerCapitaSM <= 1.5
          ? 'talvez'
          : 'nao',
    resumo:
      enemQualifica && rendaPerCapitaSM > 1.5 && rendaPerCapitaSM <= 3
        ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} SM) está na faixa da bolsa parcial (entre 1,5 e 3 salários mínimos).`
        : enemQualifica && rendaPerCapitaSM <= 1.5
          ? 'Você tende à bolsa integral, mas também pode concorrer à parcial.'
          : !temEnem
            ? 'Exige nota do ENEM (média ≥ 450 e redação acima de zero).'
            : rendaPerCapitaSM > 3
              ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} SM) passa do teto de 3 salários mínimos.`
              : 'Sua média no ENEM ficou abaixo de 450 pontos (ou a redação foi zerada).',
    criterio: 'Renda per capita ≤ 3 salários mínimos + ENEM média ≥ 450 e redação > 0.',
    href: '/prouni',
  })

  // --- FIES (financiamento) ---
  programas.push({
    id: 'fies',
    nome: 'FIES — financiamento estudantil',
    status: enemQualifica && rendaPerCapitaSM <= 3 ? 'provavel' : 'nao',
    resumo:
      enemQualifica && rendaPerCapitaSM <= 3
        ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} SM) está dentro do teto de 3 salários mínimos do FIES.`
        : !temEnem
          ? 'Exige nota do ENEM (média ≥ 450 e redação acima de zero).'
          : rendaPerCapitaSM > 3
            ? `Sua renda per capita (${rendaPerCapitaSM.toLocaleString('pt-BR')} SM) passa do teto de 3 salários mínimos.`
            : 'Sua média no ENEM ficou abaixo de 450 pontos (ou a redação foi zerada).',
    criterio: 'Renda per capita ≤ 3 salários mínimos + ENEM média ≥ 450 e redação > 0.',
    href: '/fies',
  })

  // --- SISU (públicas) ---
  programas.push({
    id: 'sisu',
    nome: 'SISU — vagas em universidades públicas',
    status: temEnem ? 'talvez' : 'nao',
    resumo: temEnem
      ? 'Com nota do ENEM você pode concorrer no SISU — a aprovação depende da nota de corte de cada curso.'
      : 'O SISU usa exclusivamente a nota do ENEM, que você não informou.',
    criterio: 'Apenas nota do ENEM — sem critério de renda. Depende da nota de corte.',
    href: '/sisu',
  })

  // --- Bolsa própria (parceiras EAD) — sempre disponível, sem nota de corte ---
  programas.push({
    id: 'bolsa-propria',
    nome: 'Bolsa própria de faculdades parceiras',
    status: 'provavel',
    resumo:
      'Bolsas próprias de faculdades EAD e presenciais parceiras chegam a até 80% de desconto, sem nota de corte e sem exigência de renda. Veja as ofertas reais pro seu curso abaixo.',
    criterio: 'Sem nota de corte e sem critério de renda — depende só da oferta ativa.',
    href: '/bolsas-de-estudo',
  })

  const headline = buildHeadline({ enemQualifica, rendaPerCapitaSM, temEnem })

  return {
    rendaPerCapita,
    rendaPerCapitaSM,
    enemQualifica,
    headline,
    programas,
  }
}

function buildHeadline(p: {
  enemQualifica: boolean
  rendaPerCapitaSM: number
  temEnem: boolean
}): string {
  if (p.enemQualifica && p.rendaPerCapitaSM <= 1.5) {
    return 'Você provavelmente se qualifica pra bolsa integral do ProUni — e ainda tem bolsa própria como alternativa.'
  }
  if (p.enemQualifica && p.rendaPerCapitaSM <= 3) {
    return 'Você tende a se qualificar pra ProUni parcial e FIES — além de bolsa própria de até 80%.'
  }
  if (p.enemQualifica) {
    return 'Sua renda passa do teto do ProUni/FIES, mas dá pra garantir bolsa própria de até 80% sem nota de corte.'
  }
  if (!p.temEnem) {
    return 'Sem ENEM, o caminho mais rápido é a bolsa própria de faculdades parceiras — até 80% de desconto, sem nota de corte.'
  }
  return 'Sua nota não atinge o mínimo de ProUni/FIES, mas a bolsa própria garante até 80% de desconto sem nota de corte.'
}
