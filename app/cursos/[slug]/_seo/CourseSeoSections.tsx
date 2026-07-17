import Link from 'next/link'
import { Course } from '@/app/interface/course'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { COURSE_FAQS } from '../../_data/course-faqs'

interface OffersTableProps {
  offers: Course[]
  courseName: string
}

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: string) => {
  const upper = (m || '').toUpperCase()
  if (upper === 'EAD') return 'EAD'
  if (upper === 'SEMIPRESENCIAL') return 'Semipresencial'
  if (upper === 'PRESENCIAL') return 'Presencial'
  return m || '—'
}

function discountPct(min: number, max?: number) {
  if (!max || max <= min) return null
  // floor: o % exibido nunca é maior que o desconto real (transparência)
  return Math.floor(((max - min) / max) * 100)
}

export function OffersComparisonTable({ offers, courseName }: OffersTableProps) {
  if (!offers || offers.length === 0) return null

  const rows = offers.slice(0, 12)

  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Comparativo de faculdades — {courseName}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(rows.length).padStart(2, '0')})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                Faculdades parceiras que oferecem {courseName}, com modalidade, cidade, mensalidade com bolsa e desconto aplicado.
              </caption>
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Faculdade
                  </th>
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Modalidade
                  </th>
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Cidade
                  </th>
                  <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Mensalidade c/ bolsa
                  </th>
                  <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Desconto
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o, i) => {
                  const min = o.minPrice || 0
                  const max = o.maxPrice
                  const pct = discountPct(min, max)
                  const cityLabel = o.unitCity || o.city || '—'
                  const stateLabel = o.unitState || o.uf || ''
                  return (
                    <tr key={`${o.id}-${i}`} className="border-b border-hairline/60 hover:bg-paper">
                      <td className="py-3 px-3 text-ink-900">{o.brand || '—'}</td>
                      <td className="py-3 px-3 text-ink-700">{modalityLabel(o.modality)}</td>
                      <td className="py-3 px-3 text-ink-700">
                        {cityLabel}{stateLabel ? `, ${stateLabel}` : ''}
                      </td>
                      <td className="py-3 px-3 text-right num-tabular text-ink-900">
                        {min > 0 ? `R$ ${formatBRL(min)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right num-tabular text-bolsa-secondary">
                        {pct ? `${pct}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {offers.length > rows.length && (
            <p className="mt-4 font-mono text-[11px] text-ink-500">
              Mostrando {rows.length} de {offers.length} ofertas. Veja a lista completa abaixo.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

interface FaqItem {
  question: string
  answer: string
}

interface VisibleFaqProps {
  items: FaqItem[]
  heading: string
}

export function VisibleFaq({ items, heading }: VisibleFaqProps) {
  if (!items || items.length === 0) return null
  return (
    <section className="bg-paper py-12 md:py-16 border-t border-hairline" data-speakable="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8">
            {heading}
          </h2>
          <div className="divide-y divide-hairline border-y border-hairline">
            {items.map((it, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-baseline justify-between cursor-pointer list-none gap-6">
                  <h3 className="font-display text-lg md:text-xl text-ink-900 group-open:italic">
                    {it.question}
                  </h3>
                  <span className="font-mono text-xs text-ink-500 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-ink-700 leading-relaxed">{it.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface CitiesGridProps {
  courseSlug: string
  courseName: string
  currentCitySlug?: string
}

export function CitiesGrid({ courseSlug, courseName, currentCitySlug }: CitiesGridProps) {
  // Com 100 cidades na base, mostrar todas no grid de uma vez fica ruim de
  // escanear. Limitamos a 30 destaques (top por relevância na lista) + um link
  // pro hub geral pra preservar crawl path.
  const allOthers = BRAZILIAN_CITIES.filter(c => c.slug !== currentCitySlug)
  const cities = allOthers.slice(0, 30)
  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              {courseName} em outras cidades
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cities.length).padStart(2, '0')} de {String(allOthers.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {cities.map((c) => (
              <li key={c.slug} className="bg-white">
                <Link
                  href={`/cursos/${courseSlug}/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-paper"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                    {c.state}
                  </span>
                  <span className="block font-display text-base text-ink-900">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {allOthers.length > cities.length && (
            <div className="mt-6 text-center">
              <Link
                href="/bolsas-de-estudo"
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-700 hover:text-ink-900 border-b border-ink-700 hover:border-ink-900 pb-1"
              >
                Ver todas as cidades →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// FAQ answers expandidos pra ~134-167 palavras (target ideal pra extração AI).
// Combinam dados do DB (longDescription, areas, skills, careerPaths, averageSalary,
// marketDemand, duration) pra produzir blocos self-contained e citáveis.
// Slugs canônicos têm sufixo de tipo (ex: "psicologia-bacharelado"), mas
// COURSE_FAQS é chaveado pelo nome-base ("psicologia"). Removemos o sufixo pra
// casar — funciona tanto com slug curto quanto canônico.
const COURSE_SLUG_SUFFIXES = ['-bacharelado', '-licenciatura', '-tecnologo', '-especializacao', '-mba']
function baseCourseSlug(slug: string): string {
  const suffix = COURSE_SLUG_SUFFIXES.find((s) => slug.endsWith(s))
  return suffix ? slug.slice(0, -suffix.length) : slug
}

export function buildCourseFaqItems(curso: FeaturedCourseData, lowPrice: number): FaqItem[] {
  // Se o curso tem FAQ específico curado, usar (top 10 cursos).
  // Fallback pro template genérico nos restantes.
  const custom = COURSE_FAQS[curso.slug] ?? COURSE_FAQS[baseCourseSlug(curso.slug)]
  if (custom && custom.length > 0) {
    return custom
  }

  const areas = (curso.areas || []).slice(0, 4).join(', ')
  const skills = (curso.skills || []).slice(0, 3).join(', ')
  const careers = (curso.careerPaths || []).slice(0, 4).join(', ')
  const demandLabel =
    curso.marketDemand === 'ALTA' ? 'alta demanda' : curso.marketDemand === 'MEDIA' ? 'demanda moderada' : 'demanda baixa'

  return [
    {
      question: `O que é o curso de ${curso.name}?`,
      answer: `${curso.longDescription}${areas ? ` As principais áreas de atuação incluem ${areas}.` : ''}${skills ? ` Durante a graduação, o aluno desenvolve competências como ${skills}.` : ''} Pelo Bolsa Click, é possível encontrar ofertas com bolsa de até 80% nas maiores redes de ensino do país, todas reconhecidas pelo MEC, nas modalidades presencial, EAD e semipresencial.`,
    },
    {
      question: `Quanto tempo dura o curso de ${curso.name}?`,
      answer: `O curso de ${curso.fullName} tem duração de ${curso.duration} em sua versão padrão reconhecida pelo MEC. Essa duração inclui carga horária mínima exigida pelas Diretrizes Curriculares Nacionais (DCN), além do estágio supervisionado quando obrigatório pela profissão. Cursos na modalidade EAD ou semipresencial mantêm a mesma duração total da modalidade presencial — o diploma final é equivalente em todas as modalidades. Algumas faculdades oferecem aceleração via aproveitamento de disciplinas (transferência interna ou externa), permitindo reduzir o tempo total quando o estudante já cursou ao menos um semestre em outra instituição. Pelo Bolsa Click, você compara modalidades disponíveis para ${curso.name} nas maiores redes de ensino do país com bolsa de até 80%.`,
    },
    {
      question: `Quanto custa o curso de ${curso.name} com bolsa?`,
      answer:
        lowPrice > 0
          ? `Com bolsa pelo Bolsa Click, o curso de ${curso.name} pode ser encontrado a partir de R$ ${formatBRL(lowPrice)} por mês, com descontos de até 80% sobre a mensalidade cheia. Os valores variam por modalidade (EAD costuma ser mais acessível que presencial), por instituição (faculdades de grande porte como Anhanguera, Estácio, Unopar e Pitágoras têm faixas competitivas) e pela região (capitais de SP/RJ tendem a ter mensalidades cheias maiores). A inscrição no Bolsa Click é totalmente gratuita — você compara ofertas, escolhe a bolsa que melhor cabe no orçamento e faz matrícula direto pela faculdade sem custo de processo seletivo. Não há taxa de manutenção ou cobrança escondida na bolsa.`
          : `O Bolsa Click oferece bolsas de até 80% de desconto para o curso de ${curso.name} nas maiores redes de ensino do país. Os valores específicos dependem da modalidade (presencial, EAD ou semipresencial), da instituição escolhida e da disponibilidade de vagas com bolsa no momento da inscrição. Em geral, cursos EAD têm mensalidades a partir de R$ 99 a R$ 199 com bolsa, enquanto presencial varia de R$ 299 a R$ 599 com bolsa em capitais. Cadastre-se grátis para ver as ofertas atualizadas em tempo real e simular o valor com bolsa antes de decidir.`,
    },
    {
      question: `Qual o salário médio de quem faz ${curso.name}?`,
      answer: `Profissionais formados em ${curso.name} têm salário médio de ${curso.averageSalary} no Brasil, segundo dados do CAGED (Cadastro Geral de Empregados e Desempregados do Ministério do Trabalho). O valor varia conforme a região, o tipo de empregador (público, privado ou autônomo) e a experiência: profissionais em início de carreira costumam ficar na faixa inferior, enquanto especialistas com pós-graduação ou anos de mercado podem ultrapassar o teto da faixa. As áreas com melhores salários costumam ser ${areas || 'setor privado, consultorias e cargos públicos via concurso'}. O mercado de trabalho para ${curso.name} apresenta ${demandLabel}, com oportunidades em ${careers || 'empresas privadas, órgãos públicos e atuação autônoma'}. A profissão é regulamentada pelo conselho profissional correspondente quando exigido pela legislação.`,
    },
  ]
}

export function buildCityFaqItems(
  curso: FeaturedCourseData,
  cityName: string,
  cityState: string,
  lowPrice: number,
): FaqItem[] {
  const areas = (curso.areas || []).slice(0, 3).join(', ')

  return [
    {
      question: `Quanto custa ${curso.name} em ${cityName}?`,
      answer:
        lowPrice > 0
          ? `Em ${cityName}-${cityState}, o curso de ${curso.name} pode ser encontrado a partir de R$ ${formatBRL(lowPrice)} por mês com bolsa pelo Bolsa Click, considerando descontos de até 80% sobre a mensalidade cheia. Os valores variam conforme a faculdade escolhida, modalidade (EAD costuma ser mais acessível que presencial em ${cityName}) e disponibilidade de vagas. Faculdades parceiras como Anhanguera, Estácio, Unopar e Pitágoras costumam ter polos físicos em ${cityName} oferecendo o curso em modalidade presencial e semipresencial, com flexibilidade de turno (manhã, tarde ou noite). A inscrição é totalmente gratuita e a matrícula é feita direto pela faculdade após a aprovação no processo seletivo simplificado. Não há custo de processo seletivo nas ofertas com bolsa pelo Bolsa Click.`
          : `O Bolsa Click oferece bolsas de até 80% de desconto para ${curso.name} em ${cityName}-${cityState}. Os valores variam por instituição parceira, modalidade (presencial, EAD ou semipresencial) e disponibilidade de vagas no momento da inscrição. Em ${cityName}, faculdades como Anhanguera, Estácio, Unopar e Pitágoras costumam ter polos físicos com oferta de ${curso.name} a partir de R$ 199 a R$ 599 por mês com bolsa aplicada. A inscrição é gratuita e a matrícula é feita direto pela faculdade após a aprovação no vestibular simplificado. Cadastre-se grátis pra ver as ofertas atualizadas em tempo real e comparar preço, polo, modalidade e desconto.`,
    },
    {
      question: `Quais faculdades oferecem ${curso.name} em ${cityName}?`,
      answer: `Em ${cityName}-${cityState}, diversas faculdades parceiras do Bolsa Click oferecem ${curso.name}, incluindo redes nacionais como Anhanguera, Estácio, Unopar, Pitágoras e Unime — todas reconhecidas pelo Ministério da Educação (MEC) com cursos avaliados pelo Sistema Nacional de Avaliação da Educação Superior (Sinaes). A oferta exata depende do polo local de cada instituição e da modalidade escolhida (presencial, EAD ou semipresencial). Cursos EAD têm cobertura praticamente universal — qualquer cidade brasileira com internet permite estudar. Já a modalidade presencial depende de polo físico em ${cityName} ou cidade vizinha. Pelo Bolsa Click, você compara as faculdades disponíveis em ${cityName}, vê o polo de cada uma, a mensalidade com bolsa, a nota do MEC e as condições de pagamento — tudo em uma única busca.`,
    },
    {
      question: `${curso.name} em ${cityName} é EAD ou presencial?`,
      answer: `O curso de ${curso.name} em ${cityName} está disponível em três modalidades: presencial (aulas em polo físico, com encontros regulares e laboratórios quando exigido pelo currículo), EAD/a distância (aulas online via plataforma da faculdade, com encontros presenciais apenas para provas e atividades obrigatórias) e semipresencial (mistura dos dois formatos, geralmente com 20-40% de carga horária presencial). A escolha depende do estilo de vida do estudante: quem trabalha em horário comercial costuma escolher EAD; quem quer experiência de campus completa prefere presencial. As três modalidades formam profissionais com o mesmo diploma reconhecido pelo MEC, mesma validade legal e mesmas competências mínimas exigidas pelas Diretrizes Curriculares Nacionais. ${areas ? `As principais áreas de atuação são ${areas}, independentemente da modalidade.` : ''}`,
    },
    {
      question: `Quanto tempo dura ${curso.name}?`,
      answer: `O curso de ${curso.fullName} tem duração padrão de ${curso.duration}, conforme definido pelas Diretrizes Curriculares Nacionais (DCN) do Ministério da Educação. Essa duração é a mesma em todas as modalidades (presencial, EAD e semipresencial) e em qualquer cidade do Brasil, incluindo ${cityName} — o diploma final é equivalente. A carga horária total inclui disciplinas teóricas, práticas, estágio supervisionado obrigatório (quando previsto pelo currículo do curso) e atividades complementares. Estudantes que já cursaram parcialmente a graduação em outra faculdade podem solicitar transferência interna ou externa, aproveitando disciplinas já concluídas e reduzindo o tempo total. Pelo Bolsa Click, você confere a duração específica de cada oferta em ${cityName} e compara opções com bolsa de até 80% em diferentes modalidades pra encontrar a que melhor encaixa na sua rotina.`,
    },
  ]
}
