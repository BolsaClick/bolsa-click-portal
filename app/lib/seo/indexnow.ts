// IndexNow — protocolo de notificação instantânea pra search engines.
// Bing, Yandex, Seznam e (via parceria) Naver consumem direto. Bingbot
// alimenta também AI Overviews + ChatGPT Search.
//
// Spec: https://www.indexnow.org/documentation
// Verificação: o arquivo /public/{KEY}.txt deve servir exatamente esta chave.
//
// USO:
//   import { pingIndexNow } from '@/app/lib/seo/indexnow'
//   await pingIndexNow([
//     'https://www.bolsaclick.com.br/blog/novo-post',
//   ])
//
// Limites do protocolo:
//   - 10.000 URLs por request (excedente é rejeitado)
//   - Recomendado batchear em lotes de 100-1000 pra resposta rápida

export const INDEXNOW_KEY = '6c3c24721eddf5c9fa2d720ae2df6a6a'
export const INDEXNOW_HOST = 'www.bolsaclick.com.br'
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

type PingResult = {
  ok: boolean
  status: number
  urls: number
  reason?: string
}

export async function pingIndexNow(urls: string[]): Promise<PingResult> {
  if (urls.length === 0) {
    return { ok: true, status: 200, urls: 0, reason: 'no-urls' }
  }

  // Spec: máx 10k URLs por payload. Trunca pra evitar 422.
  const truncated = urls.slice(0, 10_000)

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: truncated,
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // 200/202 = aceito; 422 = formato inválido; 429 = rate limit;
    // 403 = key inválida; 400 = bad request.
    return {
      ok: response.ok || response.status === 202,
      status: response.status,
      urls: truncated.length,
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      urls: truncated.length,
      reason: (err as Error).message,
    }
  }
}
