import { Metadata } from 'next'
import Link from 'next/link'
import { EDITORIAL_TEAM } from '@/app/lib/blog/editorial-team'

const SITE_URL = 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Equipe Editorial Bolsa Click — Critérios e Fontes',
  description:
    'Conheça a equipe editorial responsável pelo conteúdo do Bolsa Click: critérios de revisão, fontes utilizadas (CAGED, MEC, INEP), processo de atualização e princípios E-E-A-T que guiam o que publicamos.',
  keywords: [
    'equipe editorial bolsa click',
    'autores bolsa click',
    'fontes bolsa click',
    'política editorial',
    'critérios bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/sobre/equipe-editorial` },
  openGraph: {
    title: 'Equipe Editorial Bolsa Click',
    description: 'Como produzimos conteúdo sobre educação superior no Brasil — critérios, fontes e processo de revisão.',
    url: `${SITE_URL}/sobre/equipe-editorial`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/sobre/equipe-editorial#editorial-team`,
  name: 'Equipe Editorial Bolsa Click',
  url: `${SITE_URL}/sobre/equipe-editorial`,
  parentOrganization: {
    '@type': 'EducationalOrganization',
    name: 'Bolsa Click',
    url: SITE_URL,
  },
  knowsAbout: [
    'Bolsas de estudo no Brasil',
    'ENEM, SISU, PROUNI, FIES',
    'Educação superior',
    'Graduação e pós-graduação',
    'Carreiras e mercado de trabalho',
  ],
  sameAs: [
    'https://www.instagram.com/bolsaclick',
    'https://www.linkedin.com/company/bolsa-click',
    'https://www.facebook.com/bolsaclickbrasil',
  ],
  // Membros derivados do registry único (app/lib/blog/editorial-team) — o @id de
  // cada Person bate com o @id usado no `author` de cada post (mesma âncora).
  member: EDITORIAL_TEAM.map((p) => ({
    '@type': 'Person',
    '@id': `${SITE_URL}/sobre/equipe-editorial#${p.slug}`,
    name: p.name,
    jobTitle: p.jobTitle,
    url: `${SITE_URL}/sobre/equipe-editorial#${p.slug}`,
    description: p.bio,
    worksFor: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    knowsAbout: p.knowsAbout,
    sameAs: ['https://www.linkedin.com/company/bolsa-click'],
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Sobre', item: `${SITE_URL}/quem-somos` },
    { '@type': 'ListItem', position: 3, name: 'Equipe Editorial', item: `${SITE_URL}/sobre/equipe-editorial` },
  ],
}

export default function EquipeEditorialPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="bg-paper">
        <nav aria-label="Breadcrumb" className="bg-white border-b border-hairline">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500">
              <li><Link href="/" className="hover:text-ink-900">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/quem-somos" className="hover:text-ink-900">Sobre</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink-900">Equipe Editorial</li>
            </ol>
          </div>
        </nav>

        <section className="bg-white border-b border-hairline">
          <div className="container mx-auto px-4 py-14 md:py-20 max-w-4xl">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-4">
              Sobre · Equipe Editorial
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-[1.05] tracking-tight">
              A equipe por trás do conteúdo do Bolsa Click
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-700 max-w-3xl leading-relaxed">
              Somos uma equipe brasileira dedicada a transformar informação sobre bolsas de estudo,
              carreira e ensino superior em algo prático e útil pra quem está decidindo o próximo
              passo. Todo conteúdo publicado passa por critérios claros de fonte, revisão e
              atualização — pra você confiar no que lê.
            </p>
          </div>
        </section>

        <section className="bg-white border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl text-ink-900 mb-8">Quem escreve aqui</h2>
            <div className="space-y-4">
              {EDITORIAL_TEAM.map((persona) => (
                <div
                  key={persona.slug}
                  id={persona.slug}
                  className="flex items-start gap-5 bg-paper rounded-xl border border-hairline p-6 scroll-mt-24"
                >
                  <div
                    aria-hidden="true"
                    className="flex-shrink-0 w-14 h-14 rounded-full bg-bolsa-primary/10 flex items-center justify-center text-bolsa-primary font-display text-xl font-semibold"
                  >
                    {persona.initials}
                  </div>
                  <div>
                    <p className="font-display text-lg text-ink-900 leading-snug">{persona.name}</p>
                    <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mt-0.5 mb-3">
                      {persona.jobTitle}
                    </p>
                    <p className="text-ink-700 text-sm leading-relaxed">{persona.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-paper border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl text-ink-900 mb-6">Como produzimos conteúdo</h2>
            <p className="text-ink-700 leading-relaxed mb-4">
              Todo guia de curso, página de carreira e artigo de blog do Bolsa Click é produzido
              seguindo um processo editorial em quatro etapas: <strong>pesquisa</strong> em fontes
              primárias e dados oficiais; <strong>redação</strong> por profissionais com formação
              em educação ou comunicação; <strong>revisão técnica</strong> por especialista da
              área quando o tema é YMYL (decisão de carreira, salário, financiamento); e
              <strong> atualização recorrente</strong> sempre que dados de mercado, legislação ou
              calendário mudam.
            </p>
            <p className="text-ink-700 leading-relaxed">
              Nossa missão editorial é simples: traduzir informação técnica sobre educação superior
              em decisões práticas. Não escondemos exceções, não inflamos números, não usamos jargão
              quando palavra simples basta.
            </p>
          </div>
        </section>

        <section className="bg-white border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl text-ink-900 mb-6">Fontes que usamos</h2>
            <ul className="space-y-3 text-ink-700">
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">CAGED</span>
                <span>Cadastro Geral de Empregados e Desempregados do Ministério do Trabalho — dados de salário e contratação por profissão.</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">MEC</span>
                <span>Ministério da Educação — credenciamento de instituições, nota IGC, calendário oficial dos programas (ENEM, SISU, PROUNI, FIES).</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">INEP</span>
                <span>Instituto Nacional de Estudos e Pesquisas — calendário do ENEM, ENADE, estatísticas educacionais.</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">IBGE</span>
                <span>Instituto Brasileiro de Geografia e Estatística — população por cidade, indicadores demográficos.</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">CONSELHOS</span>
                <span>Conselhos profissionais (CRA, CREA, CRM, CRP, CRMV, CRC, etc) — regulamentação por profissão e pisos salariais setoriais.</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mt-1">DADOS PRÓPRIOS</span>
                <span>Catálogo Bolsa Click — 117 cursos enriquecidos, 283 cidades cobertas, instituições parceiras com dados verificados.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-paper border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl text-ink-900 mb-6">Princípios editoriais</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg text-ink-900 mb-2">1. Atribuir fontes sempre</h3>
                <p className="text-ink-700 leading-relaxed">
                  Toda estatística citada vem com fonte e ano. Se a referência é o CAGED 2025, dizemos.
                  Se é estimativa baseada em pesquisa setorial, marcamos como estimativa.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg text-ink-900 mb-2">2. Nuance acima de simplicidade enganosa</h3>
                <p className="text-ink-700 leading-relaxed">
                  Salário médio depende de cidade, modalidade, experiência. Não escondemos isso atrás
                  de um número único. Mostramos faixa, contexto e exceção.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg text-ink-900 mb-2">3. Atualizar quando o mundo muda</h3>
                <p className="text-ink-700 leading-relaxed">
                  Calendário de ENEM/SISU/PROUNI/FIES é revisado anualmente. Salários e dados de mercado
                  são atualizados sempre que CAGED ou pesquisas setoriais publicam novidade relevante.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg text-ink-900 mb-2">4. Não vender o que não existe</h3>
                <p className="text-ink-700 leading-relaxed">
                  Trabalhamos com bolsas reais de até 80% negociadas com instituições parceiras. Não
                  prometemos vagas em universidade pública, descontos impossíveis ou diploma sem
                  estudo. O que falamos no site, podemos comprovar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl text-ink-900 mb-6">Contato e correções</h2>
            <p className="text-ink-700 leading-relaxed mb-4">
              Encontrou erro factual, dado desatualizado ou informação que não bate? Escreva pra
              <a href="mailto:contato@bolsaclick.com.br" className="text-bolsa-secondary underline ml-1">contato@bolsaclick.com.br</a> com a referência da página e a correção.
              Revisamos toda solicitação em até 5 dias úteis.
            </p>
            <p className="text-ink-700 leading-relaxed">
              Para parcerias editoriais, colaboração com jornalistas ou solicitação de dados
              originais do Bolsa Click pra reportagens, entre em contato pelo mesmo email com o
              assunto &ldquo;Imprensa&rdquo;.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
