/**
 * Regressão: uma fonte de oferta caída não pode zerar a prateleira da home.
 *
 * Cenário real (08/10/2026): a Cogna bloqueou o Tartarus com 429 ("possível
 * tentativa de fraude"), o Tartarus reempacotou como HTTP 400 e a prateleira
 * "Mais procurados" sumiu da home — mesmo com a fonte Estácio (Athena)
 * respondendo normalmente. Causa: `Promise.all` em loadShelf rejeitava junto
 * com a Cogna e descartava o resultado JÁ RESOLVIDO da Estácio.
 *
 * Este teste exercita loadShelf com a Cogna rejeitando e a Athena entregando
 * oferta: tem que sobrar oferta na prateleira. Com `Promise.all`, dá [].
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

import { tartarus } from '../api/axios'
import { loadShelf } from './vitrine'

/** Oferta Estácio no shape que /api/athena-offers devolve. */
const ofertaEstacio = {
  offerId: 'athena-1',
  id: 'athena-1',
  name: 'Pedagogia - Licenciatura',
  brand: 'Estácio',
  modality: 'EAD',
  academicLevel: 'GRADUACAO',
  minPrice: 149.9,
  maxPrice: 599.9,
  unitName: 'SAO PAULO/SP - Centro',
  city: 'SAO PAULO',
  uf: 'SP',
}

/** Reproduz o 400 do Tartarus embrulhando o 429 da Cogna. */
function adapterQueFalhaComo400() {
  return () => {
    const error = new Error('Request failed with status code 400') as Error & {
      response?: unknown
      config?: unknown
      isAxiosError?: boolean
    }
    error.isAxiosError = true
    error.config = { url: 'cogna/courses/search', method: 'get', params: {} }
    error.response = {
      status: 400,
      data: { message: 'Cogna rejeitou a requisição [HTTP 429]', cognaStatus: 429 },
    }
    return Promise.reject(error)
  }
}

test('prateleira sobrevive à Cogna fora do ar quando a Estácio responde', async () => {
  const adapterOriginal = tartarus.defaults.adapter
  const fetchOriginal = globalThis.fetch

  tartarus.defaults.adapter = adapterQueFalhaComo400() as never
  globalThis.fetch = (async (input: unknown) => {
    const url = String(input)
    if (url.includes('/api/athena-offers')) {
      return new Response(JSON.stringify({ data: [ofertaEstacio] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ data: [] }), { status: 200 })
  }) as typeof globalThis.fetch

  try {
    const result = await loadShelf(
      { city: 'SAO PAULO', state: 'SP', modality: 'EAD' },
      'mais-procurados',
    )
    assert.ok(
      result.length > 0,
      'a prateleira zerou mesmo com a fonte Estácio respondendo — a falha da Cogna voltou a derrubar a outra fonte',
    )
    assert.equal(result[0].name, 'Pedagogia - Licenciatura')
  } finally {
    tartarus.defaults.adapter = adapterOriginal
    globalThis.fetch = fetchOriginal
  }
})

test('prateleira fica vazia (nunca inventa oferta) quando TODAS as fontes caem', async () => {
  const adapterOriginal = tartarus.defaults.adapter
  const fetchOriginal = globalThis.fetch

  tartarus.defaults.adapter = adapterQueFalhaComo400() as never
  globalThis.fetch = (async () => {
    throw new Error('athena fora do ar')
  }) as typeof globalThis.fetch

  try {
    const result = await loadShelf(
      { city: 'SAO PAULO', state: 'SP', modality: 'EAD' },
      'mais-procurados',
    )
    assert.deepEqual(result, [], 'sem fonte viva a prateleira tem que vir vazia')
  } finally {
    tartarus.defaults.adapter = adapterOriginal
    globalThis.fetch = fetchOriginal
  }
})

/**
 * Caminho feliz: quando o Tartarus responde (cache quente do /offers/most-searched,
 * que foi como a chamada direta devolveu 10 ofertas), a prateleira tem que
 * RENDERIZAR — com marcas variadas e sem repetir o mesmo curso por polo.
 *
 * Fixture no shape exato de MostSearchedResponse (get-most-searched-courses.ts).
 */
function ofertaMostSearched(
  id: string,
  name: string,
  brandName: string,
  modality = 'EAD',
) {
  return {
    id,
    name,
    provider: 'COGNA',
    brand: { id: `b-${brandName}`, name: brandName, logo: `${brandName}.png` },
    unit: {
      id: `u-${id}`,
      name: 'SAO PAULO/SP - Centro',
      address: 'Rua X, 1',
      location: { lat: -23.5, lon: -46.6 },
    },
    academicLevel: 'GRADUACAO',
    academicDegree: 'BACHARELADO',
    modality,
    submodality: 'ONLINE',
    duration: 48,
    prices: { withDiscount: 149.9, withoutDiscount: 899.9, enrollment: 0 },
    schedules: [],
    shiftOptions: ['NOTURNO'],
    businessKey: `bk-${id}`,
    dmhSource: {
      accountTeachingInstitution: {
        address: { mailingCity: 'SAO PAULO', mailingState: 'SP' },
      },
    },
  }
}

test('prateleira RENDERIZA quando o Tartarus responde com most-searched', async () => {
  const adapterOriginal = tartarus.defaults.adapter
  const fetchOriginal = globalThis.fetch

  // 10 ofertas, 4 marcas, com curso repetido em polos diferentes da MESMA marca
  // (tem que colapsar) e o mesmo curso em marcas diferentes (tem que preservar).
  const data = [
    ofertaMostSearched('1', 'Pedagogia - Licenciatura', 'Anhanguera'),
    ofertaMostSearched('2', 'Pedagogia - Licenciatura', 'Anhanguera'),
    ofertaMostSearched('3', 'Pedagogia - Licenciatura', 'Unopar'),
    ofertaMostSearched('4', 'Administração - Bacharelado', 'Anhanguera'),
    ofertaMostSearched('5', 'Administração - Bacharelado', 'Pitágoras'),
    ofertaMostSearched('6', 'Enfermagem - Bacharelado', 'Unopar'),
    ofertaMostSearched('7', 'Direito - Bacharelado', 'Estácio'),
    ofertaMostSearched('8', 'Psicologia - Bacharelado', 'Estácio'),
    ofertaMostSearched('9', 'Nutrição - Bacharelado', 'Pitágoras'),
    ofertaMostSearched('10', 'Educação Física - Licenciatura', 'Unopar'),
  ]

  tartarus.defaults.adapter = (async (config: { url?: string }) => ({
    data: { total: data.length, data, source: 'cache' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })) as never
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ data: [] }), { status: 200 })) as typeof globalThis.fetch

  try {
    const result = await loadShelf(
      { city: 'SAO PAULO', state: 'SP', modality: 'EAD' },
      'mais-procurados',
    )
    assert.ok(result.length > 0, 'a prateleira não renderizou com o Tartarus saudável')

    // Polo duplicado da MESMA marca colapsa; mesma curso em marcas distintas fica.
    const pedagogias = result.filter((o) => o.name.startsWith('Pedagogia'))
    assert.equal(pedagogias.length, 2, 'dedupe por curso+marca saiu errado')

    const marcas = new Set(result.map((o) => o.brand))
    assert.ok(marcas.size > 1, 'uma única marca dominou a prateleira')
    console.log(
      `  -> prateleira com ${result.length} ofertas, marcas: ${[...marcas].join(', ')}`,
    )
  } finally {
    tartarus.defaults.adapter = adapterOriginal
    globalThis.fetch = fetchOriginal
  }
})

/**
 * Reprodução da assimetria OBSERVADA EM PRODUÇÃO em 08/10/2026 com a Cogna
 * bloqueada: a prateleira "Bolsas EAD" renderizava e a "Mais procurados"
 * sumia — as duas saindo da MESMA loadShelf/getShowFiltersCourses.
 *
 * A diferença estava na ORDEM dentro de getShowFiltersCourses: o `throw`
 * de "Cogna caiu e a Athena não compensou" era avaliado com `athenaOffers`
 * ainda vazio, ANTES do modo descoberta (`listarCursosAthena`) rodar. Para
 * "Bolsas EAD" o fetchAthenaOffers já trazia oferta e não havia throw; para
 * "Mais procurados" (city/state) ele vinha vazio, o throw disparava e matava
 * a prateleira mesmo com a Estácio tendo oferta no modo descoberta.
 */
test('Cogna caída + Athena só no modo descoberta: prateleira ainda renderiza', async () => {
  const { athena } = await import('../api/axios')
  const adapterTartarus = tartarus.defaults.adapter
  const adapterAthena = athena.defaults.adapter
  const fetchOriginal = globalThis.fetch
  const athenaBaseAnterior = process.env.ATHENA_BASE_URL

  process.env.ATHENA_BASE_URL = 'http://athena.local'
  tartarus.defaults.adapter = adapterQueFalhaComo400() as never

  // Reproduz o comportamento REAL da Athena que cria a assimetria: a consulta
  // ABERTA de ofertas (sem courseName) — a que fetchAthenaOffers faz na página
  // 1 — volta vazia, enquanto a consulta POR CURSO (modo descoberta, depois do
  // api/courses) devolve oferta. Sem isso o teste não isola nada: um stub que
  // responde às duas já satisfaz o código antigo.
  const ofertaDireito = {
    id: 'of-1',
    course: { name: 'DIREITO', academicLevel: 'GRADUACAO' },
    institution: { name: 'Estácio' },
    priceFrom: 899.9,
    priceTo: 199.9,
    modality: 'EAD',
    unit: { city: 'SAO PAULO', state: 'SP', name: 'Polo Centro' },
  }
  athena.defaults.adapter = (async (config: { url?: string; params?: Record<string, string> }) => {
    let body: unknown = { data: [], meta: { total: 0 } }
    if (config.url?.includes('api/courses')) {
      body = { data: [{ id: 'c1', name: 'DIREITO', academicLevel: 'GRADUACAO' }], meta: { total: 1 } }
    } else if (config.params?.courseName) {
      body = { data: [ofertaDireito], meta: { total: 1 } }
    }
    return { data: body, status: 200, statusText: 'OK', headers: {}, config }
  }) as never

  // /api/athena-offers (o fetchAthenaOffers da página 1) vem VAZIO de propósito:
  // é o estado que fazia a "Mais procurados" morrer antes do modo descoberta.
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ data: [] }), { status: 200 })) as typeof globalThis.fetch

  try {
    const result = await loadShelf({ city: 'SAO PAULO', state: 'SP' }, 'mais-procurados')
    assert.ok(
      result.length > 0,
      'a prateleira sumiu mesmo com a Estácio tendo oferta no modo descoberta',
    )
    assert.equal(result[0].name, 'Direito')
    console.log(`  -> renderizou ${result.length} oferta(s) via Estácio: ${result[0].name}`)
  } finally {
    tartarus.defaults.adapter = adapterTartarus
    athena.defaults.adapter = adapterAthena
    globalThis.fetch = fetchOriginal
    if (athenaBaseAnterior === undefined) delete process.env.ATHENA_BASE_URL
    else process.env.ATHENA_BASE_URL = athenaBaseAnterior
  }
})

/**
 * Contrato novo do Tartarus: /offers/most-searched passa a responder 503
 * quando o cache esta frio E a Cogna falhou, em vez de 200 com
 * { total: 0, data: [], source: 'error' } (falha disfarcada de vazio).
 *
 * Do lado do portal isso NAO pode virar regressao: getTartarusFilteredCourses
 * ja envolve o most-searched em try/catch e cai pra busca normal. O teste
 * trava esse contrato — a degradacao agora e deliberada, nao acidental.
 */
test('503 do most-searched cai pra busca normal e a prateleira renderiza', async () => {
  const adapterOriginal = tartarus.defaults.adapter
  const fetchOriginal = globalThis.fetch
  const chamadas: string[] = []

  tartarus.defaults.adapter = (async (config: { url?: string }) => {
    const url = config.url ?? ''
    chamadas.push(url)

    if (url.includes('most-searched')) {
      const error = new Error('Request failed with status code 503') as Error & {
        response?: unknown
        config?: unknown
        isAxiosError?: boolean
      }
      error.isAxiosError = true
      error.config = config
      error.response = {
        status: 503,
        data: { message: 'Fonte de ofertas indisponivel', upstreamStatus: 429 },
      }
      throw error
    }

    // Busca normal saudavel (a Cogna voltou, ou o bloqueio nao a atingiu).
    return {
      data: {
        totalItems: 1,
        totalPages: 1,
        data: [
          {
            id: 'c-1',
            name: 'Enfermagem - Bacharelado',
            brand: 'Unopar',
            academicLevel: 'GRADUACAO',
            modality: 'EAD',
            minPrice: 189.9,
            maxPrice: 799.9,
            unitName: 'SAO PAULO/SP - Centro',
            city: 'SAO PAULO',
            uf: 'SP',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }) as never

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ data: [] }), { status: 200 })) as typeof globalThis.fetch

  try {
    const result = await loadShelf({ city: 'SAO PAULO', state: 'SP' }, 'mais-procurados')

    assert.ok(
      chamadas.some((u) => u.includes('most-searched')),
      'o most-searched nem chegou a ser tentado',
    )
    assert.ok(
      chamadas.some((u) => u.includes('cogna/courses/search')),
      'o 503 nao acionou o fallback pra busca normal',
    )
    assert.ok(result.length > 0, 'a prateleira sumiu por causa do 503')
    assert.equal(result[0].name, 'Enfermagem - Bacharelado')
  } finally {
    tartarus.defaults.adapter = adapterOriginal
    globalThis.fetch = fetchOriginal
  }
})
