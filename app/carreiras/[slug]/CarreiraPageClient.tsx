'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FeaturedCourseData } from '@/app/cursos/_data/types'
import { courseTypeLabel } from '@/app/lib/courseTypeLabel'

interface Props {
  profissao: FeaturedCourseData
  related: FeaturedCourseData[]
}

const DEMAND_LABEL = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
} as const

const DEMAND_DOT = {
  ALTA: 'bg-emerald-500',
  MEDIA: 'bg-amber-500',
  BAIXA: 'bg-ink-300',
} as const

export default function CarreiraPageClient({ profissao, related }: Props) {
  return (
    <main className="bg-paper">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500">
            <li><Link href="/" className="hover:text-ink-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/carreiras" className="hover:text-ink-900">Carreiras</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-900">{profissao.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 border border-hairline px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-700">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${DEMAND_DOT[profissao.marketDemand]}`} aria-hidden="true" />
                  Demanda {DEMAND_LABEL[profissao.marketDemand]}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                  {courseTypeLabel(profissao.type)} · {profissao.duration}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-ink-900 leading-[1.05] tracking-tight">
                Carreira em {profissao.name}
              </h1>
              <p className="mt-5 text-lg md:text-xl text-ink-700 max-w-2xl leading-relaxed">
                {profissao.description}
              </p>

              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px bg-hairline border border-hairline max-w-2xl">
                <div className="bg-white px-4 py-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Salário médio</dt>
                  <dd className="mt-1 font-display num-tabular text-xl text-ink-900">{profissao.averageSalary}</dd>
                </div>
                <div className="bg-white px-4 py-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Duração</dt>
                  <dd className="mt-1 font-display num-tabular text-xl text-ink-900">{profissao.duration}</dd>
                </div>
                <div className="bg-white px-4 py-3">
                  <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Bolsa até</dt>
                  <dd className="mt-1 font-display num-tabular text-xl text-bolsa-secondary">80%</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/cursos/${profissao.slug}`}
                  className="inline-flex items-center gap-2 border border-ink-900 bg-ink-900 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-white hover:bg-bolsa-secondary hover:border-bolsa-secondary transition-colors"
                >
                  Ver bolsas em {profissao.name} →
                </Link>
                <Link
                  href="/teste-vocacional"
                  className="inline-flex items-center gap-2 border border-ink-900 bg-white px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-900 hover:bg-paper transition-colors"
                >
                  Fazer teste vocacional
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-paper">
                <Image
                  src={profissao.imageUrl}
                  alt={profissao.imageAlt || `${profissao.name} — Bolsa Click`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que faz */}
      <section className="bg-paper border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
              O que faz um profissional de {profissao.name}
            </h2>
            <p className="text-ink-900 text-lg leading-relaxed whitespace-pre-line">
              {profissao.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Áreas + Habilidades */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
                Áreas de atuação
              </h2>
              <ul className="space-y-3">
                {profissao.areas.map((area, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="font-mono num-tabular text-[10px] text-ink-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-ink-900">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
                Habilidades necessárias
              </h2>
              <ul className="space-y-3">
                {profissao.skills.map((skill, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="font-mono num-tabular text-[10px] text-ink-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-ink-900">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Caminhos de carreira */}
      {profissao.careerPaths.length > 0 && (
        <section className="bg-paper border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
              Caminhos possíveis na carreira
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
              {profissao.careerPaths.map((path, i) => (
                <li key={i} className="bg-white px-5 py-5">
                  <span className="font-mono num-tabular text-[10px] text-ink-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-2 font-display text-lg text-ink-900">{path}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Como se tornar */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
            Como se tornar
          </h2>
          <p className="text-ink-900 text-lg leading-relaxed">
            Para atuar como <strong>{profissao.name}</strong>, é necessário cursar{' '}
            <strong>{profissao.fullName}</strong>, com duração de <strong>{profissao.duration}</strong>.
            Pelo Bolsa Click, você encontra a graduação em mais de 30.000 faculdades parceiras com{' '}
            <strong>bolsa de até 80%</strong> nas modalidades presencial, EAD e semipresencial.
          </p>
          <Link
            href={`/cursos/${profissao.slug}`}
            className="mt-6 inline-flex items-center gap-2 border border-ink-900 bg-ink-900 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-white hover:bg-bolsa-secondary hover:border-bolsa-secondary transition-colors"
          >
            Ver bolsas para {profissao.name} →
          </Link>
        </div>
      </section>

      {/* FAQ visível */}
      <section className="bg-paper border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-8">
            Perguntas frequentes sobre a carreira de {profissao.name}
          </h2>
          <div className="divide-y divide-hairline border-y border-hairline">
            {[
              {
                q: `Quanto ganha um profissional de ${profissao.name}?`,
                a: `O salário médio de um profissional formado em ${profissao.name} no Brasil é de ${profissao.averageSalary}, segundo dados do CAGED (Cadastro Geral de Empregados e Desempregados do Ministério do Trabalho). O valor varia significativamente conforme três fatores principais: experiência (profissionais em início de carreira ficam na faixa inferior; sêniores com mais de 10 anos de mercado podem ultrapassar o teto), região (São Paulo, Rio de Janeiro e Distrito Federal pagam em média 25-35% acima da média nacional) e setor de atuação. ${profissao.careerPaths.slice(0, 3).join(', ')} são caminhos que costumam oferecer faixas salariais mais altas. Profissionais com pós-graduação ou especialização técnica ganham acima da média base. Concursos públicos federais e cargos em multinacionais costumam ficar nas faixas superiores.`,
              },
              {
                q: `O que faz um profissional de ${profissao.name}?`,
                a: profissao.longDescription,
              },
              {
                q: `Como se tornar um profissional de ${profissao.name}?`,
                a: `Para atuar como ${profissao.name} no Brasil, o caminho principal é cursar a graduação em ${profissao.fullName}, com duração padrão de ${profissao.duration} conforme as Diretrizes Curriculares Nacionais (DCN) do MEC. O curso pode ser feito em modalidade presencial, EAD ou semipresencial — todas formam profissionais com diploma equivalente e mesma validade legal. As principais habilidades desenvolvidas durante a graduação são ${profissao.skills.slice(0, 3).join(', ')}. Pelo Bolsa Click, você encontra a graduação em mais de 30.000 faculdades parceiras com bolsa de até 80% sobre a mensalidade. A inscrição é gratuita e em algumas faculdades o ingresso é por vestibular agendado online (sem necessidade de ENEM), com resultado em até 48 horas e matrícula imediata após aprovação.`,
              },
              {
                q: `Como está o mercado de trabalho para ${profissao.name}?`,
                a: `O mercado de trabalho para ${profissao.name} no Brasil apresenta ${DEMAND_LABEL[profissao.marketDemand].toLowerCase()} demanda em 2026. As principais áreas de atuação incluem ${profissao.areas.join(', ')}. ${profissao.careerPaths.slice(0, 4).join(', ')} são os caminhos de carreira mais comuns pra quem se forma. A absorção pelo mercado depende da região (capitais e cidades médias têm mais vagas formais), do tipo de empregador (empresas privadas, órgãos públicos via concurso, prática autônoma ou consultoria) e da especialização (pós-graduação aumenta empregabilidade e teto salarial). Setores em crescimento que demandam profissionais formados em ${profissao.name} incluem agentes empregadores tradicionais e novos segmentos que vêm aumentando a demanda nos últimos anos. A profissão é regulamentada pelo conselho profissional correspondente quando exigido pela legislação brasileira.`,
              },
            ].map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-baseline justify-between cursor-pointer list-none gap-6">
                  <h3 className="font-display text-lg md:text-xl text-ink-900 group-open:italic">
                    {item.q}
                  </h3>
                  <span className="font-mono text-xs text-ink-500 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-ink-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Outras carreiras */}
      {related.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Outras carreiras
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(related.length).padStart(2, '0')})
              </span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-hairline">
              {related.map((c) => (
                <li key={c.slug} className="bg-white">
                  <Link
                    href={`/carreiras/${c.slug}`}
                    className="group flex flex-col px-5 py-5 transition-colors hover:bg-paper"
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                      {c.averageSalary}
                    </span>
                    <span className="font-display text-lg text-ink-900 group-hover:italic transition-all">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
