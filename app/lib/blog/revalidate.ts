import { revalidatePath } from 'next/cache'

/**
 * Invalida o cache ISR das superfícies que renderizam post de blog.
 *
 * Por que isto existe: `app/blog/[slug]/page.tsx` declara
 * `revalidate = 86400` e `app/blog/page.tsx` declara `revalidate = 3600`.
 * Sem invalidação explícita, uma correção publicada pelo `/admin/blog` só
 * aparecia no site até 24h depois — inclusive correção de claim proibido,
 * que é exatamente o caso em que a demora não é aceitável (ver o lock de
 * claims no CLAUDE.md).
 *
 * Chamar DEPOIS de a escrita no banco ter sido confirmada. Falha aqui nunca
 * deve derrubar a resposta da API: o conteúdo já está salvo, e o pior caso
 * é voltar ao comportamento antigo de esperar o TTL.
 *
 * `previousSlug` cobre a renomeação: a URL antiga também precisa ser
 * invalidada, senão a página velha segue servindo do cache.
 */
export function revalidateBlogPost(slug?: string | null, previousSlug?: string | null): void {
  try {
    // Índice e paginação do blog
    revalidatePath('/blog')

    // Todas as páginas de categoria (a mudança pode entrar ou sair de uma)
    revalidatePath('/blog/categoria/[slug]', 'page')

    // O post em si, mais a URL antiga quando houve renomeação
    for (const s of new Set([slug, previousSlug].filter(Boolean) as string[])) {
      revalidatePath(`/blog/${s}`)
    }
  } catch (error) {
    // Não propaga: a gravação já aconteceu e a resposta não pode falhar por isso.
    console.error('[blog] falha ao revalidar cache:', error)
  }
}

/**
 * Invalida as superfícies afetadas por mudança de categoria (criação,
 * renomeação, remoção). O índice entra junto porque lista as categorias.
 */
export function revalidateBlogCategories(): void {
  try {
    revalidatePath('/blog')
    revalidatePath('/blog/categoria/[slug]', 'page')
  } catch (error) {
    console.error('[blog] falha ao revalidar categorias:', error)
  }
}
