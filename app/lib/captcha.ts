// Verificação server-side de Cloudflare Turnstile.
// Em dev sem TURNSTILE_SECRET_KEY, retorna sempre true (não trava local).

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.warn('⚠️ TURNSTILE_SECRET_KEY ausente — verificação desligada (dev mode)')
    return true
  }

  if (!token) return false

  try {
    const body = new URLSearchParams()
    body.append('secret', secret)
    body.append('response', token)
    if (ip) body.append('remoteip', ip)

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body,
    })

    const data = await response.json().catch(() => null)
    return Boolean(data?.success)
  } catch (error) {
    console.error('⚠️ Turnstile verify exception:', error)
    return false
  }
}
