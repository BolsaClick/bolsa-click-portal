/* eslint-disable @typescript-eslint/no-explicit-any */
import {  opencage } from "./axios"


export async function getLocal({ queryKey }: any) {
  const [, latitude, longitude] = queryKey

  const response = await opencage.get(`geocode/v1/json`, {
    params: {
      q: `${latitude},${longitude}`,
      key: process.env.OPENCAGE_KEY,
      language: 'pt-br',
    },
  })

  return response.data
}
