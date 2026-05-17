import { randomBytes } from 'crypto'

// 32 bytes = 64 hex chars. Suficiente pra magic link não-adivinhável.
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// 24h pra verificação de email (autor do review).
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

// 7 dias pra resposta da faculdade (mais tempo pra acharem o email).
export const RESPONSE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function expiresAt(ttlMs: number): Date {
  return new Date(Date.now() + ttlMs)
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now()
}
