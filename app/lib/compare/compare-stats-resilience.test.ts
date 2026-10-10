/**
 * Regressão: a Cogna fora do ar não pode levar embora a tabela de mensalidade
 * das páginas /comparar/[pair].
 *
 * Mesmo incidente de 08/10/2026 que tirou a prateleira da home (Cogna
 * respondendo 429, Tartarus reempacotando como 400), em outra superfície —
 * ver app/lib/home/vitrine-shelf-resilience.test.ts. Aqui o estrago era maior
 * em dois pontos:
 *
 *   - a amostra vinha de 21 chamadas com `.catch(() => [])` cada, então
 *     "fonte caída" e "curso sem oferta" eram indistinguíveis;
 *   - o resultado degradado entrava no `unstable_cache` de 24h, congelando a
 *     tabela vazia por um dia em todos os pares de uma vez.
 *
 * Os testes exercitam as duas metades: o coletor contra o axios mockado (prova
 * que a queda é REGISTRADA, não engolida) e a decisão pura `pickCompareStats`
 * (prova que a tabela sobrevive pelo catálogo, e que nunca inventa número).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.ATHENA_BASE_URL = 'http://athena.test'

import { athena, tartarus } from '../api/axios'
import {
  collectOffersSample,
  computeBrandStats,
  isSampleUsable,
  pickCompareStats,
  type CatalogStats,
  type OffersSample,
} from './offers-sample'

const ANHANGUERA = { slug: 'anhanguera', name: 'Anhanguera' }
const ESTACIO = { slug: 'estacio', name: 'Estácio' }

/** Reproduz o 400 do Tartarus embrulhando o 429 da Cogna. */
function tartarusCaido() {
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

/** Oferta Estácio no shape que a Athena devolve (normalizeAthenaOffer consome). */
function ofertaAthena(id: string, name: string) {
  return {
    offerId: id,
    id,
    courseName: name,
    name,
    brand: 'Estácio',
    institutionName: 'UNIVERSIDADE ESTÁCIO DE SÁ',
    modality: 'EAD',
    academicLevel: 'GRADUACAO',
    minPrice: 149.9,
    maxPrice: 599.9,
    city: 'SAO PAULO',
    uf: 'SP',
    unitName: 'SAO PAULO/SP - Centro',
    unitCity: 'SAO PAULO',
  }
}

function athenaRespondendo() {
  return (async (config: { url?: string }) => ({
    data: { data: [ofertaAthena('a1', 'Pedagogia'), ofertaAthena('a2', 'Direito')] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })) as never
}

async function comAdapters(
  adapters: { tartarus: unknown; athena: unknown },
  fn: () => Promise<void>,
) {
  const origTartarus = tartarus.defaults.adapter
  const origAthena = athena.defaults.adapter
  tartarus.defaults.adapter = adapters.tartarus as never
  athena.defaults.adapter = adapters.athena as never
  try {
    await fn()
  } finally {
    tartarus.defaults.adapter = origTartarus
    athena.defaults.adapter = origAthena
  }
}

test('Cogna caída com Estácio viva: a amostra REGISTRA a queda em vez de engolir', async () => {
  await comAdapters({ tartarus: tartarusCaido(), athena: athenaRespondendo() }, async () => {
    const sample = await collectOffersSample()

    // O ponto da regressão: antes isto resolvia com `[]` por curso e a amostra
    // ficava indistinguível de uma saudável. Agora a fonte caída fica marcada.
    assert.ok(
      sample.failedSources.includes('cogna'),
      'a queda da Cogna não foi registrada em failedSources — voltou a ser engolida',
    )
    assert.equal(
      isSampleUsable(sample),
      false,
      'amostra sem a Cogna foi dada como boa; as marcas Cogna sairiam zeradas na tabela',
    )
  })
})

test('tabela SOBREVIVE pelo catálogo quando a amostra viva está degradada', async () => {
  // Amostra como ela fica com a Cogna fora: 21 cursos "responderam", só que só
  // com oferta Estácio. Ninguém pode ler isso como "Anhanguera tem zero curso".
  const degradada: OffersSample = {
    offers: [],
    okCourses: 21,
    totalCourses: 21,
    failedSources: ['cogna'],
  }
  // O que o precompute semanal (InstitutionCityOfferCache) já tinha medido.
  const catalogo: CatalogStats = {
    stats: new Map([
      ['anhanguera', { offerCount: 6639, courseCount: null, cityCount: 209, avgPrice: null, minPrice: 107.2 }],
      ['estacio', { offerCount: 4352, courseCount: null, cityCount: 228, avgPrice: null, minPrice: 99 }],
    ]),
    measuredAt: new Date('2026-10-04T10:48:00Z'),
  }

  const picked = pickCompareStats(degradada, catalogo, ANHANGUERA, ESTACIO)

  assert.ok(picked, 'a tabela de mensalidade sumiu inteira — era exatamente o bug')
  assert.equal(picked.source, 'catalogo')
  assert.equal(picked.a.minPrice, 107.2)
  assert.equal(picked.b.cityCount, 228)
  // O catálogo não mede curso nem preço médio: tem que sair `null` (vira "—"),
  // nunca 0 e nunca estimativa.
  assert.equal(picked.a.courseCount, null, 'catálogo inventou contagem de curso')
  assert.equal(picked.b.avgPrice, null, 'catálogo inventou preço médio')
})

test('nunca publica comparação assimétrica: uma marca com dado e a outra zerada', async () => {
  // Amostra "cheia" (nenhuma fonte marcada como caída) mas que só contém
  // Estácio. Com a regra antiga (`statsA.offerCount > 0 || statsB...`) isto
  // renderizava "Estácio: 2 cursos / Anhanguera: —" como se fosse comparação.
  const soEstacio: OffersSample = {
    offers: [
      { brand: 'Estácio', name: 'Pedagogia', minPrice: 149.9, unitCity: 'SAO PAULO' },
      { brand: 'Estácio', name: 'Direito', minPrice: 199.9, unitCity: 'RIO DE JANEIRO' },
    ] as never,
    okCourses: 21,
    totalCourses: 21,
    failedSources: [],
  }
  assert.ok(isSampleUsable(soEstacio), 'fixture inválida: a amostra deveria passar no gate de cobertura')
  assert.ok(
    computeBrandStats(soEstacio.offers, 'Anhanguera').offerCount === 0,
    'fixture inválida: a Anhanguera deveria estar ausente',
  )

  const semCatalogo: CatalogStats = { stats: new Map(), measuredAt: null }
  const picked = pickCompareStats(soEstacio, semCatalogo, ANHANGUERA, ESTACIO)

  assert.equal(
    picked,
    null,
    'publicou a tabela com uma coluna cheia e a outra vazia — comparação falsa',
  )
})

test('tudo caído e sem catálogo: linhas vivas somem, mas nada é inventado', async () => {
  await comAdapters(
    {
      tartarus: tartarusCaido(),
      athena: () => Promise.reject(new Error('athena fora do ar')),
    },
    async () => {
      const sample = await collectOffersSample()
      assert.equal(sample.offers.length, 0)
      assert.equal(
        sample.okCourses,
        0,
        'curso que falhou nas duas fontes foi contado como respondido',
      )
      assert.equal(isSampleUsable(sample), false)

      const picked = pickCompareStats(
        sample,
        { stats: new Map(), measuredAt: null },
        ANHANGUERA,
        ESTACIO,
      )
      assert.equal(picked, null, 'sem fonte nenhuma, a tabela tem que omitir a linha')
    },
  )
})

test('caminho feliz: as duas marcas na amostra viva mantêm os 4 campos', async () => {
  const saudavel: OffersSample = {
    offers: [
      { brand: 'Anhanguera', name: 'Pedagogia', minPrice: 120, unitCity: 'SAO PAULO' },
      { brand: 'Anhanguera', name: 'Direito', minPrice: 180, unitCity: 'CAMPINAS' },
      { brand: 'Estácio', name: 'Pedagogia', minPrice: 149.9, unitCity: 'SAO PAULO' },
      { brand: 'Estácio', name: 'Enfermagem', minPrice: 250, unitCity: 'RIO DE JANEIRO' },
    ] as never,
    okCourses: 21,
    totalCourses: 21,
    failedSources: [],
  }

  const picked = pickCompareStats(
    saudavel,
    { stats: new Map(), measuredAt: null },
    ANHANGUERA,
    ESTACIO,
  )

  assert.ok(picked)
  assert.equal(picked.source, 'live')
  assert.equal(picked.a.minPrice, 120)
  assert.equal(picked.a.courseCount, 2)
  assert.equal(picked.a.cityCount, 2)
  assert.equal(picked.a.avgPrice, 150)
  assert.equal(picked.b.minPrice, 149.9)
})
