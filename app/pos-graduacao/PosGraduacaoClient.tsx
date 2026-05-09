'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Check,
  MapPin,
  Monitor,
} from 'lucide-react'

const STATS = [
  { value: '10k+', label: 'Cursos de pós-graduação' },
  { value: '+500', label: 'Faculdades parceiras' },
  { value: 'até 80%', label: 'de desconto em bolsas' },
  { value: '6 a 18', label: 'meses de duração' },
]

type Offer = {
  course: string
  institution: string
  logo: string
  modality: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  city: string
  uf: string
  finalPrice: number
  originalPrice: number
  discountPct: number
  href: string
}

const OFFERS: Offer[] = [
  {
    course: 'MBA em Gestão de Projetos',
    institution: 'Anhanguera',
    logo: '/assets/logo-anhanguera-bolsa-click.svg',
    modality: 'EAD',
    city: 'São Paulo',
    uf: 'SP',
    finalPrice: 199,
    originalPrice: 890,
    discountPct: 78,
    href: '/curso/resultado?c=mba-gestao-projetos&nivel=POS_GRADUACAO',
  },
  {
    course: 'Especialização em Direito Tributário',
    institution: 'Unopar',
    logo: '/assets/logo-unopar.svg',
    modality: 'EAD',
    city: 'Curitiba',
    uf: 'PR',
    finalPrice: 249,
    originalPrice: 1100,
    discountPct: 77,
    href: '/curso/resultado?c=direito-tributario&nivel=POS_GRADUACAO',
  },
  {
    course: 'Psicologia Clínica e Psicoterapia',
    institution: 'Pitágoras',
    logo: '/assets/logo-pitagoras.svg',
    modality: 'EAD',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    finalPrice: 179,
    originalPrice: 980,
    discountPct: 81,
    href: '/curso/resultado?c=psicologia-clinica&nivel=POS_GRADUACAO',
  },
  {
    course: 'MBA em Marketing Digital',
    institution: 'Ampli',
    logo: '/assets/ampli-logo.png',
    modality: 'EAD',
    city: 'Belo Horizonte',
    uf: 'MG',
    finalPrice: 159,
    originalPrice: 850,
    discountPct: 81,
    href: '/curso/resultado?c=mba-marketing-digital&nivel=POS_GRADUACAO',
  },
  {
    course: 'Engenharia de Segurança do Trabalho',
    institution: 'Anhanguera',
    logo: '/assets/logo-anhanguera-bolsa-click.svg',
    modality: 'EAD',
    city: 'Salvador',
    uf: 'BA',
    finalPrice: 229,
    originalPrice: 1050,
    discountPct: 78,
    href: '/curso/resultado?c=engenharia-seguranca&nivel=POS_GRADUACAO',
  },
  {
    course: 'Gestão de Pessoas e Liderança',
    institution: 'Pitágoras',
    logo: '/assets/logo-pitagoras.svg',
    modality: 'EAD',
    city: 'Recife',
    uf: 'PE',
    finalPrice: 149,
    originalPrice: 720,
    discountPct: 79,
    href: '/curso/resultado?c=gestao-pessoas&nivel=POS_GRADUACAO',
  },
]

const TYPES = [
  {
    n: '01',
    title: 'MBA',
    duration: '12 a 18 meses',
    description: 'Master Business Administration. Foco em gestão e liderança — pra cargos executivos, empreendedorismo e expansão de carreira em áreas como Marketing, Finanças e Projetos.',
  },
  {
    n: '02',
    title: 'Especialização lato sensu',
    duration: '6 a 12 meses',
    description: 'Aprofundamento em uma área específica. Mais flexível e acessível que o MBA — ideal pra quem quer atualizar conhecimento e expandir atuação.',
  },
  {
    n: '03',
    title: 'Pós EAD',
    duration: '6 a 18 meses',
    description: 'Pós-graduação 100% online com diploma reconhecido pelo MEC. Estude no seu ritmo, com mensalidades a partir de R$ 119.',
  },
]

const REASONS = [
  {
    label: 'Salário',
    title: 'Aumente seus ganhos',
    description: 'Profissionais com pós-graduação ganham, em média, 35% a mais que graduados. O retorno do investimento é rápido.',
  },
  {
    label: 'Carreira',
    title: 'Acelere a ascensão',
    description: 'Pós-graduação é pré-requisito pra cargos de liderança e gestão. Diferencia o currículo em processos seletivos.',
  },
  {
    label: 'Atualização',
    title: 'Mantenha-se relevante',
    description: 'Mercado muda rápido. A pós atualiza o conhecimento técnico e amplia a rede de contatos profissionais.',
  },
]

const PARTNERS = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg' },
  { name: 'Unopar', src: '/assets/logo-unopar.svg' },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg' },
  { name: 'Ampli', src: '/assets/ampli-logo.png' },
  { name: 'Unime', src: '/assets/logo-unime-p.png' },
]

const FAQ = [
  {
    q: 'Qual a diferença entre MBA e Especialização?',
    a: 'Ambos são pós-graduações lato sensu. MBA tem foco em gestão e administração, enquanto especialização aprofunda uma área técnica específica. O reconhecimento é o mesmo.',
  },
  {
    q: 'Quanto tempo dura uma pós-graduação?',
    a: 'A maioria dos cursos lato sensu (especialização e MBA) dura entre 6 e 18 meses. Mestrados e doutorados (stricto sensu) duram mais — 2 a 4 anos.',
  },
  {
    q: 'Diploma de pós EAD é reconhecido?',
    a: 'Sim. Cursos EAD com credenciamento MEC têm o mesmo valor que os presenciais. Verifique sempre se a instituição está autorizada antes de se matricular.',
  },
  {
    q: 'Preciso ter graduação pra fazer pós?',
    a: 'Sim. Pós-graduação exige diploma de graduação reconhecido pelo MEC. Algumas faculdades aceitam alunos no último semestre da graduação.',
  },
  {
    q: 'Como funciona a bolsa do Bolsa Click?',
    a: 'Você busca o curso, compara descontos de até 80% entre faculdades parceiras, escolhe a melhor oferta e se inscreve grátis. Sem ENEM, sem prova de seleção.',
  },
]

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: Offer['modality']) =>
  m === 'EAD' ? 'EAD' : m === 'SEMIPRESENCIAL' ? 'Semipresencial' : 'Presencial'

export default function PosGraduacaoClient() {
  const router = useRouter()
  const offersRef = useRef<HTMLElement>(null)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

  const handleBuscar = () => {
    router.push('/curso/resultado?nivel=POS_GRADUACAO')
  }

  const handleVerOfertas = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] mb-5">
              Próxima parada:{' '}
              <span className="italic text-white/85">cargo de liderança.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed mb-8">
              MBA, especialização e pós EAD — em mais de 500 faculdades parceiras. Mensalidades a
              partir de R$ 119, com diploma reconhecido pelo MEC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuscar}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Buscar bolsas de pós
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleVerOfertas}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-[15px]"
              >
                Ver ofertas em destaque
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-hairline">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 py-8 md:py-10 text-center">
                <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900 leading-none">
                  {s.value}
                </div>
                <div className="text-[12px] md:text-[13px] text-ink-500 mt-2 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS */}
      <section ref={offersRef} className="py-16 md:py-20 bg-paper">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-ink-300" />
                Pós-graduação · MBAs e especializações
              </span>
              <h2 className="font-display text-3xl md:text-[36px] font-semibold text-ink-900 leading-tight">
                Cursos em destaque
              </h2>
              <p className="text-ink-500 text-[15px] mt-1 max-w-2xl">
                As pós-graduações mais procuradas, com bolsa garantida e mensalidades reduzidas.
              </p>
            </div>
            <Link
              href="/curso/resultado?nivel=POS_GRADUACAO"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-bolsa-secondary hover:text-bolsa-secondary/80 transition-colors"
            >
              Ver todas as ofertas
              <ArrowRight size={16} />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {OFFERS.map((o) => (
              <li key={`${o.course}-${o.institution}-${o.city}`} className="h-full">
                <Link
                  href={o.href}
                  className="group flex flex-col h-full bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300 transition-all duration-300"
                >
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

                  <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
                    {o.course}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
                    <span className="inline-flex items-center gap-1">
                      <Monitor size={14} />
                      {modalityLabel(o.modality)}
                    </span>
                    <span className="text-ink-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {o.city} — {o.uf}
                    </span>
                  </div>

                  <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                        Mensalidade com bolsa
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[13px] text-ink-700 font-medium">R$</span>
                        <span className="font-display num-tabular text-3xl font-bold text-bolsa-secondary leading-none">
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
        </div>
      </section>

      {/* TIPOS */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ink-300" />
                Tipos de pós-graduação
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                Especialização ou MBA?{' '}
                <span className="italic text-ink-700">Você escolhe.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 md:pt-3">
              <p className="text-ink-500 text-[15px] leading-relaxed">
                Todas as opções são pós-graduações lato sensu, com diploma reconhecido pelo MEC. A
                diferença está no foco e duração.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline">
            {TYPES.map((t) => (
              <li
                key={t.n}
                className="px-2 md:px-6 py-8 md:py-10 border-b border-hairline md:border-r last:md:border-r-0"
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-700">
                    {t.n}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                    {t.duration}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-[28px] text-ink-900 leading-tight mb-3">
                  {t.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">{t.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* POR QUE FAZER PÓS — 3 razões */}
      <section className="bg-paper-warm py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              Por que fazer pós
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight">
              Três razões pra{' '}
              <span className="italic text-ink-700">não adiar mais.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
            {REASONS.map((r) => (
              <article key={r.label} className="bg-white p-7 md:p-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-bolsa-primary/5 text-bolsa-primary text-[11px] font-bold tracking-wider uppercase mb-4">
                  {r.label}
                </span>
                <h3 className="font-display text-xl md:text-[22px] text-ink-900 leading-tight mb-3">
                  {r.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[14px]">{r.description}</p>
              </article>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <ul className="space-y-3 hairline-t pt-6">
              {[
                'Diploma reconhecido pelo MEC, válido em todo o Brasil',
                'Networking com profissionais experientes da sua área',
                'Atualização técnica em mercados que mudam rápido',
                'Pré-requisito pra cargos sêniores e de gestão',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-bolsa-secondary/10 text-bolsa-secondary">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-ink-700 text-[15px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="bg-paper border-y border-hairline py-12">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 text-center mb-8">
            Faculdades parceiras
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-70">
            {PARTNERS.map((p) => (
              <Image
                key={p.name}
                src={p.src}
                alt={p.name}
                width={140}
                height={36}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-28">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ink-300" />
                  FAQ
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-4">
                  Tudo sobre{' '}
                  <span className="italic text-ink-700">pós-graduação.</span>
                </h2>
                <p className="text-ink-500 text-[15px] leading-relaxed">
                  Tirou todas as suas dúvidas? Comece a busca e garanta sua vaga com bolsa.
                </p>
              </div>
            </div>
            <div className="md:col-span-7">
              <ul className="border-t border-hairline">
                {FAQ.map((faq, idx) => {
                  const open = openFaqIdx === idx
                  return (
                    <li key={idx} className="border-b border-hairline">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(open ? null : idx)}
                        aria-expanded={open}
                        className="w-full flex items-start justify-between gap-6 py-6 text-left"
                      >
                        <span className="flex items-baseline gap-4 min-w-0">
                          <span className="font-mono num-tabular text-[11px] tracking-[0.2em] text-ink-500 pt-1">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-display text-xl md:text-2xl text-ink-900 leading-snug">
                            {faq.q}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all duration-200 ${
                            open ? 'rotate-45 border-ink-900 text-ink-900' : ''
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {open && (
                        <div className="pb-6 pl-10 pr-12">
                          <p className="text-ink-500 leading-relaxed text-[15px]">{faq.a}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-12 h-12 mx-auto mb-6 text-bolsa-secondary" />
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Pronto pra{' '}
              <span className="italic text-white/85">acelerar a carreira?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Compare MBAs, especializações e pós EAD em segundos. Cadastro grátis, sem ENEM, sem
              compromisso.
            </p>
            <button
              onClick={handleBuscar}
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar bolsas de pós
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
