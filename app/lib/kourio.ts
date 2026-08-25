// Wrapper de envio de email transacional via Kourio.
// Sem instalar SDK — usa fetch direto, mesmo padrão de app/lib/email.ts (Resend).
// Em dev/staging sem KOURIO_API_KEY, o helper só loga e retorna sucesso —
// não bloqueia testes locais de fluxo.
//
// Docs: https://docs.kourio.app/envio, https://docs.kourio.app/autenticacao,
// https://docs.kourio.app/primeiro-envio
//
// A API do Kourio aceita dois formatos de body, mutuamente exclusivos:
//   1) subject + from + html/text (o que usamos aqui — HTML inline)
//   2) templateId + variables (subject/from vêm do template)
// Não existe hoje um template cadastrado no Kourio pra este e-mail, então
// mandamos HTML cru. Se um template for criado depois, trocar para o modo
// (2) é só passar templateId + variables em vez de subject/html.

const KOURIO_API_URL = 'https://kourio.app/v1/emails'

interface SendKourioEmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendKourioEmail(input: SendKourioEmailInput): Promise<{ ok: boolean; id?: string }> {
  const apiKey = process.env.KOURIO_API_KEY
  const from = process.env.KOURIO_FROM_EMAIL || 'Bolsa Click <edu@news.bolsaclick.com.br>'

  if (!apiKey) {
    console.warn('⚠️ KOURIO_API_KEY ausente — email não enviado:', {
      to: input.to,
      subject: input.subject,
      preview: input.text?.slice(0, 200) ?? input.html.slice(0, 200),
    })
    return { ok: true } // não bloqueia o fluxo em dev
  }

  try {
    const response = await fetch(KOURIO_API_URL, {
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
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('⚠️ Kourio falhou:', response.status, data)
      return { ok: false }
    }

    return { ok: true, id: data?.id }
  } catch (error) {
    console.error('⚠️ Kourio exception:', error)
    return { ok: false }
  }
}
