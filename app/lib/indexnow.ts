// IndexNow integration — notifica Bing/Yandex/Naver instantaneamente quando URLs
// são publicadas/atualizadas. Reduz lag de indexação de dias para segundos.
//
// Uso típico (em server actions ou route handlers de admin/CMS):
//   await submitToIndexNow(['https://www.bolsaclick.com.br/blog/meu-post'])
//
// CONSOLIDAÇÃO (2026-07): havia DUAS implementações de IndexNow com CHAVES
// DIFERENTES (esta com f631…, e app/lib/seo/indexnow com 6c3c…), o que a
// auditoria SEO flagou como fragmentação. Agora este módulo delega pro canônico
// (seo/indexnow, chave 6c3c…) — uma única chave e um único code path. Este
// wrapper mantém a interface `IndexNowResult` + a validação de host (que o
// endpoint público /api/indexnow usa) por compatibilidade.

import { pingIndexNow, INDEXNOW_HOST } from '@/app/lib/seo/indexnow'

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
      return new URL(u).host === INDEXNOW_HOST
    } catch {
      return false
    }
  })

  if (!validUrls.length) {
    return { ok: false, status: 400, submitted: 0, message: 'No URLs match the configured host' }
  }

  const result = await pingIndexNow(validUrls)
  return {
    ok: result.ok,
    status: result.status,
    submitted: result.ok ? result.urls : 0,
    message: result.ok ? 'Submitted' : (result.reason ?? `IndexNow status ${result.status}`),
  }
}
