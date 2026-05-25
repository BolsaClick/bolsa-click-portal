import Link from 'next/link'

interface Alternativa {
  numero: string
  titulo: string
  descricao: string
  quemAtende: string
  cta: { label: string; href: string }
}

const ALTERNATIVAS: Alternativa[] = [
  {
    numero: '01',
    titulo: 'Bolsa própria de faculdade parceira (sem ENEM)',
    descricao:
      'Faculdades particulares parceiras negociam bolsas próprias de até 85% diretamente pelo Bolsa Click, sem nota de corte, sem critério de renda e com matrícula aberta o ano inteiro. O ingresso é via vestibular agendado online — resultado em horas — ou aproveitamento do histórico do ensino médio.',
    quemAtende: 'Quem não tem ENEM válido ou não fechou critério de renda do ProUni',
    cta: { label: 'Ver ofertas com bolsa agora →', href: '/cursos' },
  },
  {
    numero: '02',
    titulo: 'FIES — financiamento estudantil federal',
    descricao:
      'O Fundo de Financiamento Estudantil financia 50% a 100% da mensalidade durante o curso com juros subsidiados. Você paga após formado. Aceita ENEM 450+ e renda familiar per capita até 3 salários mínimos. Inscrições abrem em julho/2026 pra 2ª edição do ano.',
    quemAtende: 'Quem tem ENEM válido mas não fechou ProUni integral',
    cta: { label: 'Guia completo do FIES →', href: '/fies' },
  },
  {
    numero: '03',
    titulo: 'Lista de espera do ProUni',
    descricao:
      'Mesmo sem ter sido convocado nas 1ª e 2ª chamadas, é possível manifestar interesse na lista de espera do ProUni em uma janela de 2 dias úteis (geralmente em setembro). Convocações acontecem ao longo do semestre conforme vagas remanescentes em cada curso e faculdade.',
    quemAtende: 'Quem se inscreveu no ProUni mas não foi convocado nas chamadas regulares',
    cta: { label: 'Calendário do ProUni 2026 →', href: '/prouni' },
  },
  {
    numero: '04',
    titulo: 'Vestibular agendado com bolsa-prêmio',
    descricao:
      'Algumas faculdades parceiras oferecem bolsas adicionais de prêmio para os candidatos com melhor desempenho no vestibular online — chegando a 100% em vagas pontuais de cursos específicos. A prova é gratuita, online, com resultado em até 48 horas e matrícula no mesmo semestre.',
    quemAtende: 'Quem quer começar a estudar imediatamente, sem esperar próxima edição do ProUni',
    cta: { label: 'Saiba como funciona →', href: '/sem-enem' },
  },
]

export default function ProUniAlternativasSection() {
  return (
    <section
      id="prouni-alternativas"
      className="bg-paper py-12 md:py-16 border-b border-hairline"
      data-speakable="prouni-alternativas"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 max-w-3xl">
            Não passou no ProUni? 4 caminhos imediatos pra começar este semestre
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500 shrink-0">
            ({String(ALTERNATIVAS.length).padStart(2, '0')})
          </span>
        </div>

        {/* GEO direct-answer 40-60 palavras */}
        <p className="text-lg text-ink-900 font-medium leading-relaxed mb-8 max-w-3xl">
          Se você não foi convocado pelo ProUni, ainda há 4 caminhos viáveis pra começar a
          faculdade no mesmo semestre: bolsa própria de faculdade parceira (sem ENEM, sem nota
          de corte), <Link href="/fies" className="underline decoration-1 underline-offset-4">FIES</Link>,
          lista de espera do ProUni e vestibular agendado com bolsa-prêmio. Veja cada opção,
          quem atende e como se inscrever.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline">
          {ALTERNATIVAS.map(alt => (
            <li key={alt.numero} className="bg-paper p-6 flex flex-col">
              <span className="block font-mono num-tabular text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
                Caminho {alt.numero}
              </span>
              <h3 className="font-display text-xl text-ink-900 mb-3">{alt.titulo}</h3>
              <p className="text-ink-700 leading-relaxed text-sm mb-4 flex-1">
                {alt.descricao}
              </p>
              <p className="text-ink-500 text-xs leading-relaxed mb-4">
                <strong className="text-ink-700">Pra quem:</strong> {alt.quemAtende}
              </p>
              <Link
                href={alt.cta.href}
                className="inline-block font-mono text-[12px] tracking-[0.16em] uppercase text-ink-900 underline decoration-1 underline-offset-4 hover:text-ink-700"
              >
                {alt.cta.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
