import Link from 'next/link'
import Container from '../../atoms/Container'

const sections = [
  {
    number: '01',
    label: 'EAD',
    title: 'Bolsas para estudar de casa',
    body:
      'Estude no seu ritmo, com aulas online e diploma reconhecido pelo MEC. Bolsas de até 80% nas melhores faculdades do Brasil.',
  },
  {
    number: '02',
    label: 'Presencial',
    title: 'Faculdade perto de você',
    body:
      'Compare preços entre instituições da sua cidade. Bolsas de até 70% para quem prefere a sala de aula tradicional.',
  },
  {
    number: '03',
    label: 'Graduação',
    title: 'Bacharelado, licenciatura ou tecnólogo',
    body:
      'Mais de 100 mil cursos disponíveis em 30 mil faculdades parceiras. Administração, Direito, Enfermagem, Pedagogia e muito mais.',
  },
  {
    number: '04',
    label: 'Pós',
    title: 'Especialização e MBA com desconto',
    body:
      'Descontos de até 80% em pós-graduação lato sensu. Cursos de 6 a 18 meses, online ou presencial, ideais pra avançar na carreira.',
  },
]

export default function ScholarshipInfoSection() {
  return (
    <section className="bg-paper-warm py-24 md:py-32">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ink-300" />
              Como funcionam as bolsas
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05] max-w-3xl mx-auto">
              Tudo o que você precisa saber<br />
              <span className="italic text-ink-700">antes de escolher.</span>
            </h2>
          </div>

          {/* Editorial 4-up grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
            {sections.map((s) => (
              <article key={s.number} className="bg-white p-8 md:p-10">
                <div className="flex items-baseline justify-between mb-6 hairline-b pb-3">
                  <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-700">
                    {s.number}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                    {s.label}
                  </span>
                </div>
                <h3 className="font-display display-tight text-2xl md:text-3xl text-ink-900 leading-tight mb-4">
                  {s.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">
                  {s.body}
                </p>
              </article>
            ))}
          </div>

          {/* Pull-quote CTA */}
          <div className="mt-16 md:mt-20 text-center">
            <p className="font-display text-2xl md:text-3xl italic text-ink-700 max-w-2xl mx-auto leading-snug mb-8">
              &ldquo;O processo é simples. Você busca, compara, se inscreve. Sem ENEM, sem fila, sem custo.&rdquo;
            </p>
            <Link
              href="/curso/resultado?nivel=GRADUACAO"
              className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.22em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
            >
              Buscar bolsas agora
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
