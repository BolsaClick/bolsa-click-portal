/* eslint-disable @typescript-eslint/no-unused-vars */
import { env } from '@/lib/env'
import axios from 'axios'



const fixieUrlString = 'http://fixie:4XUwsVeZvVuwnPg@criterium.usefixie.com:80'

let parsedFixieUrl: URL

try {
  parsedFixieUrl = new URL(fixieUrlString)
} catch (error) {
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

export const elysium = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ELYSIUM_API,
  headers: {
    'Content-Type': 'application/json',
  },
})