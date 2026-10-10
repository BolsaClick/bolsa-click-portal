/**
 * Fila do precompute-city-offers, com dado sintético (sem banco, sem Tartarus).
 *
 * `filaAntiga` reproduz a ordenação que existia até 2026-10-10 (por curso,
 * pelo par mais velho, ausente = época 0, curso inteiro reconsultado). Os
 * testes de regressão afirmam que a fila nova passa E que a antiga falha no
 * mesmo cenário — é a prova de que o teste pega o defeito.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AxiosError, AxiosHeaders } from 'axios'

import {
  blockedMinutes,
  buildWorkQueue,
  classifyFailure,
  pairKey,
  type QueueCity,
  type QueueCourse,
} from './precompute-city-offers-queue'

const DAY = 86_400_000
const NOW = new Date('2026-10-11T03:17:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY)

type Course = QueueCourse & { slug: string }
const course = (slug: string, hasCityPages = true): Course => ({ id: slug, slug, hasCityPages })
const cities = (n: number): QueueCity[] => Array.from({ length: n }, (_, i) => ({ slug: `c${i}` }))

/** Pares (curso|cidade) processados quando o orçamento acaba depois de `budget` pares. */
function processadosNova(courses: Course[], cs: QueueCity[], cached: Map<string, Date>, budget: number) {
  return buildWorkQueue({ courses, cities: cs, cached, now: NOW, minAgeDays: 6 })
    .slice(0, budget)
    .map((w) => pairKey(w.course.id, w.city.slug))
}

/**
 * A fila de antes, fiel ao código removido: cursos ordenados pelo par pendente
 * mais velho (ausente = 0), e o curso escolhido é processado INTEIRO — o teto
 * de tempo só era checado no começo de cada curso.
 */
function processadosAntiga(courses: Course[], cs: QueueCity[], cached: Map<string, Date>, budget: number) {
  const cutoff = daysAgo(6)
  const fila = courses
    .map((c) => {
      const pending = cs.filter((city) => {
        const at = cached.get(pairKey(c.id, city.slug))
        return !at || at < cutoff
      })
      let oldestAt = Number.POSITIVE_INFINITY
      for (const city of pending) {
        const at = cached.get(pairKey(c.id, city.slug))
        const t = at ? at.getTime() : 0
        if (t < oldestAt) oldestAt = t
      }
      return { c, pending, oldestAt }
    })
    .filter((x) => x.pending.length > 0)
    .sort((a, b) => a.oldestAt - b.oldestAt)
  const out: string[] = []
  for (const { c, pending } of fila) {
    if (out.length >= budget) break
    for (const city of pending) out.push(pairKey(c.id, city.slug))
  }
  return out
}

function grade(courses: Course[], cs: QueueCity[], idade: (c: Course, city: QueueCity) => number | null) {
  const m = new Map<string, Date>()
  for (const c of courses)
    for (const city of cs) {
      const d = idade(c, city)
      if (d !== null) m.set(pairKey(c.id, city.slug), daysAgo(d))
    }
  return m
}

describe('regressão: rodada truncada tem que avançar as linhas VELHAS', () => {
  it('cursos com lacuna NÃO furam a fila de cursos com linhas de 30 dias (ausente ≠ época 0)', () => {
    const cs = cities(20)
    const comLacuna = [course('a'), course('b')]
    const velhos = [course('v1'), course('v2')]
    const courses = [...comLacuna, ...velhos] // trendScore desc: os com lacuna vêm antes
    // a, b: 1 cidade sem linha, o resto medido há 8 dias. v1, v2: tudo há 30 dias.
    const cached = grade(courses, cs, (c, city) =>
      c.slug.startsWith('v') ? 30 : city.slug === 'c0' ? null : 8,
    )
    const budget = 40 // cabe exatamente os 2 cursos velhos
    const velhasKeys = velhos.flatMap((c) => cs.map((city) => pairKey(c.id, city.slug)))

    const nova = new Set(processadosNova(courses, cs, cached, budget))
    assert.ok(velhasKeys.every((k) => nova.has(k)), 'fila nova avança todas as linhas de 30 dias')

    const antiga = new Set(processadosAntiga(courses, cs, cached, budget))
    assert.ok(!velhasKeys.some((k) => antiga.has(k)), 'fila antiga: as de 30 dias nem são tocadas')
  })

  it('cenário real de 10/10: curso com pares que a Cogna falhou não consome o orçamento inteiro', () => {
    const cs = cities(160)
    // Dois cursos processados semana passada, mas com 5 pares cada que a Cogna
    // falhou há 40 dias (eram 197 assim em 10/10), e um curso inteiro há 20 dias.
    const misto1 = course('misto1')
    const misto2 = course('misto2')
    const parado = course('parado')
    const courses = [misto1, misto2, parado]
    const cached = grade(courses, cs, (c, city) =>
      c === parado ? 20 : Number(city.slug.slice(1)) < 5 ? 40 : 7,
    )
    const budget = 170 // 10 pares falhos + 160 do parado
    const paradoKeys = cs.map((city) => pairKey(parado.id, city.slug))
    const falhos = [misto1, misto2].flatMap((c) => cs.slice(0, 5).map((city) => pairKey(c.id, city.slug)))

    const nova = processadosNova(courses, cs, cached, budget)
    assert.deepEqual(new Set(nova.slice(0, 10)), new Set(falhos), 'os pares falhos vêm primeiro — custam 10, não 320')
    assert.ok(paradoKeys.every((k) => nova.includes(k)), 'e o curso parado é alcançado na mesma rodada')

    const antiga = processadosAntiga(courses, cs, cached, budget)
    assert.equal(antiga.filter((k) => k.startsWith('misto')).length, 320, 'antiga reconsulta os dois cursos inteiros')
    assert.ok(paradoKeys.filter((k) => antiga.includes(k)).length < paradoKeys.length, 'antiga não completa o parado')
  })
})

describe('política de urgência', () => {
  it('camada 1 (SLA 7d) vence camada 2 (SLA 28d) até a 2 passar do próprio SLA', () => {
    const cs = cities(1)
    const c1 = course('com-pagina', true)
    const c2 = course('sem-pagina', false)
    const ordem = (idade1: number, idade2: number) =>
      buildWorkQueue({
        courses: [c2, c1],
        cities: cs,
        cached: grade([c1, c2], cs, (c) => (c === c1 ? idade1 : idade2)),
        now: NOW,
        minAgeDays: 0,
      }).map((w) => w.course.slug)
    assert.deepEqual(ordem(8, 20), ['com-pagina', 'sem-pagina']) // 1,14 > 0,71
    assert.deepEqual(ordem(8, 35), ['sem-pagina', 'com-pagina']) // 1,25 > 1,14
  })

  it('lacuna = linha a 75% do SLA: depois de quase vencida, antes de fresca', () => {
    const cs = cities(3)
    const c = course('x')
    const cached = new Map([
      [pairKey('x', 'c0'), daysAgo(6)], // 0,86
      [pairKey('x', 'c2'), daysAgo(4)], // 0,57
    ]) // c1 = lacuna (0,75)
    const q = buildWorkQueue({ courses: [c], cities: cs, cached, now: NOW, minAgeDays: 0 })
    assert.deepEqual(q.map((w) => [w.city.slug, w.kind]), [
      ['c0', 'stale'],
      ['c1', 'gap'],
      ['c2', 'stale'],
    ])
  })

  it('--max-age-days deixa de fora o que é mais novo, mas nunca a lacuna', () => {
    const cs = cities(3)
    const cached = new Map([
      [pairKey('x', 'c0'), daysAgo(2)],
      [pairKey('x', 'c1'), daysAgo(9)],
    ])
    const q = buildWorkQueue({ courses: [course('x')], cities: cs, cached, now: NOW, minAgeDays: 6 })
    assert.deepEqual(q.map((w) => w.city.slug).sort(), ['c1', 'c2'])
  })
})

describe('garantia de progresso (simulação de rodadas semanais)', () => {
  /**
   * Com capacidade suficiente para a demanda dos SLAs (camada 1 inteira toda
   * semana + 1/4 da camada 2), depois de algumas rodadas nenhuma linha passa
   * do SLA da sua camada — partindo de um cache bagunçado (até 60 dias).
   */
  it('capacidade ≥ P1 + P2/4 ⇒ camada 1 ≤ 7 dias e camada 2 ≤ 28 dias', () => {
    const cs = cities(10)
    const t1 = Array.from({ length: 10 }, (_, i) => course(`t1-${i}`, true)) // 100 pares
    const t2 = Array.from({ length: 40 }, (_, i) => course(`t2-${i}`, false)) // 400 pares
    const courses = [...t1, ...t2]
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const fetched = new Map<string, number>()
    for (const c of courses) for (const city of cs) fetched.set(pairKey(c.id, city.slug), -Math.floor(rand() * 60))

    const capacidade = 100 + 400 / 4 // 200
    let maxT1 = 0
    let maxT2 = 0
    for (let semana = 0; semana < 12; semana++) {
      const hoje = semana * 7
      const now = new Date(NOW.getTime() + hoje * DAY)
      const cached = new Map([...fetched].map(([k, d]) => [k, new Date(NOW.getTime() + d * DAY)]))
      // Idade máxima ANTES da rodada, a partir da 5ª semana (regime).
      if (semana >= 5) {
        for (const c of courses)
          for (const city of cs) {
            const idade = hoje - fetched.get(pairKey(c.id, city.slug))!
            if (c.hasCityPages) maxT1 = Math.max(maxT1, idade)
            else maxT2 = Math.max(maxT2, idade)
          }
      }
      for (const w of buildWorkQueue({ courses, cities: cs, cached, now, minAgeDays: 6 }).slice(0, capacidade)) {
        fetched.set(pairKey(w.course.id, w.city.slug), hoje)
      }
    }
    assert.ok(maxT1 <= 7, `camada 1 chegou a ${maxT1} dias`)
    assert.ok(maxT2 <= 28, `camada 2 chegou a ${maxT2} dias`)
  })
})

describe('motivo da falha', () => {
  const erro = (status: number | null, data?: unknown, code?: string, message = 'Request failed') => {
    const e = new AxiosError(message, code)
    if (status !== null) {
      e.response = { status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data }
    }
    return e
  }

  it('429 da Cogna reempacotado como 400 pelo Tartarus conta como 429, não 4xx', () => {
    assert.equal(classifyFailure(erro(400, { cognaStatus: 429, message: 'Cogna rejeitou a requisição [HTTP 429]' })), 'http_429')
  })

  it('bloqueio anunciado em minutos é categoria própria (e aborta a rodada)', () => {
    const e = erro(400, {
      cognaStatus: 429,
      cognaError: { message: 'Possível tentativa de fraude identificada. Acesso ao sistema bloqueado por 55 minutos.' },
    })
    assert.equal(classifyFailure(e), 'bloqueio_antifraude')
    assert.equal(blockedMinutes(e), 55)
    assert.equal(blockedMinutes(erro(400, { cognaStatus: 429 })), null)
  })

  it('mensagem no formato do interceptor de axios.ts também é lida', () => {
    assert.equal(classifyFailure(new Error('Request failed with status code 400 — Cogna rejeitou a requisição [HTTP 429]')), 'http_429')
  })

  it('timeout, 5xx, 4xx, rede', () => {
    assert.equal(classifyFailure(erro(null, undefined, 'ECONNABORTED', 'timeout of 15000ms exceeded')), 'timeout')
    assert.equal(classifyFailure(erro(502, {})), 'http_5xx')
    assert.equal(classifyFailure(erro(400, { message: 'courseName inválido' })), 'http_4xx')
    assert.equal(classifyFailure(erro(null, undefined, 'ECONNRESET')), 'rede')
    assert.equal(classifyFailure(new Error('boom')), 'outro')
  })
})
