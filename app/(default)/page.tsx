import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import FaqSection from '../components/organisms/FaqSection'
import HeroSection from '../components/organisms/HeroSection'
import PersonaReturnBanner from '../components/organisms/PersonaReturnBanner'
import PersonalizationStrip from '../components/organisms/PersonalizationStrip'
import ScholarshipInfoSection from '../components/organisms/ScholarshipInfoSection'
import BlogTeaser from '../components/v2/home/BlogTeaser'
import CourseShelf from '../components/v2/home/CourseShelf'
import GeoShelf from '../components/v2/home/GeoShelf'
import RelatedShelf from '../components/v2/home/RelatedShelf'
import Mascot from '../components/v2/mascot/Mascot'
import { courseAreaPose } from '../components/v2/mascot/course-area'
import ReactiveCta, { reactiveClasses } from '../components/v2/ui/ReactiveCta'
import { loadBlogPosts, loadShelf } from '../lib/home/vitrine'
import { getCurrentTheme } from '../lib/themes'

export const revalidate = 3600

const theme = getCurrentTheme()

// Title lidera com o head-term "bolsa de estudo" — a home é a página de maior
// autoridade do domínio e deve carregar o termo que queremos rankear.
// Padrão atual (decisão 2026-07): "Bolsa de Estudo nas Maiores Redes de Ensino
// do Brasil" — mantém o termo, DIFERENCIA o padrão da pillar /bolsas-de-estudo
// (que usa 'Bolsas de Estudo até 80%: Compare...') e alinha com o H1 do hero.
// NÃO reverter pra title só de marca por medo de canibalizar /bolsas-de-estudo:
// canibalização exige mesma INTENÇÃO + conteúdo, não só overlap de keyword. A
// home é hub de marca (navegacional/institucional) e a pillar é ferramenta de
// comparação (transacional) — intenções distintas, ambas podem citar o termo.
// Diferenciação garantida por canonical próprio + link interno home → pillar
// (preservado no ScholarshipInfoSection).
// "marketplace" fica no corpo/FAQ/llms.txt (diferencial + classificação por IA),
// não no início do title (zero volume de busca).
export const metadata: Metadata = {
  // `absolute` ignora o title.template do layout pai (a home é folha, não tem
  // rotas filhas). Sem isso, "%s | Bolsa Click" era colado por cima de um valor
  // que já terminava em "Bolsa Click" → marca duplicada no <title>.
  title: {
    absolute: 'Bolsa de Estudo nas Maiores Redes de Ensino do Brasil | Bolsa Click',
  },
  description: 'Bolsa de estudo de até 80% em faculdades como Anhanguera, Estácio e Unopar, todas reconhecidas pelo MEC. Inscrição grátis, no EAD ou presencial.',
  keywords: [
    'bolsa de estudo',
    'bolsa de estudos',
    'bolsas de estudo',
    'bolsa de estudo faculdade',
    'bolsa de estudos faculdade',
    'desconto em faculdade',
    'desconto faculdade',
    'bolsa faculdade',
    'faculdade com bolsa',
    'faculdades com bolsa',
    'faculdades com desconto',
    'faculdade com desconto',
    'bolsa para faculdade',
    'bolsa de estudo até 80%',
    'bolsa de estudo online',
    'bolsa de estudo EAD',
    'bolsa de estudo presencial',
    'melhor bolsa de estudo',
    'graduação EAD',
    'educação superior',
    'bolsas ead',
    'bolsas faculdade',
    'faculdade bolsa',
    'bolsa click',
    theme.shortTitle.toLowerCase(),
  ],
  alternates: {
    canonical: theme.siteUrl,
  },
  openGraph: {
    title: theme.title,
    description: theme.description,
    url: theme.siteUrl,
    siteName: theme.name,
    images: [
      {
        url: theme.ogImage,
        width: 1200,
        height: 630,
        alt: theme.name,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: theme.twitter,
    title: theme.title,
    description: theme.description,
    images: [theme.ogImage],
  },
  icons: {
    icon: theme.favicon,
    shortcut: theme.favicon,
    apple: theme.favicon,
  },
  robots: 'index, follow',
  // Schema.org removido: já definido em layout.tsx para evitar duplicação
}

// Chips de categoria — links REAIS do funil (/curso/resultado lê cn/nivel,
// não courseName/academicLevel; conferido no SearchResultClient).
const CATEGORIES = [
  { name: 'Administração', query: 'Administração' },
  { name: 'Enfermagem', query: 'Enfermagem' },
  { name: 'Pedagogia', query: 'Pedagogia' },
  { name: 'Direito', query: 'Direito' },
  { name: 'Psicologia', query: 'Psicologia' },
  { name: 'Engenharias', query: 'Engenharia' },
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

export default async function HomePage() {
  // Vitrine server-side (Cogna + Estácio, dedupe por curso). Renderiza na
  // revalidação (revalidate 3600) — falha de API esconde a prateleira em vez
  // de mostrar oferta inventada ou buraco por 1h.
  const [popular, eadOffers, blogPosts] = await Promise.all([
    // "Mais procurados": com cidade a API usa o endpoint real /offers/most-searched
    loadShelf({ city: 'SAO PAULO', state: 'SP' }),
    loadShelf({ modality: 'EAD' }),
    loadBlogPosts(),
  ])

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Como funcionam as bolsas de estudo do Bolsa Click?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O Bolsa Click conecta estudantes a bolsas de estudo de até 80% de desconto nas maiores redes de ensino do Brasil — Anhanguera, Unopar, Pitágoras, Unime e Estácio. Você pode buscar por curso, cidade e modalidade, comparar preços e se cadastrar gratuitamente para garantir sua bolsa."
        }
      },
      {
        "@type": "Question",
        "name": "As bolsas de estudo são realmente gratuitas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O cadastro no Bolsa Click é 100% gratuito. Você não paga nada para buscar e comparar bolsas. Apenas quando você escolhe uma bolsa e se matricula na faculdade é que paga a mensalidade com desconto."
        }
      },
      {
        "@type": "Question",
        "name": "Quais tipos de cursos posso encontrar no Bolsa Click?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No Bolsa Click você encontra bolsas para graduação (bacharelado, licenciatura e tecnólogo), pós-graduação, cursos técnicos, educação básica e idiomas. Todas as modalidades estão disponíveis: presencial, semipresencial e EAD (ensino a distância)."
        }
      },
      {
        "@type": "Question",
        "name": "Como posso garantir minha bolsa de estudo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "É muito simples! Basta buscar o curso desejado, escolher a bolsa que mais se adequa ao seu perfil, clicar em 'Quero essa bolsa' e preencher o cadastro. Após isso, você será direcionado para finalizar a matrícula na faculdade escolhida."
        }
      },
      {
        "@type": "Question",
        "name": "As bolsas são válidas para todo o Brasil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O Bolsa Click oferece bolsas em faculdades parceiras com polos em mais de 280 cidades, em todas as regiões do Brasil. Você pode buscar por cidade e estado para encontrar as melhores ofertas na sua região."
        }
      },
      {
        "@type": "Question",
        "name": "Posso usar a bolsa junto com outros descontos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As condições variam conforme a faculdade e o tipo de bolsa. Recomendamos verificar as condições específicas de cada oferta antes de se cadastrar. Algumas bolsas podem ser combinadas com outros descontos, outras não."
        }
      },
      {
        "@type": "Question",
        "name": "Preciso da nota do ENEM para conseguir bolsa de estudo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não! No Bolsa Click, você não precisa de nota do ENEM para conseguir sua bolsa de estudo. Basta se cadastrar, escolher o curso e garantir seu desconto."
        }
      },
      {
        "@type": "Question",
        "name": "Existem bolsas EAD disponíveis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O Bolsa Click oferece milhares de bolsas EAD com descontos de até 80%. Os cursos a distância possuem diploma reconhecido pelo MEC, igual ao presencial. Estude de casa, no seu ritmo."
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero atual mantido intacto (busca funcional, banners CMS, stats,
          geolocalização). O id ancora o CTA final da página. */}
      <div id="busca">
        <HeroSection />
      </div>

      {/* Categorias — navegação browsing-first com Bob por área */}
      <section aria-label="Categorias de cursos" className="border-b border-ink-100 bg-white">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-5 sm:px-6 lg:px-8">
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:justify-between lg:overflow-visible lg:px-0 [scrollbar-width:thin]">
            {CATEGORIES.map((category) => (
              <li key={category.name} className="shrink-0 snap-start">
                <a
                  href={`/curso/resultado?cn=${encodeURIComponent(category.query)}&nivel=GRADUACAO`}
                  className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-4 text-[14px] font-semibold text-ink-900 hover:border-bolsa-primary hover:text-bolsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary ${reactiveClasses.soft}`}
                >
                  <Mascot pose={courseAreaPose(category.query)} size={34} className="-my-1" />
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

      <PersonaReturnBanner />

      {/* ===== Prateleiras (vitrine de produto) ===== */}
      <div className="bg-paper pt-4">
        {/* Personalizada: última busca salva (LGPD-gated; sem consentimento/
            busca não renderiza nada — quem volta vê primeiro o que procurava) */}
        <RelatedShelf />

        {popular.length > 0 && (
          <CourseShelf
            headingId="shelf-populares"
            eyebrow="Vitrine"
            title="Mais procurados"
            subtitle="As bolsas que mais saem — preços reais, desconto calculado."
            offers={popular}
          />
        )}
      </div>

      {/* Strip de logos das redes parceiras */}
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

      <div className="bg-paper pt-4">
        {eadOffers.length > 0 && (
          <CourseShelf
            headingId="shelf-ead"
            eyebrow="Estude de onde quiser"
            title="Bolsas EAD a partir de R$ 99/mês"
            subtitle="Aulas 100% online e diploma com a mesma validade do presencial."
            offers={eadOffers}
          />
        )}

        {/* Personalizada: geolocalização por IP (skeleton → cidade do
            visitante → fallback honesto São Paulo → erro c/ mascote) */}
        <GeoShelf />
      </div>

      {/* PersonalizationStrip mantido below-the-fold. Motivo: o componente é
          client-only e decide se renderiza só APÓS ler localStorage no
          useEffect — above the fold causava CLS catastrófico (≥0.25) em mobile
          pra usuários retornantes. Below-the-fold o shift não conta pro CLS
          visível inicial. */}
      <PersonalizationStrip />

      {/* ===== Como funciona — Bob apontando (recorte limpo) ===== */}
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
            <Mascot pose="apontando" size={128} className="hidden shrink-0 sm:block" />
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

      {/* Conteúdo editorial mantido — carrega o link interno home → pillar
          (/bolsas-de-estudo), sinal SEO citado no racional do title. */}
      <ScholarshipInfoSection />

      {/* Blog na home (SEO) — Bob lendo */}
      <BlogTeaser posts={blogPosts} />

      {/* FAQ atual mantida (conteúdo/estilo próprios; o FAQPage JSON-LD acima
          continua o mesmo desde antes do redesign) */}
      <FaqSection />

      {/* ===== CTA final — cupom ===== */}
      <section aria-label="Comece agora" className="bg-paper">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-14 sm:px-6 lg:px-8">
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
            <p className="mt-3 text-[12px] text-ink-500">
              Grátis, online e sem compromisso.{' '}
              <Link
                href="/cursos"
                className="text-bolsa-primary underline decoration-1 underline-offset-4 hover:text-bolsa-secondary"
              >
                Ou explore todos os cursos
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
