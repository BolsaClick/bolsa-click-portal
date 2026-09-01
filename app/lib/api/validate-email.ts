export interface EmailValidationResult {
  ok: boolean
  error?: string
}

/**
 * Confirma no servidor que o domínio do e-mail tem registro MX (ver
 * `app/lib/validation/email-mx.ts` para a lógica de fail-open).
 *
 * Fail-open também aqui: qualquer falha no fetch (rede do usuário, API fora
 * do ar) devolve `ok: true` — esta checagem nunca pode ser o motivo de um
 * checkout que cobra dinheiro travar.
 */
export async function validateEmailDeliverability(email: string): Promise<EmailValidationResult> {
  try {
    const response = await fetch('/api/validation/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await response.json().catch(() => ({ ok: true }))
    if (!response.ok) {
      return { ok: false, error: data?.error || 'Não conseguimos validar esse e-mail. Confira se está correto.' }
    }
    return { ok: data?.ok !== false }
  } catch {
    return { ok: true }
  }
}
