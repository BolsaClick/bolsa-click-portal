import { athena } from './axios'
import type { Course } from '@/app/interface/course'
import { titleCasePtBr } from '@/app/lib/utils/title-case'

/**
 * Client da API Athena — segunda fonte de ofertas (roteia YDUQS/Estácio).
 *
 * Dois fluxos:
 *  1. Busca de ofertas (listagem) → mesclada na busca curso+cidade do portal.
 *  2. Inscrição (checkout) → POST /api/enrollments, devolve numeroInscricao + link de pagamento.
 *
 * Contrato de inscrição é o do runbook YDUQS validado 2026-06-01. O contrato do endpoint
 * de BUSCA ainda será confirmado pelo usuário — `searchAthenaOffers`/`normalizeAthenaOffer`
 * usam um mapeamento tolerante (vários nomes de campo) e devem ser ajustados quando o
 * contrato chegar (ver TODO no normalize).
 */

/** Oferta crua devolvida pela busca da Athena (contrato real — /api/offers). */
export interface AthenaOffer {
  /** uuid do Offer no catálogo da Athena (obrigatório para o checkout). */
  id?: string
  unitId?: string
  externalId?: string
  modality?: string
  shift?: string
  /** Mensalidade sem desconto. */
  priceFrom?: number
  /** Mensalidade com desconto (preço "por"). */
  priceTo?: number
  durationMonths?: number | null
  status?: string
  course?: { name?: string; slug?: string; academicLevel?: string }
  institution?: { name?: string; slug?: string; logo?: string | null }
  unit?: { name?: string; city?: string; state?: string }
  /** Metadados YDUQS — usados p/ inscrevibilidade (codCurso == codCursoPai). */
  metadata?: {
    codCurso?: number
    codCursoPai?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface SearchAthenaOffersParams {
  courseName?: string
  city?: string
  state?: string
  modality?: string
  academicLevel?: string
}

/** Dados do aluno para a inscrição (CreateEnrollmentDto.student). */
export interface AthenaStudent {
  name: string
  cpf: string
  email: string
  mobile: string
  gender?: 'M' | 'F' | 'NI'
  rg?: string
  /** YYYY-MM-DD */
  birthDate?: string
}

/**
 * Endereço do candidato (CreateEnrollmentDto.address).
 * `codigoMunicipio`/`codigoBairro` são auto-resolvidos do CEP pela Athena — não enviamos.
 */
export interface AthenaAddress {
  street: string
  number: string
  neighborhood: string
  zipCode: string
  state: string
  city: string
}

export interface AthenaOptions {
  useEnem: boolean
  graduationYear?: number
  acceptTerms: boolean
}

/** Body de POST /api/enrollments. */
export interface CreateEnrollmentInput {
  offerId: string
  student: AthenaStudent
  address: AthenaAddress
  options: AthenaOptions
}

/** Bloco de cobrança da inscrição (dentro de providerResponse.pagamento). */
interface AthenaCobranca {
  /** Link web de pagamento (ex.: https://pagamentos.estacio.br?idtransacao=…). */
  urlPagamentoQuote?: string
  /** PIX copia-e-cola. */
  pix?: string
  valorLiquido?: string
  valorBruto?: string
  dataVencimento?: string
  cobrancaIdQuote?: string
  // tolerância a outros nomes
  paymentUrl?: string
  url?: string
  link?: string
  [key: string]: unknown
}

/** Resposta crua de POST /api/enrollments. */
export interface AthenaEnrollmentResponse {
  status?: string
  numeroInscricao?: string
  providerEnrollmentId?: string
  providerResponse?: {
    message?: string
    code?: string
    numeroInscricao?: string
    pagamento?: { cobranca?: AthenaCobranca }
    [key: string]: unknown
  }
  /** Fallback: algumas respostas trazem pagamento no topo. */
  pagamento?: { cobranca?: AthenaCobranca }
  [key: string]: unknown
}

/** Resultado normalizado da inscrição, pronto para a UI. */
export interface AthenaCheckoutResult {
  numeroInscricao: string | null
  /** Link web de pagamento da instituição. */
  paymentUrl: string | null
  /** PIX copia-e-cola (quando disponível). */
  pixCode: string | null
  /** Valor da cobrança (string em reais, ex.: "79.00"). */
  amount: string | null
  /** Vencimento (YYYY-MM-DD). */
  dueDate: string | null
  /** true quando o CPF já estava inscrito (ATL016) — tratamos como sucesso. */
  alreadyEnrolled: boolean
}

function num(v: number | null | undefined): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
}

/**
 * O portal monta o courseName como "Curso - Sufixo" (ex.: "Pedagogia - Licenciatura"),
 * mas a Athena indexa pelo nome limpo ("PEDAGOGIA"). Removemos o sufixo de grau
 * para não zerar a busca. Pega o trecho antes do primeiro " - " (o sufixo é o
 * único hífen com espaços inserido pelo portal).
 */
export function cleanCourseNameForAthena(courseName?: string): string | undefined {
  if (!courseName) return undefined
  const base = courseName.split(' - ')[0]?.trim()
  return base || courseName.trim() || undefined
}

/**
 * Mapeia uma oferta crua da Athena (/api/offers) para a interface `Course` do
 * portal, marcando `source: 'YDUQS'` e o `offerId` (uuid) usado no checkout.
 */
export function normalizeAthenaOffer(raw: AthenaOffer): Course {
  const offerId = raw.id || raw.externalId || ''
  // Nomes da Athena vêm em CAIXA ALTA ("ADMINISTRAÇÃO"); normalizar p/ title-case
  // PT-BR pra ficar consistente com os cards Cogna ("Ciências Contábeis").
  const name = titleCasePtBr(raw.course?.name) || raw.course?.name || ''
  const brand = raw.institution?.name || 'estacio'
  // priceTo = com desconto (preço "por"); priceFrom = sem desconto ("de").
  const minPrice = num(raw.priceTo) || num(raw.priceFrom)
  const maxPrice = num(raw.priceFrom) || minPrice
  const shift = (raw.shift || '').toString()

  return {
    id: offerId || name,
    offerId,
    source: 'YDUQS',
    brand,
    name,
    minPrice,
    maxPrice,
    modality: (raw.modality || '').toString(),
    commercialModality: (raw.modality || '').toString() || null,
    academicLevel: raw.course?.academicLevel,
    city: raw.unit?.city,
    unitCity: raw.unit?.city,
    uf: raw.unit?.state,
    unitState: raw.unit?.state,
    unitId: raw.unitId,
    unitName: raw.unit?.name,
    durationInMonths: raw.durationMonths ?? undefined,
    shiftOptions: shift ? [shift] : undefined,
  }
}

/**
 * Busca ofertas Estácio na Athena por curso + cidade.
 * Degradação graciosa: em qualquer falha retorna [] (a busca Tartarus segue normal).
 */
export async function searchAthenaOffers(
  params: SearchAthenaOffersParams,
): Promise<AthenaOffer[]> {
  if (!process.env.ATHENA_BASE_URL) return []

  try {
    const query: Record<string, string> = {}
    const courseName = cleanCourseNameForAthena(params.courseName)
    if (courseName) query.courseName = courseName
    if (params.city?.trim()) query.city = params.city.trim()
    if (params.state?.trim()) query.state = params.state.trim()
    if (params.modality?.trim()) query.modality = params.modality.trim().toUpperCase()
    if (params.academicLevel?.trim()) query.academicLevel = params.academicLevel.trim()

    // TODO(contrato): confirmar o path do endpoint de busca da Athena.
    const response = await athena.get('api/offers', { params: query })

    const data = response.data
    const list: AthenaOffer[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.offers)
          ? data.offers
          : []

    // Sem filtro de inscrevibilidade (decisão do negócio): mostrar tudo que a
    // Athena retorna, inclusive ofertas com split de curso. Eventual INT004 é
    // tratado/exibido no checkout (/api/athena-checkout → EstacioCheckoutClient).
    return list
  } catch (error) {
    console.error('Erro ao buscar ofertas na Athena:', error)
    return []
  }
}

/**
 * Cria a inscrição na Athena (POST /api/enrollments) e extrai o link de pagamento.
 * Trata ATL016 (CPF já inscrito) como sucesso, devolvendo a inscrição/link existente.
 */
export async function createAthenaEnrollment(
  input: CreateEnrollmentInput,
): Promise<AthenaCheckoutResult> {
  // CPF / CEP / telefone só com dígitos (a Athena resolve códigos a partir do CEP).
  const payload: CreateEnrollmentInput = {
    ...input,
    student: {
      ...input.student,
      cpf: input.student.cpf.replace(/\D/g, ''),
      mobile: input.student.mobile.replace(/\D/g, ''),
    },
    address: {
      ...input.address,
      zipCode: input.address.zipCode.replace(/\D/g, ''),
    },
  }

  const response = await athena.post<AthenaEnrollmentResponse>(
    'api/enrollments',
    payload,
  )

  return extractCheckoutResult(response.data)
}

/** Extrai numeroInscricao + dados de pagamento do corpo da resposta da Athena. */
export function extractCheckoutResult(
  data: AthenaEnrollmentResponse,
): AthenaCheckoutResult {
  // A cobrança vem em providerResponse.pagamento.cobranca (fallback no topo).
  const cobranca =
    data.providerResponse?.pagamento?.cobranca || data.pagamento?.cobranca
  const paymentUrl =
    cobranca?.urlPagamentoQuote ||
    cobranca?.paymentUrl ||
    cobranca?.url ||
    cobranca?.link ||
    null
  const code = (data.providerResponse?.code || '').toUpperCase()

  return {
    numeroInscricao:
      data.providerResponse?.numeroInscricao ||
      data.numeroInscricao ||
      data.providerEnrollmentId ||
      null,
    paymentUrl,
    pixCode: cobranca?.pix || null,
    amount: cobranca?.valorLiquido || cobranca?.valorBruto || null,
    dueDate: cobranca?.dataVencimento || null,
    alreadyEnrolled: code === 'ATL016',
  }
}
