// IndexNow integration — notifica Bing/Yandex/Naver instantaneamente quando URLs
// são publicadas/atualizadas. Reduz lag de indexação de dias para segundos.
//
// Uso típico (em server actions ou route handlers de admin/CMS):
//   await submitToIndexNow(['https://www.bolsaclick.com.br/blog/meu-post'])

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? 'f631d024680f4f78b5a196f16be58e9a'
const SITE_HOST = 'www.bolsaclick.com.br'
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`

export interface IndexNowResult {
  ok: boolean
  status: number
  submitted: number
  message?: string
}

export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (!urls.length) {
    return { ok: false, status: 400, submitted: 0, message: 'No URLs provided' }
  }

  const validUrls = urls.filter((u) => {
    try {
      const parsed = new URL(u)
      return parsed.host === SITE_HOST
    } catch {
      return false
    }
  })

  if (!validUrls.length) {
    return { ok: false, status: 400, submitted: 0, message: 'No URLs match the configured host' }
  }

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: validUrls,
      }),
    })
    return {
      ok: res.ok,
      status: res.status,
      submitted: validUrls.length,
      message: res.ok ? 'Submitted' : await res.text().catch(() => 'Unknown error'),
    }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      submitted: 0,
      message: e instanceof Error ? e.message : 'Network error',
    }
  }
}
