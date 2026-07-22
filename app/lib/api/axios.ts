import axios from 'axios'

const fixieUrlString = process.env.FIXIE_URL ?? ''

let parsedFixieUrl: URL

try {
  parsedFixieUrl = new URL(fixieUrlString)
} catch {
  console.error(
    'Erro: A URL fornecida para FIXIE_URL é inválida ou não foi definida.',
  )
  throw new Error(
    'A URL fornecida para FIXIE_URL é inválida ou não foi definida!',
  )
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  proxy: {
    host: parsedFixieUrl.hostname,
    port: Number(parsedFixieUrl.port), 
    auth: {
      username: parsedFixieUrl.username,
      password: parsedFixieUrl.password,
    },
  },

})
export const tartarus = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TARTARUS_API,
  headers: {
    'Content-Type': 'application/json',
  },

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