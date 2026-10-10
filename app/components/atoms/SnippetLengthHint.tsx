import {
  BRAND_SUFFIX,
  renderedTitleLength,
  SNIPPET_DESCRIPTION_MAX,
  SNIPPET_TITLE_MAX,
} from '@/app/lib/seo/snippet-limits'

/**
 * Contador do snippet no admin, medindo o que o Google recebe: o title com o
 * sufixo de marca do layout, e o fallback (título do post / resumo) quando o
 * campo meta está vazio. Mesma régua da API — acima do limite, não salva.
 */
export default function SnippetLengthHint({
  kind,
  meta,
  fallback,
}: {
  kind: 'title' | 'description'
  meta: string
  fallback: string
}) {
  const usingFallback = !meta.trim()
  const effective = (usingFallback ? fallback : meta).trim()
  const len = kind === 'title' ? (effective ? renderedTitleLength(effective) : 0) : effective.length
  const max = kind === 'title' ? SNIPPET_TITLE_MAX : SNIPPET_DESCRIPTION_MAX
  const over = len > max

  const source = usingFallback && effective
    ? kind === 'title' ? ' — usando o título do post' : ' — usando o resumo'
    : ''
  const suffixNote = kind === 'title' ? ` com "${BRAND_SUFFIX.trim()}"` : ''

  return (
    <p className={`text-xs mt-1 ${over ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
      {len}/{max} no Google{suffixNote}{source}
      {over && ` · corte ${len - max} pra conseguir salvar`}
    </p>
  )
}
