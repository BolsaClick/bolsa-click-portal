import { OG_SIZE } from '@/app/lib/og/shared'

/**
 * `ImageObject` do schema.org apontando pra imagem OG gerada por código
 * (`opengraph-image.tsx` ou rota equivalente). Sem isso a imagem existe só
 * pro unfurl de redes sociais — invisível pra quem lê dados estruturados pra
 * montar resposta (Google AI Overviews, ChatGPT, Perplexity). `caption`
 * carrega o mesmo texto factual do `alt` da imagem: nome do curso, cidade,
 * instituição — nunca texto decorativo.
 */
export function ogImageObject(url: string, caption: string) {
  return {
    '@type': 'ImageObject',
    url,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    caption,
  }
}
