import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2, ShieldCheck, Clock, Star } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import { getInstitutionCourses } from '@/app/lib/api/get-institution-courses'
import { normalizeCourseNameKey } from '@/app/lib/utils/course-name-key'
import { BRAND_CONTENT } from '@/app/faculdades/[slug]/_data/brand-content'
import DepoimentosSection from '@/app/bolsas-de-estudo/_components/DepoimentosSection'
import { LeadForm } from './_components/LeadForm'
import { OfferGrid } from './_components/OfferGrid'
import type { OfferCardData } from './_components/OfferCard'
import { PARTNERS, brandColorFor, isIndexable } from '../_shared/partners'

export const revalidate = 3600

const theme = getCurrentTheme()
// O bolsaclick.com.br é sempre a fonte da "lista completa" (comparativo entre
// TODAS as marcas) — link fixo, independente de em qual domínio o ingressa
// está rodando.
const BOLSACLICK_SITE_URL = 'https://www.bolsaclick.com.br'

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

  const indexable = isIndexable(partner)
  const title = `Bolsa de até 80% na ${inst.name} — Inscreva-se grátis`
  const description = `Garanta sua bolsa de estudo na ${inst.fullName} com até 80% de desconto. Sem ENEM, sem nota de corte. Fale com nosso time e comece a estudar.`
  const url = `${theme.siteUrl}/${partner}`

  return {
    title,
    description,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    // Canonical só faz sentido pra página que participa do índice — evita
    // apontar canonical pra uma URL que o próprio robots já bloqueia.
    ...(indexable && { alternates: { canonical: url } }),
    openGraph: indexable
      ? {
          title,
          description,
          url,
          siteName: 'Bolsa Click',
          type: 'website',
          locale: 'pt_BR',
          images: inst.imageUrl ? [{ url: inst.imageUrl, alt: inst.imageAlt || inst.name }] : undefined,
        }
      : undefined,
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

const COURSE_TYPES = new Set(['BACHARELADO', 'LICENCIATURA', 'TECNOLOGO'])

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

  const indexable = isIndexable(partner)
  // O kill switch `estacio_enabled` foi feito pra esconder a Estácio do
  // bolsaclick.com.br — este site inteiro é dedicado a uma marca, então a
  // marca Estácio aqui NUNCA pode depender dele (ver athena-offers.ts).
  const ignoreEstacioKillSwitch = partner === 'estacio'

  const [courses, catalog] = await Promise.all([
    getInstitutionCourses(inst.name, { ignoreEstacioKillSwitch }),
    // Catálogo completo do site (FeaturedCourse) pro dropdown "curso de
    // interesse" e pra resolver tipo de grau (Bacharelado/Licenciatura/
    // Tecnólogo) + slug de "ver detalhes" no grid de ofertas.
    prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { name: true, apiCourseName: true, fullName: true, slug: true, type: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // NOTA sobre o espelho server-side de "checkout_viewed": não dá pra emitir
  // aqui (Server Component) porque a página é ISR (`revalidate = 3600`) — um
  // capture() disparado no render só rodaria a cada regeneração de cache
  // (~1x/hora), não a cada visita real. O mirror de verdade é o beacon
  // fire-and-forget em LeadForm (useEffect de mount → POST /api/ingressa/view,
  // sem gate de consentimento, roda no CLIENTE mas fora do SDK do PostHog).

  const brand = BRAND_CONTENT[partner]
  const brandColor = brandColorFor(partner)
  const courseOptions = Array.from(
    new Set(catalog.map((c) => c.name.trim()).filter(Boolean))
  )

  // Mapa nome→{slug,type} do catálogo, pra casar com as ofertas vivas
  // (Athena/Tartarus) e alimentar o grid: tipo de grau pro filtro da sidebar,
  // slug pro link "Ver detalhes do curso".
  const catalogByKey = new Map<string, { slug: string; type: string }>()
  for (const c of catalog) {
    for (const variant of [c.name, c.apiCourseName, c.fullName]) {
      if (!variant) continue
      const key = normalizeCourseNameKey(variant)
      if (key && !catalogByKey.has(key)) catalogByKey.set(key, { slug: c.slug, type: c.type })
    }
  }

  // Grid de ofertas: só do trilho YDUQS (Athena) — é o que traz unidade,
  // turno e duração reais pra sustentar o card. Ofertas Tartarus (Cogna) sem
  // esses campos ficam de fora do grid (mas ainda contam pro "a partir de"
  // mais simples de baixo, como fallback).
  const offerItems: OfferCardData[] = courses
    .filter((c) => c.source === 'YDUQS' && Number(c.minPrice ?? 0) > 0)
    .map((c) => {
      const meta = catalogByKey.get(normalizeCourseNameKey(c.name))
      return {
        id: String(c.offerId || c.id),
        name: c.name,
        courseType: meta && COURSE_TYPES.has(meta.type) ? (meta.type as OfferCardData['courseType']) : null,
        academicLevel: c.academicLevel,
        modality: c.modality,
        shift: c.shiftOptions?.[0],
        durationMonths: c.durationInMonths,
        minPrice: Number(c.minPrice),
        maxPrice: typeof c.maxPrice === 'number' ? c.maxPrice : undefined,
        unitName: c.unitName,
        unitCity: c.unitCity,
        unitState: c.unitState,
        slug: meta?.slug,
        offerId: c.offerId,
        brand: c.brand,
        unitAddress: c.unitAddress,
        unitDistrict: c.unitDistrict,
        unitPostalCode: c.unitPostalCode,
        codFormaIngressoOferta: c.codFormaIngressoOferta,
        priceForma2: c.priceForma2,
        priceForma3: c.priceForma3,
      }
    })

  // Fallback simples (nome + preço) pra quando não há oferta YDUQS suficiente
  // pro grid — mantém a seção "cursos com bolsa" funcionando pras outras marcas.
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

  // FAQ curto e focado em CONFIANÇA/conversão — deliberadamente diferente do
  // FAQ institucional de /faculdades/[slug] (que fala sobre a faculdade em
  // si). Evita conteúdo duplicado entre os dois domínios (SEO) e responde a
  // dúvida real de quem chega por anúncio: "isso é oficial? é seguro?".
  const trustFaq = [
    {
      q: `O Bolsa Click é a própria ${inst.name}?`,
      a: `Não. O Bolsa Click é uma plataforma parceira autorizada que intermedia bolsas de estudo com a ${inst.name} e outras instituições. A matrícula e a mensalidade são pagas direto pra ${inst.fullName}; o Bolsa Click não cobra nada do estudante pra isso.`,
    },
    {
      q: `Preciso pagar alguma coisa pro Bolsa Click?`,
      a: 'Não. O cadastro e a reserva da bolsa são gratuitos. O único valor pago é a mensalidade (já com desconto) direto pra instituição.',
    },
    {
      q: `Em quanto tempo recebo uma resposta?`,
      a: 'Nosso time normalmente entra em contato pelo WhatsApp em poucos minutos após o envio do formulário, em horário comercial.',
    },
  ]

  const educationalOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${theme.siteUrl}/${partner}#organization`,
    name: 'Bolsa Click',
    description: `Plataforma parceira autorizada de bolsas de estudo na ${inst.name}.`,
    url: `${theme.siteUrl}/${partner}`,
    ...(offerItems.length > 0 && {
      makesOffer: {
        '@type': 'AggregateOffer',
        priceCurrency: 'BRL',
        lowPrice: Math.min(...offerItems.map((o) => o.minPrice)),
        offerCount: offerItems.length,
        category: 'Bolsa de estudo',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'EducationalOrganization', name: inst.fullName },
        description: `Mensalidades com bolsa de estudo na ${inst.name} a partir de R$ ${Math.min(...offerItems.map((o) => o.minPrice)).toFixed(0)}/mês.`,
      },
    }),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trustFaq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: theme.siteUrl },
      { '@type': 'ListItem', position: 2, name: inst.name, item: `${theme.siteUrl}/${partner}` },
    ],
  }

  return (
    <>
      {indexable && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        </>
      )}

      {/* Barra de identificação — o hero usa cor/logo da ${inst.name}, então
          esta linha deixa claro, acima da dobra, que quem capta o lead é o
          Bolsa Click (parceiro autorizado), não a própria instituição. */}
      <div className="bg-ink-900 text-white/90 text-center py-1.5 text-[11px] font-mono tracking-wide">
        Bolsa Click · parceiro autorizado {inst.name}
      </div>

      {/* HERO + FORM */}
      <section id="top" className="relative overflow-hidden" style={{ backgroundColor: brandColor }}>
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
              {/* Abertura GEO: resposta direta na 1ª frase (40-60 palavras),
                  contexto depois — CLAUDE.md, padrão de abertura editorial. */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                Pra conseguir bolsa na {inst.name} sem ENEM e sem nota de corte, o caminho mais
                rápido é se cadastrar grátis pelo Bolsa Click, parceiro autorizado: você compara
                as ofertas com desconto de até 80%, escolhe curso e unidade, e fala direto com
                nosso time pelo WhatsApp pra garantir a vaga antes de matricular na {inst.fullName}.
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

      {/* GRID DE OFERTAS REAIS — nome, nível/modalidade/duração/turno, preço
          de/por com economia total, unidade, CTA. Só quando há oferta YDUQS
          o bastante pra sustentar os campos (ver comentário acima). */}
      {offerItems.length > 0 ? (
        <section className="bg-white py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-2">
              Cursos com bolsa na {inst.name}
            </h2>
            <p className="text-ink-700 mb-6">Mensalidades reais com a bolsa já aplicada — de/por e economia total até o fim do curso.</p>
            <OfferGrid
              offers={offerItems}
              partner={partner}
              partnerName={inst.name}
              brandColor={brandColor}
              fullListHref={`${BOLSACLICK_SITE_URL}/faculdades/${partner}`}
            />
          </div>
        </section>
      ) : (
        topCourses.length > 0 && (
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
        )
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

      {/* PROVA SOCIAL — granular por instituição (mecânica de conversão do
          teardown de concorrente). Some sozinha se não houver review
          aprovada dessa instituição — trust signal vazio é melhor que
          inventado (CLAUDE.md). */}
      <DepoimentosSection limit={5} institutionSlug={partner} />

      {/* FAQ de confiança */}
      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-6">
            Perguntas frequentes
          </h2>
          <dl className="space-y-5">
            {trustFaq.map((f) => (
              <div key={f.q} className="border-b border-hairline pb-5">
                <dt className="font-display text-ink-900 font-semibold mb-1.5">{f.q}</dt>
                <dd className="text-ink-700 text-sm leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
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
