import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'

// Bloco "Leia também" dos hubs de programa (auditoria SEO 2026-07, item
// HIGH #5: hubs com 0 links pro blog → posts órfãos de hub). Server-rendered,
// match por tema no título/slug do post. Fallback silencioso: se o banco
// falhar ou não houver post relevante, a seção simplesmente não renderiza —
// nunca quebra a página.

interface RelatedBlogPostsProps {
  /** Termos de tema, em ordem de prioridade (o 1º termo rankeia mais alto). */
  terms: string[]
  /** Máximo de posts exibidos (padrão 4). */
  take?: number
}

interface MatchedPost {
  slug: string
  title: string
  excerpt: string
  readingTime: number
}

function termToSlugFragment(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, '-')
}

export async function RelatedBlogPosts({ terms, take = 4 }: RelatedBlogPostsProps) {
  if (terms.length === 0) return null

  let posts: MatchedPost[]
  try {
    posts = await prisma.blogPost.findMany({
      where: {
        isActive: true,
        publishedAt: { not: null },
        OR: terms.flatMap(t => [
          { title: { contains: t, mode: 'insensitive' as const } },
          { slug: { contains: termToSlugFragment(t), mode: 'insensitive' as const } },
        ]),
      },
      select: { slug: true, title: true, excerpt: true, readingTime: true },
      orderBy: { publishedAt: 'desc' },
      take: 24,
    })
  } catch {
    // Banco indisponível → seção some, página segue íntegra.
    return null
  }

  if (posts.length === 0) return null

  // Rankeia pelo termo mais prioritário que o post atende (título ou slug);
  // empates mantêm a ordem por publishedAt desc vinda do banco.
  const priority = (p: MatchedPost): number => {
    const title = p.title.toLowerCase()
    const idx = terms.findIndex(
      t => title.includes(t.toLowerCase()) || p.slug.includes(termToSlugFragment(t)),
    )
    return idx === -1 ? terms.length : idx
  }
  const ranked = posts
    .map((p, i) => ({ p, i, rank: priority(p) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .slice(0, take)
    .map(({ p }) => p)

  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-hairline">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
            Leia também
          </h2>
          <Link
            href="/blog"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 hover:text-ink-900"
          >
            Ver o blog →
          </Link>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-hairline">
          {ranked.map(post => (
            <li key={post.slug} className="bg-white">
              <Link
                href={`/blog/${post.slug}`}
                className="block h-full px-5 py-5 transition-colors hover:bg-paper"
              >
                <h3 className="font-display text-lg text-ink-900 leading-snug mb-2">
                  {post.title}
                </h3>
                <p className="text-[13px] text-ink-500 leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-bolsa-secondary">
                  Ler artigo · {post.readingTime} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
