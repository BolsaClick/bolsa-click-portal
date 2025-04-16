import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_API_COGNA_URL: z.string().url(),
  NEXT_PUBLIC_API_TOKEN: z.string(),
  OPENCAGE_URL: z.string().url(),
  FIXIE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
