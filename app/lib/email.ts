// Wrapper de envio de email transacional via Resend.
// Sem instalar SDK — usa fetch direto.
// Em dev/staging sem RESEND_API_KEY, o helper só loga e retorna sucesso —
// não bloqueia testes locais de fluxo.

const RESEND_API_URL = 'https://api.resend.com/emails'

interface SendEmailInput {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'Bolsa Click <no-reply@bolsaclick.com.br>'

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY ausente — email não enviado:', {
      to: input.to,
      subject: input.subject,
      preview: input.text?.slice(0, 200) ?? input.html.slice(0, 200),
    })
    return { ok: true } // não bloqueia o fluxo em dev
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.text && { text: input.text }),
        ...(input.replyTo && { reply_to: input.replyTo }),
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('⚠️ Resend falhou:', response.status, data)
      return { ok: false }
    }

    return { ok: true, id: data?.id }
  } catch (error) {
    console.error('⚠️ Resend exception:', error)
    return { ok: false }
  }
}
