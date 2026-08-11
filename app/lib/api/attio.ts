// Integração com o CRM Attio (https://docs.attio.com).
// Módulo server-only: usa ATTIO_API_KEY, que é segredo de servidor.
//
// Substitui o Notealy, removido em 2026-08-11. A diferença estrutural que
// molda este arquivo: o Notealy casava contato em cascata (telefone → email →
// CPF); o Attio casa por UM atributo, que precisa ser marcado como único.
//
// Por isso o objeto é customizado (`candidatos`) e não o `people` padrão: em
// `people` o único atributo único é `email_addresses`, e o lead de mídia paga
// (/api/ingressa) capta só nome e telefone — justamente o lead que custa
// dinheiro ficaria sem chave de casamento. Telefone é o único identificador
// presente em TODAS as superfícies de captação, então é ele a chave.

const ATTIO_API = 'https://api.attio.com/v2'
const OBJECT = 'candidatos'
const MATCHING_ATTRIBUTE = 'telefone'

/** Qual site captou. Cada repo/deploy define o seu; ver origem_site no Attio. */
const ORIGEM_SITE = process.env.ATTIO_ORIGEM_SITE || 'bolsaclick'

/**
 * Estágios, do mais fraco ao mais forte. A ordem É a regra de precedência:
 * um contato nunca regride. Sem isso, alguém que já se matriculou e depois
 * preenche um formulário de lead voltaria para "lead" e entraria em campanha
 * de captação já sendo aluno.
 */
export const ESTAGIOS = [
  'lead',
  'abandonou_checkout',
  'inscricao_recusada',
  'inscrito',
  'matriculado',
] as const

export type Estagio = (typeof ESTAGIOS)[number]

export type OrigemFluxo =
  | 'checkout-matricula'
  | 'checkout-estacio'
  | 'ingressa'
  | 'simulador'
  | 'teste-vocacional'

export interface UpsertCandidatoInput {
  /** Obrigatório: é a chave de casamento. Sem ele não há upsert possível. */
  phone: string
  name?: string
  email?: string
  cpf?: string
  /** `YYYY-MM-DD` (o que a coluna Lead.birthDate devolve). */
  birthDate?: string | Date | null
  brand?: string
  courseName?: string
  modality?: string
  city?: string
  state?: string
  estagio?: Estagio
  origemFluxo?: OrigemFluxo
  /** Texto bruto do parceiro quando a inscrição é recusada. */
  motivoRecusa?: string
  /** Id na tabela Lead do Postgres — ponte para reconciliação e backfill. */
  leadId?: string
  /** Atribuição de mídia paga. Ver app/lib/analytics/utm.ts. */
  utm?: {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
  }
}

/**
 * Telefone para E.164. O Attio normaliza internamente, mas mandar já no
 * formato canônico evita que "11999999999" e "+5511999999999" virem dois
 * registros — o que quebraria exatamente a garantia que a chave única existe
 * para dar.
 */
function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) return `+${digits}`
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  // Fora dos formatos BR conhecidos: manda como veio em vez de descartar o
  // lead, e deixa o Attio decidir.
  return `+${digits}`
}

/**
 * Marca canônica → opção do select `marca` no Attio.
 *
 * Casamento por SUBSTRING, não por igualdade: o catálogo grava o nome completo
 * da unidade ("UNIVERSIDADE ESTÁCIO DE SÁ", "CENTRO UNIVERSITÁRIO ESTÁCIO DE
 * RIBEIRÃO PRETO", "FACULDADE ESTÁCIO DO RIO GRANDE DO SUL"), não a rede. Com
 * igualdade exata, as 14 variações de Estácio caíam todas em "Outra" e a
 * segmentação por rede — que é o ponto do campo — deixava de existir.
 *
 * A ordem importa: o primeiro padrão que casar vence. UNIC vai por último
 * porque é curto e aparece dentro de outros nomes.
 */
const MARCAS: Array<[string, string]> = [
  ['ANHANGUERA', 'Anhanguera'],
  ['ESTACIO', 'Estácio'],
  ['UNOPAR', 'Unopar'],
  ['PITAGORAS', 'Pitágoras'],
  ['IBMEC', 'IBMEC'],
  ['UNAES', 'UNAES'],
  ['UNIME', 'UNIME'],
  ['AMPLI', 'Ampli'],
  ['UNIC', 'UNIC'],
]

/** Remove acento/caixa para casar "Estácio", "ESTACIO" e "estacio". */
function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

export function toMarca(brand?: string): string | undefined {
  if (!brand?.trim()) return undefined
  const key = normalizeKey(brand)
  for (const [padrao, marca] of MARCAS) {
    if (key.includes(padrao)) return marca
  }
  return 'Outra'
}

function toModalidade(modality?: string): string | undefined {
  if (!modality?.trim()) return undefined
  const key = normalizeKey(modality)
  if (key.includes('SEMI')) return 'Semipresencial'
  if (key.includes('EAD') || key.includes('DISTANCIA') || key.includes('VIRTUAL')) return 'EAD'
  if (key.includes('PRESENCIAL')) return 'Presencial'
  return undefined
}

function toDateString(value?: string | Date | null): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined
}

async function attioFetch(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${ATTIO_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

/**
 * Lê o registro existente para duas decisões que dependem do estado anterior:
 * não regredir o estágio, e não sobrescrever a atribuição de primeiro toque.
 *
 * Custa um request a mais por escrita — aceitável no nosso volume, e é o que
 * impede a pior mensagem possível ("complete sua inscrição" para quem já é
 * aluno) e a distorção de atribuição que faria mídia paga parecer não
 * converter.
 */
async function getExistente(
  telefone: string,
): Promise<{ estagio: Estagio | null; temUtm: boolean }> {
  try {
    const res = await attioFetch(`/objects/${OBJECT}/records/query`, {
      method: 'POST',
      body: JSON.stringify({ filter: { [MATCHING_ATTRIBUTE]: telefone }, limit: 1 }),
    })
    if (!res.ok) return { estagio: null, temUtm: false }
    const json = (await res.json()) as {
      data?: Array<{
        values?: {
          estagio?: Array<{ option?: { title?: string } }>
          utm_source?: Array<{ value?: string }>
          utm_campaign?: Array<{ value?: string }>
        }
      }>
    }
    const values = json.data?.[0]?.values
    const atual = values?.estagio?.[0]?.option?.title
    return {
      estagio:
        atual && (ESTAGIOS as readonly string[]).includes(atual) ? (atual as Estagio) : null,
      temUtm: Boolean(values?.utm_source?.[0]?.value || values?.utm_campaign?.[0]?.value),
    }
  } catch {
    // Falha na leitura não pode impedir a escrita: melhor gravar o estágio
    // novo do que perder o contato inteiro.
    return { estagio: null, temUtm: false }
  }
}

function estagioMaisForte(a: Estagio | null, b: Estagio | null): Estagio | undefined {
  if (!a) return b ?? undefined
  if (!b) return a
  return ESTAGIOS.indexOf(a) >= ESTAGIOS.indexOf(b) ? a : b
}

/**
 * Cria ou atualiza o candidato, casando por telefone. Retorna o record_id, ou
 * null se a config estiver ausente ou a escrita falhar.
 *
 * O upsert do Attio faz update PARCIAL: campos não enviados são preservados.
 * Por isso cada superfície manda só o que conhece, sem apagar o que outra
 * gravou antes.
 */
export async function upsertCandidato(input: UpsertCandidatoInput): Promise<string | null> {
  if (!process.env.ATTIO_API_KEY) {
    console.warn('⚠️ ATTIO_API_KEY não configurada — upsert ignorado')
    return null
  }

  const telefone = toE164(input.phone ?? '')
  if (!telefone) {
    console.warn('⚠️ Attio: sem telefone — não há chave de casamento, upsert ignorado')
    return null
  }

  const temUtmNovo = Boolean(
    input.utm?.utmSource || input.utm?.utmMedium || input.utm?.utmCampaign || input.utm?.utmContent,
  )
  let estagio = input.estagio
  let gravarUtm = temUtmNovo
  if (estagio || temUtmNovo) {
    const existente = await getExistente(telefone)
    if (estagio) estagio = estagioMaisForte(existente.estagio, estagio)
    // Primeiro toque vence: só grava UTM se o registro ainda não tiver uma.
    gravarUtm = temUtmNovo && !existente.temUtm
  }

  const values: Record<string, unknown> = {
    [MATCHING_ATTRIBUTE]: [{ original_phone_number: telefone }],
  }
  const set = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') values[key] = value
  }

  set('nome', input.name?.trim())
  set('email', input.email?.trim().toLowerCase())
  set('cpf', input.cpf?.replace(/\D/g, '') || undefined)
  set('nascimento', toDateString(input.birthDate))
  set('marca', toMarca(input.brand))
  set('curso', input.courseName?.trim())
  set('modalidade', toModalidade(input.modality))
  set('cidade', input.city?.trim())
  set('estado', input.state?.trim())
  set('estagio', estagio)
  set('origem_site', ORIGEM_SITE)
  set('origem_fluxo', input.origemFluxo)
  set('motivo_recusa', input.motivoRecusa?.slice(0, 800))
  set('lead_id', input.leadId)
  // UTMs só na PRIMEIRA gravação com valor: a atribuição pertence ao clique
  // que trouxe a pessoa. Se um retorno orgânico sobrescrevesse, toda matrícula
  // acabaria atribuída ao último toque e a mídia paga pareceria não converter.
  if (gravarUtm) {
    set('utm_source', input.utm?.utmSource)
    set('utm_medium', input.utm?.utmMedium)
    set('utm_campaign', input.utm?.utmCampaign)
    set('utm_content', input.utm?.utmContent)
  }

  const res = await attioFetch(
    `/objects/${OBJECT}/records?matching_attribute=${MATCHING_ATTRIBUTE}`,
    { method: 'PUT', body: JSON.stringify({ data: { values } }) },
  )

  if (!res.ok) {
    throw new Error(`Attio upsert respondeu ${res.status}: ${await res.text().catch(() => '')}`)
  }

  const json = (await res.json()) as { data?: { id?: { record_id?: string } } }
  return json.data?.id?.record_id ?? null
}
