import Container from '../../atoms/Container'

const cards = [
  {
    number: '01',
    label: 'Ingresso',
    title: 'Sem ENEM, sem fila.',
    description: 'Faça sua prova online ou presencial, no dia que escolher. Nada de espera.',
  },
  {
    number: '02',
    label: 'Ofertas',
    title: 'Início imediato.',
    description: 'Garante sua bolsa hoje e começa as aulas no próximo ciclo. Vagas reais, atualizadas.',
  },
  {
    number: '03',
    label: 'Desconto',
    title: 'Até 80% de bolsa.',
    description: 'Compare ofertas entre faculdades e descubra a que cabe no seu bolso.',
  },
]

const Cta = () => {
  return (
    <section aria-labelledby="cta-title" className="bg-paper py-20 md:py-28">
      <Container>
        <h2 id="cta-title" className="sr-only">Vantagens do Bolsa Click</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline">
          {cards.map((card) => (
            <article
              key={card.number}
              className="group relative px-6 md:px-8 py-10 md:py-12 border-b border-hairline md:border-r last:md:border-r-0 transition-colors duration-300 hover:bg-paper-warm"
            >
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-mono num-tabular text-[11px] tracking-[0.22em] uppercase text-ink-500">
                  {card.number} / {String(cards.length).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-300">
                  {card.label}
                </span>
              </div>

              <h3 className="font-display display-tight text-2xl md:text-3xl text-ink-900 leading-tight mb-4">
                {card.title}
              </h3>
              <p className="text-ink-500 leading-relaxed text-[15px]">
                {card.description}
              </p>

              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px bg-ink-900 transition-all duration-500 group-hover:w-full w-12"
              />
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Cta
