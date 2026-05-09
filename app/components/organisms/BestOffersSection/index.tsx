import Image from 'next/image'
import Link from 'next/link'
import Container from '../../atoms/Container'
import { MapPin, Monitor, Building2 } from 'lucide-react'

type Offer = {
  id: string
  course: string
  institution: string
  logo: string
  modality: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  city: string
  uf: string
  originalPrice: number
  finalPrice: number
  discountPct: number
  href: string
}

const offers: Offer[] = [
  {
    id: '1',
    course: 'Direito',
    institution: 'Anhanguera',
    logo: '/assets/logo-anhanguera-bolsa-click.svg',
    modality: 'PRESENCIAL',
    city: 'São Paulo',
    uf: 'SP',
    originalPrice: 2329,
    finalPrice: 549,
    discountPct: 76,
    href: '/curso/resultado?c=direito&nivel=GRADUACAO&modalidade=PRESENCIAL',
  },
  {
    id: '2',
    course: 'Engenharia de Produção',
    institution: 'Unopar',
    logo: '/assets/logo-unopar.svg',
    modality: 'EAD',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    originalPrice: 3200,
    finalPrice: 298.99,
    discountPct: 90,
    href: '/curso/resultado?c=engenharia%20de%20producao&nivel=GRADUACAO&modalidade=EAD',
  },
  {
    id: '3',
    course: 'Biomedicina',
    institution: 'Pitágoras',
    logo: '/assets/logo-pitagoras.svg',
    modality: 'SEMIPRESENCIAL',
    city: 'Fortaleza',
    uf: 'CE',
    originalPrice: 1800,
    finalPrice: 599,
    discountPct: 66,
    href: '/curso/resultado?c=biomedicina&nivel=GRADUACAO',
  },
  {
    id: '4',
    course: 'Psicologia',
    institution: 'Ampli',
    logo: '/assets/ampli-logo.png',
    modality: 'PRESENCIAL',
    city: 'Belo Horizonte',
    uf: 'MG',
    originalPrice: 2800,
    finalPrice: 579,
    discountPct: 79,
    href: '/curso/resultado?c=psicologia&nivel=GRADUACAO&modalidade=PRESENCIAL',
  },
  {
    id: '5',
    course: 'Análise e Desenvolvimento de Sistemas',
    institution: 'Anhanguera',
    logo: '/assets/logo-anhanguera-bolsa-click.svg',
    modality: 'EAD',
    city: 'Belo Horizonte',
    uf: 'MG',
    originalPrice: 1290,
    finalPrice: 99.99,
    discountPct: 92,
    href: '/curso/resultado?c=ads&nivel=GRADUACAO&modalidade=EAD',
  },
  {
    id: '6',
    course: 'Enfermagem',
    institution: 'Pitágoras',
    logo: '/assets/logo-pitagoras.svg',
    modality: 'PRESENCIAL',
    city: 'Belo Horizonte',
    uf: 'MG',
    originalPrice: 2280,
    finalPrice: 589,
    discountPct: 74,
    href: '/curso/resultado?c=enfermagem&nivel=GRADUACAO&modalidade=PRESENCIAL',
  },
]

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const ModalityIcon = ({ m }: { m: Offer['modality'] }) => {
  if (m === 'EAD') return <Monitor size={14} />
  if (m === 'SEMIPRESENCIAL') return <Building2 size={14} />
  return <Building2 size={14} />
}

const modalityLabel = (m: Offer['modality']) => {
  if (m === 'EAD') return 'EAD'
  if (m === 'SEMIPRESENCIAL') return 'Semipresencial'
  return 'Presencial'
}

export default function BestOffersSection() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
              Cursos em destaque
            </h2>
            <p className="text-ink-500 text-[15px] mt-1">
              As bolsas mais procuradas da semana — selecionadas para você.
            </p>
          </div>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
          >
            Ver todas
            <span>→</span>
          </Link>
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {offers.map((o) => (
            <li key={o.id} className="h-full">
              <Link
                href={o.href}
                className="group flex flex-col h-full bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300 transition-all duration-300"
              >
                {/* Top: logo + discount badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="h-9 flex items-center">
                    <Image
                      src={o.logo}
                      alt={o.institution}
                      width={120}
                      height={36}
                      className="h-9 w-auto object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bolsa-secondary text-white text-[11px] font-bold tracking-wide">
                    -{o.discountPct}%
                  </span>
                </div>

                {/* Course name — reserva 2 linhas para padronizar altura */}
                <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
                  {o.course}
                </h3>

                {/* Modality + Location */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
                  <span className="inline-flex items-center gap-1">
                    <ModalityIcon m={o.modality} />
                    {modalityLabel(o.modality)}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    {o.city} — {o.uf}
                  </span>
                </div>

                {/* Price block — empurrado para a base do card */}
                <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                      Mensalidade com bolsa
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[13px] text-ink-700 font-medium">R$</span>
                      <span className="font-display num-tabular text-3xl md:text-[34px] font-bold text-bolsa-secondary leading-none">
                        {formatPrice(o.finalPrice)}
                      </span>
                      <span className="text-[12px] text-ink-500">/mês</span>
                    </div>
                    <div className="text-[12px] text-ink-300 line-through num-tabular mt-1">
                      De R$ {formatPrice(o.originalPrice)}
                    </div>
                  </div>

                  <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900 text-white group-hover:bg-bolsa-secondary transition-colors">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer CTA strip */}
        <div className="mt-10 md:mt-12 bg-gradient-to-r from-bolsa-primary to-bolsa-primary/85 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl md:text-2xl text-white font-semibold leading-tight">
              Não achou seu curso aqui?
            </h3>
            <p className="text-white/80 text-[14px] mt-1">
              Temos +100 mil cursos com bolsa em todo o Brasil. Encontre o seu em segundos.
            </p>
          </div>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bolsa-primary font-semibold rounded-full hover:bg-paper-warm transition-colors text-[14px] flex-shrink-0"
          >
            Buscar todos os cursos
            <span>→</span>
          </Link>
        </div>
      </Container>
    </section>
  )
}
