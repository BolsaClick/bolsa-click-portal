import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  HardHat,
  HeartPulse,
  Scale,
} from 'lucide-react'
import Image from 'next/image'

import type { CourseOffer } from '@/app/components/v2/course-offer'
import BlogTeaser, { type BlogTeaserPost } from '@/app/components/v2/home/BlogTeaser'
import CourseShelf from '@/app/components/v2/home/CourseShelf'
import GeoShelf from '@/app/components/v2/home/GeoShelf'
import RelatedShelf from '@/app/components/v2/home/RelatedShelf'
import {
  SAMPLE_FEATURED_OFFERS,
  toCourseOffer,
} from '@/app/components/v2/home/featured-offers'
import HeroSearch from '@/app/components/v2/home/HeroSearch'
import Mascot from '@/app/components/v2/mascot/Mascot'
import ReactiveCta, { reactiveClasses } from '@/app/components/v2/ui/ReactiveCta'
import HeaderNew from '@/app/components/molecules/Header/New'
import Footer from '@/app/components/molecules/Footer'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { prisma } from '@/app/lib/prisma'

export const metadata = { robots: { index: false, follow: false } }

// Preview de dev: sempre renderizar on-demand (vitrine chama APIs externas).
export const dynamic = 'force-dynamic'

/**
 * Home v3 — preview (mesma rota /dev/home-v2, iteração sobre a v2).
 *
 * Direção: vitrine browsing-first estilo marketplace — categorias clicáveis
 * sob o hero, prateleiras horizontais de CourseCardV2 com dados reais,
 * blog na home (peça de SEO) e mascote oficial como identidade ilustrada
 * (docs/MASCOTES.md; máx. 1 mascote por dobra).
 *
 * Claims: apenas os aprovados — 6 redes parceiras, 280+ cidades com polos,
 * +1.000 estudantes, até 80% de desconto, a partir de R$ 99/mês.
 */

const DEMO_CARD_HREF = '/checkout/matricula?preview=home-v3'

const COUNTERS = [
  { value: '6', label: 'redes parceiras' },
  { value: '280+', label: 'cidades com polos' },
  { value: '+1.000', label: 'estudantes' },
  { value: 'até 80%', label: 'de desconto' },
] as const

const CATEGORIES = [
  { name: 'Administração', icon: Briefcase, query: 'Administração' },
  { name: 'Enfermagem', icon: HeartPulse, query: 'Enfermagem' },
  { name: 'Pedagogia', icon: BookOpen, query: 'Pedagogia' },
  { name: 'Direito', icon: Scale, query: 'Direito' },
  { name: 'Psicologia', icon: Brain, query: 'Psicologia' },
  { name: 'Engenharias', icon: HardHat, query: 'Engenharia' },
] as const

const PARTNER_LOGOS = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg' },
  { name: 'Unopar', src: '/assets/logo-unopar.svg' },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg' },
  { name: 'Estácio', src: '/estacio-logo.png' },
  { name: 'Unime', src: '/assets/logo-unime-p.png' },
  { name: 'Wyden', src: '/assets/wyden.svg' },
] as const

const STEPS = [
  {
    title: 'Busque e compare',
    body: 'Digite o curso e veja a mensalidade com bolsa de cada oferta — o "De/Por" é calculado da tabela da própria faculdade, sem cadastro antes do preço.',
  },
  {
    title: 'Escolha a oferta',
    body: 'Compare modalidade, duração, turno e polo. O valor do card já é o valor com a bolsa aplicada.',
  },
  {
    title: 'Inscreva-se online',
    body: 'Leva poucos minutos. Depois, a faculdade orienta o processo seletivo: vestibular online ou aproveitamento da nota do ENEM.',
  },
  {
    title: 'Matricule-se com a bolsa',
    body: 'Aprovado, você conclui a matrícula com a instituição (regras e eventuais taxas são dela) e estuda pagando a mensalidade com desconto que viu aqui.',
  },
] as const

const FAQ = [
  {
    q: 'Usar o Bolsa Click custa alguma coisa?',
    a: 'Não. Buscar, comparar e se inscrever pelo Bolsa Click é grátis. Você só paga a faculdade — já com a bolsa aplicada na mensalidade.',
  },
  {
    q: 'Como funciona o desconto de até 80%?',
    a: 'As bolsas vêm de parcerias com as instituições. O percentual varia por curso, polo e modalidade, e o "De/Por" que você vê é sempre calculado da tabela de preço sem bolsa da própria faculdade — nunca um número inventado.',
  },
  {
    q: 'Quais faculdades participam?',
    a: 'São 6 redes parceiras: Anhanguera, Unopar, Pitágoras, Unime, Estácio e Wyden — com graduação, pós-graduação e cursos profissionalizantes.',
  },
  {
    q: 'Preciso de ENEM ou vestibular?',
    a: 'O processo seletivo é da faculdade. Na maioria dos cursos você escolhe: vestibular online ou aproveitamento da nota do ENEM, sem nota de corte de concorrência pública.',
  },
  {
    q: 'O diploma EAD vale o mesmo que o presencial?',
    a: 'Sim. Em cursos reconhecidos pelo MEC, o diploma EAD tem a mesma validade legal do presencial — o documento nem indica a modalidade.',
  },
  {
    q: 'O que acontece depois da inscrição?',
    a: 'A faculdade conduz o processo seletivo e a matrícula (documentos, prazos e eventuais taxas são definidos por ela). A bolsa que você viu no card é aplicada na mensalidade, e o nosso time acompanha você pelo WhatsApp até a matrícula sair.',
  },
] as const

const shelfTimeout = (ms: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('shelf timeout')), ms))

/**
 * Ofertas Estácio (Athena) direto no server: o fetchAthenaOffers do funil só
 * roda no browser (guard typeof window), então a vitrine server-side chama a
 * rota interna com URL absoluta. TODO(sistema de vitrine): extrair pra um
 * service compartilhado em vez de self-fetch.
 */
async function loadAthenaOffersServer(params: {
  modality?: string
  city?: string
  state?: string
}): Promise<unknown[]> {
  try {
    const qs = new URLSearchParams({ academicLevel: 'GRADUACAO' })
    if (params.modality) qs.set('modality', params.modality)
    if (params.city) qs.set('city', params.city)
    if (params.state) qs.set('state', params.state)
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/athena-offers?${qs.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

/**
 * Prateleira: fetch server-side real (Cogna + Estácio em paralelo), com
 * dedupe por nome de curso — vitrine mostra VARIEDADE de cursos, não o mesmo
 * curso em 8 polos. Falha -> [].
 */
async function loadShelf(params: {
  modality?: string
  city?: string
  state?: string
}): Promise<CourseOffer[]> {
  try {
    const [cognaResult, athenaRaw] = (await Promise.race([
      Promise.all([
        getShowFiltersCourses(
          undefined,
          params.city,
          params.state,
          params.modality,
          'GRADUACAO',
          1,
          24,
        ),
        loadAthenaOffersServer(params),
      ]),
      shelfTimeout(8000),
    ])) as [{ data?: unknown[] }, unknown[]]

    const all = [
      ...(Array.isArray(cognaResult?.data) ? cognaResult.data : []),
      ...athenaRaw,
    ]
      .map(toCourseOffer)
      .filter((offer): offer is CourseOffer => offer !== null)

    // Dedupe por nome-base do curso, intercalando marcas quando possível
    const seen = new Set<string>()
    const deduped: CourseOffer[] = []
    for (const offer of all) {
      const key = offer.name.replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '').trim().toUpperCase()
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(offer)
      if (deduped.length >= 8) break
    }
    return deduped
  } catch (error) {
    console.error('[home-v3 preview] prateleira falhou:', params, error)
    return []
  }
}

/** Blog: mesma query da home real (prisma.blogPost); falha -> [] (placeholders). */
async function loadBlogPosts(): Promise<BlogTeaserPost[]> {
  try {
    const latest = await prisma.blogPost.findMany({
      where: { isActive: true, publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        featuredImage: true,
        imageAlt: true,
        readingTime: true,
        publishedAt: true,
        categories: { select: { title: true } },
      },
    })
    return latest.map((post: (typeof latest)[number]) => ({
      slug: post.slug,
      title: post.title,
      featuredImage: post.featuredImage,
      imageAlt: post.imageAlt,
      readingTime: post.readingTime,
      publishedAt: post.publishedAt!.toISOString(),
      category: post.categories[0]?.title ?? null,
    }))
  } catch (error) {
    console.error('[home-v3 preview] blog indisponível:', error)
    return []
  }
}

export default async function HomeV3PreviewPage() {
  // A prateleira presencial agora é client-side (GeoShelf, geolocalização por
  // IP); só as vitrines genéricas continuam server-side.
  const [popularRaw, eadRaw, blogPosts] = await Promise.all([
    // "Mais procurados": com cidade a API usa o endpoint real /offers/most-searched
    loadShelf({ city: 'SAO PAULO', state: 'SP' }),
    loadShelf({ modality: 'EAD' }),
    loadBlogPosts(),
  ])

  // Fallback rotulado (dados de exemplo do featured-offers.ts) só quando a
  // API falhou — a prateleira presencial fica vazia de propósito (empty state
  // honesto com mascote), nunca preenchida com oferta inventada.
  const popular = popularRaw.length >= 3 ? popularRaw : SAMPLE_FEATURED_OFFERS
  const popularLive = popularRaw.length >= 3
  const eadOffers =
    eadRaw.length >= 3
      ? eadRaw
      : SAMPLE_FEATURED_OFFERS.filter((o) => (o.commercialModality ?? o.modality) === 'EAD')
  const eadLive = eadRaw.length >= 3

  return (
    <div className="bg-paper">
      {/* Banner de protótipo */}
      <p className="bg-bolsa-secondary px-4 py-1.5 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
        Protótipo local · home v3 · não integrado ao funil
      </p>

      {/* Header real do site (navegação completa) */}
      <HeaderNew />

      {/* ===== Hero: proposta de valor + busca (mascote: acenando) ===== */}
      <section aria-label="Busca de bolsas" className="bg-bolsa-primary">
        <div className="mx-auto grid w-full max-w-screen-lg grid-cols-1 gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-14 lg:pt-12">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
              A faculdade que você quer,{' '}
              <span className="whitespace-nowrap">
                com{' '}
                <span className="relative inline-block bg-bolsa-secondary px-2 py-0.5 text-white [clip-path:polygon(7px_0,100%_0,100%_100%,7px_100%,0_50%)]">
                  até 80%
                </span>
              </span>{' '}
              de bolsa
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/85">
              Compare mensalidades reais de 6 redes parceiras, escolha a oferta e
              inscreva-se online. O preço que você vê já é o preço com a bolsa —
              a partir de R$ 99/mês.
            </p>

            <div className="mt-8 flex items-end justify-between gap-6 lg:mt-10">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {COUNTERS.map((counter) => (
                  <div key={counter.label} className="flex flex-col">
                    <dt className="order-2 mt-1 text-[12px] font-medium text-white/70">
                      {counter.label}
                    </dt>
                    <dd className="order-1 font-display text-[28px] font-semibold leading-none text-white">
                      {counter.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <HeroSearch />
        </div>
      </section>

      {/* ===== Categorias — navegação browsing-first ===== */}
      <section id="vitrine" aria-label="Categorias de cursos" className="border-b border-ink-100 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-5 sm:px-6 lg:px-8">
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:justify-between lg:overflow-visible lg:px-0 [scrollbar-width:thin]">
            {CATEGORIES.map((category) => (
              <li key={category.name} className="shrink-0 snap-start">
                <a
                  href={`/curso/resultado?courseName=${encodeURIComponent(category.query)}&academicLevel=GRADUACAO`}
                  className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-4 text-[14px] font-semibold text-ink-900 hover:border-bolsa-primary hover:text-bolsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary ${reactiveClasses.soft}`}
                >
                  <category.icon size={18} className="text-bolsa-primary" aria-hidden />
                  {category.name}
                </a>
              </li>
            ))}
            <li className="shrink-0 snap-start">
              <a
                href="/graduacao"
                className={`flex min-h-[48px] items-center gap-2 rounded-xl bg-bolsa-primary/5 px-4 text-[14px] font-bold text-bolsa-primary hover:bg-bolsa-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary ${reactiveClasses.soft}`}
              >
                Ver todos
                <ArrowRight size={16} aria-hidden />
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== Prateleiras (vitrine de produto) ===== */}
      <div className="pt-4">
        {/* Personalizada: última busca salva (LGPD-gated; sem consentimento/
            busca, não renderiza nada — quem volta vê primeiro o que procurava) */}
        <RelatedShelf cardHref={DEMO_CARD_HREF} />

        <CourseShelf
          headingId="shelf-populares"
          eyebrow="Vitrine"
          title="Mais procurados"
          subtitle="As bolsas que mais saem — preços reais, desconto calculado."
          offers={popular}
          cardHref={DEMO_CARD_HREF}
        />
      </div>

      {/* Strip de logos entre prateleiras */}
      <section aria-label="Redes parceiras" className="border-y border-ink-100 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-5 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-10 overflow-x-auto pb-1 lg:justify-between lg:gap-6 lg:overflow-visible [scrollbar-width:thin]">
            <li className="shrink-0">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                6 redes parceiras
                <br />
                em 280+ cidades
              </p>
            </li>
            {PARTNER_LOGOS.map((partner) => (
              <li key={partner.name} className="shrink-0">
                <Image
                  src={partner.src}
                  alt={`Logo ${partner.name}`}
                  width={110}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="pt-4">
        <CourseShelf
          headingId="shelf-ead"
          eyebrow="Estude de onde quiser"
          title="Bolsas EAD a partir de R$ 99/mês"
          subtitle="Aulas 100% online e diploma com a mesma validade do presencial."
          offers={eadOffers}
          cardHref={DEMO_CARD_HREF}
        />

        {/* Personalizada: geolocalização por IP (skeleton → cidade do
            visitante → fallback honesto São Paulo → erro c/ mascote) */}
        <GeoShelf cardHref={DEMO_CARD_HREF} />

        {(!popularLive || !eadLive) && (
          <p className="mx-auto w-full max-w-screen-lg px-4 pb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-300 sm:px-6 lg:px-8">
            dev: prateleira(s) em fallback local — API indisponível no momento do render
          </p>
        )}
      </div>

      {/* ===== Como funciona ===== */}
      <section aria-labelledby="como-funciona-titulo" className="border-y border-ink-100 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 id="como-funciona-titulo" className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                Como funciona
              </h2>
              <p className="mt-2 max-w-xl text-[14px] text-ink-700">
                Quatro passos, sem pegadinha — inclusive o que acontece depois da inscrição.
              </p>
            </div>
            <Mascot pose="professor" size={120} className="hidden shrink-0 sm:block" />
          </div>
          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-ink-100 bg-paper p-5">
                <span aria-hidden className="font-display text-[28px] font-semibold text-bolsa-secondary">
                  {index + 1}
                </span>
                <h3 className="mt-2 text-[15px] font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Blog na home (SEO) — mascote: lendo ===== */}
      <div className="py-4">
        <BlogTeaser posts={blogPosts} />
      </div>

      {/* ===== FAQ — mascote: ideia ===== */}
      <section aria-labelledby="faq-titulo" className="border-y border-ink-100 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="faq-titulo" className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <Mascot pose="ideia" size={110} className="hidden shrink-0 sm:block" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-x-8 lg:grid-cols-2">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-ink-100">
                <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[14px] font-bold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="shrink-0 font-display text-xl leading-none text-bolsa-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 text-[13px] leading-relaxed text-ink-700">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final — cupom gigante ===== */}
      <section aria-label="Comece agora" className="mx-auto w-full max-w-screen-lg px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-ink-300 bg-paper-warm px-6 py-10 text-center sm:px-12">
          <span aria-hidden className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-dashed border-ink-300 bg-paper" />
          <span aria-hidden className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-dashed border-ink-300 bg-paper" />

          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
            Mensalidades a partir de R$ 99/mês
          </p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            Sua bolsa está esperando — o preço real está a uma busca de distância
          </h2>
          <ReactiveCta href="#busca" className="mt-6">
            Buscar minha bolsa
          </ReactiveCta>
          <p className="mt-3 text-[12px] text-ink-500">Grátis, online e sem compromisso.</p>
        </div>
      </section>

      {/* Footer real do site (links, selos, CNPJ) */}
      <Footer />
    </div>
  )
}
