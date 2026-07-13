import Link from 'next/link'
import { Star } from 'lucide-react'

/**
 * Convite à avaliação pós-matrícula — ponto de coleta do funil de reviews
 * (Review → moderação → DepoimentosSection/AggregateRating). O sistema de
 * reviews estava completo porém sem inflow: ninguém era convidado a avaliar.
 *
 * `brand` (opcional) vem dos query params do checkout; quando reconhecida,
 * deep-linka pra seção #avaliacoes da página da faculdade.
 */

const KNOWN_SLUGS = ['anhanguera', 'unopar', 'pitagoras', 'unime', 'estacio']

function brandToSlug(brand?: string | null): string | null {
  if (!brand) return null
  const slug = brand
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return KNOWN_SLUGS.includes(slug) ? slug : null
}

interface ReviewInviteCardProps {
  brand?: string | null
}

export default function ReviewInviteCard({ brand }: ReviewInviteCardProps) {
  const slug = brandToSlug(brand)
  const href = slug ? `/faculdades/${slug}#avaliacoes` : '/faculdades'

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
      <div className="flex gap-3">
        <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-gray-800 mb-1">
            Conta como foi conseguir sua bolsa
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Sua avaliação ajuda outros estudantes a escolher com segurança — leva
            menos de 2 minutos e é publicada após moderação.
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 underline decoration-1 underline-offset-4"
          >
            Avaliar {slug ? 'minha faculdade' : 'a faculdade'} →
          </Link>
        </div>
      </div>
    </div>
  )
}
