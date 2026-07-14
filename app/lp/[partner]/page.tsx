import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2, ShieldCheck, Clock, Star } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import { getInstitutionCourses } from '@/app/lib/api/get-institution-courses'
import { BRAND_CONTENT } from '@/app/faculdades/[slug]/_data/brand-content'
import { LeadForm } from './_components/LeadForm'

export const revalidate = 3600

const PARTNERS = ['anhanguera', 'unopar', 'pitagoras', 'unime', 'estacio']

// Cor de marca por parceiro (extraída dos sites oficiais / do concorrente
// matricula.digital). O hero, os acentos e o CTA usam essa cor — a landing fica
// com a cara da marca, o que converte melhor no tráfego de anúncio de brand.
const DEFAULT_BRAND = '#023e73'
const PARTNER_BRAND: Record<string, string> = {
  anhanguera: '#f94d12', // laranja (site oficial)
  estacio: '#022549', // navy (matricula.digital)
  unopar: '#0a3c7d', // azul (site oficial)
  pitagoras: '#e2521d', // laranja-vermelho (site oficial)
  unime: '#e31b22', // vermelho (unime.edu.br)
}

export async function generateStaticParams() {
  const insts = await prisma.institution.findMany({
    where: { isActive: true, slug: { in: PARTNERS } },
    select: { slug: true },
  })
  return insts.map((i) => ({ partner: i.slug }))
}

const getInstitution = (slug: string) => prisma.institution.findUnique({ where: { slug } })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ partner: string }>
}): Promise<Metadata> {
  const { partner } = await params
  const inst = await getInstitution(partner)
  if (!inst) return { title: 'Página não encontrada' }
  return {
    title: `Bolsa de até 80% na ${inst.name} — Inscreva-se grátis`,
    description: `Garanta sua bolsa de estudo na ${inst.fullName} com até 80% de desconto. Sem ENEM, sem nota de corte. Fale com nosso time e comece a estudar.`,
    robots: { index: false, follow: false },
  }
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default async function PartnerLanding({
  params,
}: {
  params: Promise<{ partner: string }>
}) {
  const { partner } = await params
  const inst = await getInstitution(partner)
  if (!inst || !inst.isActive || !PARTNERS.includes(partner)) {
    notFound()
  }

  const [courses, catalog] = await Promise.all([
    getInstitutionCourses(inst.name),
    // Catálogo completo do site (FeaturedCourse) pro dropdown "curso de interesse"
    // — todos os cursos, não só os do parceiro, pra o lead escolher exatamente.
    prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    }),
  ])
  const brand = BRAND_CONTENT[partner]
  const brandColor = PARTNER_BRAND[partner] ?? DEFAULT_BRAND
  const courseOptions = Array.from(
    new Set(catalog.map((c) => c.name.trim()).filter(Boolean))
  )

  // Top cursos com preço real (ordenados pela mensalidade com bolsa).
  const topCourses = courses
    .filter((c) => Number(c.minPrice ?? 0) > 0)
    .map((c) => ({ name: String(c.name ?? '').trim(), minPrice: Number(c.minPrice) }))
    .filter((c) => c.name)
    .sort((a, b) => a.minPrice - b.minPrice)
    .slice(0, 6)

  const pontosFortes = brand?.valeAPena.pontosFortes ?? [
    'Diploma reconhecido pelo MEC',
    'Bolsas de até 80% sem nota de corte',
    'Inscrição gratuita e sem ENEM',
  ]

  return (
    <>
      {/* HERO + FORM */}
      <section className="relative overflow-hidden" style={{ backgroundColor: brandColor }}>
        <div aria-hidden className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 mb-6">
                {inst.logoUrl ? (
                  <Image
                    src={inst.logoUrl}
                    alt={`Logo ${inst.name}`}
                    width={120}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display font-semibold text-bolsa-primary text-lg">{inst.name}</span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.08] mb-4">
                Bolsa de até <span className="underline decoration-white/40 decoration-[3px] underline-offset-4">80%</span> na {inst.name}
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                Estude na {inst.fullName} pagando muito menos. Sem ENEM, sem nota de corte,
                inscrição grátis. Preencha e nosso time garante sua bolsa.
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-white/85 text-sm">
                {inst.mecRating ? (
                  <li className="inline-flex items-center gap-1.5">
                    <Star size={15} className="text-white/80" /> Nota {inst.mecRating}/5 no MEC
                  </li>
                ) : (
                  <li className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-white/80" /> Reconhecida pelo MEC
                  </li>
                )}
                {inst.studentCount && (
                  <li className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-white/80" /> {inst.studentCount} alunos
                  </li>
                )}
                <li className="inline-flex items-center gap-1.5">
                  <Clock size={15} className="text-white/80" /> Resposta em minutos
                </li>
              </ul>
            </div>

            {/* Form */}
            <div className="lg:pl-6">
              <div className="mb-3 text-center">
                <span className="inline-block font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
                  Garanta sua bolsa agora
                </span>
              </div>
              <LeadForm partner={partner} partnerName={inst.name} courses={courseOptions} accentColor={brandColor} />
            </div>
          </div>
        </div>
      </section>

      {/* OFERTAS REAIS */}
      {topCourses.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-2">
              Cursos com bolsa na {inst.name}
            </h2>
            <p className="text-ink-700 mb-6">Mensalidades reais com a bolsa já aplicada — a partir de:</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {topCourses.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-4 bg-paper border border-hairline rounded-lg px-4 py-3">
                  <span className="font-display text-ink-900 truncate">{c.name}</span>
                  <span className="font-display text-ink-900 whitespace-nowrap text-sm">
                    a partir de <strong>{formatBRL(c.minPrice)}</strong>
                    <span className="text-ink-500">/mês</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* POR QUE */}
      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-6">
            Por que estudar na {inst.name}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {pontosFortes.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-ink-700 leading-relaxed">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: brandColor }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 md:py-16 text-center" style={{ backgroundColor: brandColor }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Sua bolsa na {inst.name} está esperando
          </h2>
          <p className="text-white/80 mb-7">
            Preencha o formulário no topo e nosso time entra em contato pra garantir seu desconto de até 80%.
          </p>
          <a
            href="#top"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-white font-semibold rounded-full hover:opacity-90"
            style={{ color: brandColor }}
          >
            Quero minha bolsa
          </a>
        </div>
      </section>

      <footer className="bg-white py-6 border-t border-hairline">
        <div className="container mx-auto px-4 text-center text-[12px] text-ink-500">
          {inst.fullName} é instituição parceira. Intermediação de bolsas por Bolsa Click. Descontos
          e disponibilidade variam por curso, modalidade e unidade.
        </div>
      </footer>
    </>
  )
}
