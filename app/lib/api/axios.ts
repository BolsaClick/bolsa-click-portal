import axios from 'axios'

// `TARTARUS_API_KEY` é segredo de servidor (NÃO NEXT_PUBLIC): quando setada,
// vai como `x-api-key` nas chamadas ao Tartarus. Como este cliente é
// importado tanto por rotas server-side (app/api/checkout/matricula/*, por
// onde a matrícula passa a ir — ver achado 3.1.6 do SECURITY_AUDIT.md)
// quanto por alguns componentes client ainda não migrados, no bundle do
// navegador a env var fica undefined e o header não é enviado — mesmo padrão
// já usado para `ELYSIUM_API_KEY` abaixo. O Tartarus ainda aceita chamadas
// sem a chave nessas rotas, então o deploy não quebra antes dela existir
// (ver env.example).
export const tartarus = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TARTARUS_API,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.TARTARUS_API_KEY
      ? { 'x-api-key': process.env.TARTARUS_API_KEY }
      : {}),
  },
})

/**
 * Instrumentação de falha do Tartarus.
 *
 * Sem isto, um erro do BFF chega no chamador só como "Request failed with
 * status code 400" — sem URL, sem params e sem o motivo REAL, que vem no corpo
 * da resposta. Foi exatamente o que escondeu, por horas, um bloqueio
 * 429 da Cogna ("tentativa de fraude") que o Tartarus reempacota como 400:
 * a prateleira "Mais procurados" sumia da home sem nenhum rastro do porquê.
 *
 * Só loga (nunca engole): reinjeta a mensagem do upstream no `error.message`
 * para que quem der catch lá em cima — p.ex. reportEmptyShelf — registre a
 * causa de verdade em vez do texto genérico do axios.
 */
tartarus.interceptors.response.use(undefined, (error) => {
  const cfg = error?.config ?? {}
  // baseURL vem sem barra final e o path sem barra inicial: concatenar cru
  // produzia ".../apicogna/courses/search" — URL diagnóstica errada é pior
  // que URL nenhuma, porque manda quem investiga pro endpoint que não existe.
  const base = String(cfg.baseURL ?? '').replace(/\/+$/, '')
  const path = String(cfg.url ?? '').replace(/^\/+/, '')
  const url = base && path ? `${base}/${path}` : base || path
  const status = error?.response?.status
  const upstream = error?.response?.data

  console.error('[tartarus] request falhou', {
    method: (cfg.method ?? 'get').toUpperCase(),
    url,
    params: cfg.params,
    status: status ?? '(sem resposta)',
    upstream,
  })

  // O motivo real do upstream vale mais que "status code 400" para quem loga
  // a prateleira vazia; preserva o status para quem ainda checa error.response.
  const detail =
    typeof upstream?.message === 'string'
      ? upstream.message
      : typeof upstream === 'string'
        ? upstream
        : null
  if (detail) {
    error.message = `${error.message} — ${detail}`
  }
  return Promise.reject(error)
})

export const opencage = axios.create({
  baseURL: process.env.OPENCAGE_URL,
})

export const cogna = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_COGNA_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

// `ELYSIUM_API_KEY` é segredo de servidor (NÃO NEXT_PUBLIC): só existe nas
// chamadas server-side (rotas /api/*), que é por onde o checkout passa. No
// bundle client fica undefined e o header não é enviado — correto, pois o
// browser nunca fala direto com o Elysium.
export const elysium = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ELYSIUM_API,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.ELYSIUM_API_KEY
      ? { 'x-api-key': process.env.ELYSIUM_API_KEY }
      : {}),
  },
})

// Athena — nova fonte de ofertas (roteia YDUQS/Estácio).
// Rota pública (sem auth); base URL server-side (chamada via route handler).
export const athena = axios.create({
  baseURL: process.env.ATHENA_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})