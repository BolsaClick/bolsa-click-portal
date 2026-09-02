// Busca todos os cursos únicos de uma faculdade (brand) cobrindo o TOP_CURSOS
// inteiro em paralelo. Server-side com unstable_cache 1h pra amortizar o custo
// entre múltiplas visitas. Resolve o problema de "/faculdades/[slug] mostra 50
// cards do mesmo curso" — agora mostra 1 card por curso único da brand.

import { unstable_cache } from 'next/cache'
import { getShowFiltersCourses } from './get-courses-filter'
import { searchAthenaOffers, normalizeAthenaOffer } from './athena-offers'
import { normalizeBrand, cognaBrandParam } from '../utils/brand'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import type { Course } from '@/app/interface/course'

/** Marcas servidas pela API Athena (YDUQS) — buscadas server-side à parte. */
const YDUQS_BRANDS = new Set(['Estácio', 'Wyden'])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Resultado de uma etapa de busca: as ofertas + se ALGUMA chamada falhou
 *  (rejeitou) — nunca engolido num `[]` que pareceria "buscou e não achou
 *  nada". Consumido por `getInstitutionCoursesWithStatus` pra decidir se o
 *  chamador pode confiar num desconto zero (ver institution-discount.ts). */
interface FetchStageResult {
  courses: Course[]
  hadFailure: boolean
}

/**
 * Cobre TODO o TOP_CURSOS (graduação) em paralelo — curadoria de 22 cursos
 * mais buscados. Só faz sentido pra GRADUACAO: os nomes do TOP_CURSOS são de
 * graduação ("Administração - Bacharelado" etc.), buscá-los com outro nível
 * não devolveria nada.
 */
async function fetchAllOffersByCourse(academicLevel: string): Promise<FetchStageResult> {
  let hadFailure = false
  const results = await Promise.all(
    TOP_CURSOS.map(curso =>
      getShowFiltersCourses(
        curso.apiCourseName,
        undefined, undefined, undefined,
        academicLevel,
        1,
        50
      )
        .then(r => (r?.data || []) as Course[])
        .catch(error => {
          console.error(`[institution-courses] falha em ${curso.apiCourseName}:`, error)
          hadFailure = true
          return [] as Course[]
        })
    )
  )
  return { courses: results.flat(), hadFailure }
}

/**
 * "Modo descoberta" (sem nome de curso) escopado pela marca via o filtro
 * `brands` do Tartarus — usado pra níveis acadêmicos SEM uma lista curada
 * equivalente ao TOP_CURSOS (hoje, pós). Uma única chamada larga em vez de N
 * chamadas por curso; `brands` já filtra no servidor, então não depende de
 * varrer o catálogo inteiro pra achar a marca.
 */
async function fetchBroadOffers(brandName: string, academicLevel: string): Promise<FetchStageResult> {
  const brandLabel = normalizeBrand(brandName)
  const cognaBrand = cognaBrandParam(brandLabel)
  if (!cognaBrand) return { courses: [], hadFailure: false } // marca não é Cogna — sem filtro `brands` confiável pra escopar a busca larga
  return getShowFiltersCourses(
    undefined, undefined, undefined, undefined,
    academicLevel,
    1,
    60,
    [brandLabel]
  )
    .then(r => ({ courses: (r?.data || []) as Course[], hadFailure: false }))
    .catch(error => {
      console.error(`[institution-courses] busca larga (${academicLevel}/${brandLabel}) falhou:`, error)
      return { courses: [] as Course[], hadFailure: true }
    })
}

export interface GetInstitutionCoursesOptions {
  /**
   * Nível acadêmico das ofertas buscadas. Default 'GRADUACAO' (comportamento
   * de sempre, intocado). Ver `academicLevelFor` em app/lp/_shared/partners.ts
   * — hoje só o site de captação da pós Anhanguera passa 'POS_GRADUACAO'.
   */
  academicLevel?: string
}

/**
 * Ofertas YDUQS (Estácio/Wyden) via Athena — fetch SERVER-SIDE (o merge padrão de
 * getShowFiltersCourses só roda no browser). Cobre o TOP_CURSOS e normaliza p/ Course.
 */
async function fetchAthenaOffersByCourse(academicLevel: string): Promise<FetchStageResult> {
  let hadFailure = false
  const results = await Promise.all(
    TOP_CURSOS.map(curso =>
      searchAthenaOffers({ courseName: curso.apiCourseName, academicLevel })
        .then(list => list.map(normalizeAthenaOffer))
        .catch(error => {
          console.error(`[institution-courses] Athena falhou em ${curso.apiCourseName}:`, error)
          hadFailure = true
          return [] as Course[]
        })
    )
  )
  return { courses: results.flat(), hadFailure }
}

export interface InstitutionCoursesResult {
  courses: Course[]
  /**
   * true quando QUALQUER chamada de origem (por curso do TOP_CURSOS ou busca
   * larga por marca; Tartarus ou Athena) rejeitou nesta chamada. Sinaliza
   * que um desconto medido como 0 pode ser FALHA de busca, não fato — nunca
   * combine `courses` vazio/curto + `hadFetchFailure` pra afirmar ausência
   * de bolsa (ver `getInstitutionDiscountState` em
   * app/lib/utils/institution-discount.ts). NÃO cobre a falha que devolve
   * HTTP 200 com lista vazia sob carga (essa não lança erro, então não é
   * capturada aqui — é coberta pelo piso de quantidade do outro lado).
   */
  hadFetchFailure: boolean
}

/**
 * Pra uma dada brand de faculdade, retorna 1 oferta por curso único (a mais barata)
 * e se alguma busca de origem falhou. Cobre todo o TOP_CURSOS (22) → diversidade
 * real de cursos, pra GRADUACAO (default). Outros níveis (`opts.academicLevel`)
 * usam a busca larga por marca (`fetchBroadOffers`), já que o TOP_CURSOS é uma
 * curadoria só de graduação. Cache 1h via unstable_cache. `opts` entra na key do
 * cache automaticamente (unstable_cache inclui os argumentos), então pós nunca
 * reusa o cache de graduação da mesma marca.
 */
const getInstitutionCoursesResult = unstable_cache(
  async (brandName: string, opts?: GetInstitutionCoursesOptions): Promise<InstitutionCoursesResult> => {
    const academicLevel = opts?.academicLevel ?? 'GRADUACAO'
    const brandKey = normalizeBrand(brandName)
    const tartarusStage =
      academicLevel === 'GRADUACAO'
        ? await fetchAllOffersByCourse(academicLevel)
        : await fetchBroadOffers(brandName, academicLevel)
    // Ofertas YDUQS (Estácio) vêm da Athena server-side. Sem isso, a página de
    // marca da Estácio ficava sem ofertas/preços e o AggregateOffer não era emitido.
    const athenaStage = YDUQS_BRANDS.has(brandKey)
      ? await fetchAthenaOffersByCourse(academicLevel)
      : { courses: [] as Course[], hadFailure: false }
    const hadFetchFailure = tartarusStage.hadFailure || athenaStage.hadFailure
    const allOffers = [...tartarusStage.courses, ...athenaStage.courses]

    // Filtra por brand — normalizeBrand agrupa as razões sociais YDUQS sob "Estácio".
    const brandOffers = allOffers.filter(
      o => normalizeBrand((o as Course).brand) === brandKey
    )

    // Dedup por nome do curso, mantendo a oferta mais barata
    const bestByName = new Map<string, Course>()
    for (const offer of brandOffers) {
      const key = normalize(offer.name ?? '')
      if (!key) continue
      const existing = bestByName.get(key)
      if (!existing) {
        bestByName.set(key, offer)
        continue
      }
      const existingPrice = existing.minPrice ?? Number.POSITIVE_INFINITY
      const offerPrice = offer.minPrice ?? Number.POSITIVE_INFINITY
      if (offerPrice < existingPrice) {
        bestByName.set(key, offer)
      }
    }

    const courses = Array.from(bestByName.values()).sort((a, b) => {
      const ap = a.minPrice ?? Number.POSITIVE_INFINITY
      const bp = b.minPrice ?? Number.POSITIVE_INFINITY
      return ap - bp
    })

    return { courses, hadFetchFailure }
  },
  ['institution-courses-v2'],
  { revalidate: 3600, tags: ['institution-courses'] }
)

/** Compat: só as ofertas, sem o sinal de falha — usado por chamadores que
 *  não precisam decidir se podem afirmar ausência de bolsa (ex.: grid de
 *  ofertas da landing de mídia paga). Pra copy que afirma "não tem bolsa",
 *  use `getInstitutionCoursesWithStatus`. */
export async function getInstitutionCourses(
  brandName: string,
  opts?: GetInstitutionCoursesOptions,
): Promise<Course[]> {
  const result = await getInstitutionCoursesResult(brandName, opts)
  return result.courses
}

/** Ofertas + sinal de falha de busca — use quando a copy pode afirmar
 *  ausência de bolsa (ver `getInstitutionDiscountState`). Mesmo cache que
 *  `getInstitutionCourses` (mesma key/args), então não duplica fetch quando
 *  as duas são chamadas pra a mesma marca. */
export async function getInstitutionCoursesWithStatus(
  brandName: string,
  opts?: GetInstitutionCoursesOptions,
): Promise<InstitutionCoursesResult> {
  return getInstitutionCoursesResult(brandName, opts)
}
