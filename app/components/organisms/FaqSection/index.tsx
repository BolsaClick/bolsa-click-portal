import Container from '../../atoms/Container'

const faqs = [
  {
    question: 'Como funcionam as bolsas de estudo do Bolsa Click?',
    answer:
      'O Bolsa Click conecta você a bolsas de estudo de até 95% de desconto. Basta buscar por curso, cidade e modalidade. Depois, compare os preços e se cadastre grátis para garantir sua bolsa em faculdade.',
  },
  {
    question: 'As bolsas de estudo são gratuitas?',
    answer:
      'Sim. O cadastro no Bolsa Click é 100% gratuito. Você não paga nada para buscar e comparar bolsas. Só paga a mensalidade com desconto quando se matricular na faculdade.',
  },
  {
    question: 'Quais tipos de bolsa de estudo posso encontrar?',
    answer:
      'Você encontra bolsas para graduação, pós-graduação e cursos técnicos. Todas as modalidades estão disponíveis: presencial, semipresencial e EAD. São mais de 100.000 cursos em 30.000 faculdades.',
  },
  {
    question: 'Preciso da nota do ENEM para conseguir bolsa?',
    answer:
      'Não. No Bolsa Click, você não precisa de nota do ENEM para conseguir sua bolsa de estudo. Basta se cadastrar, escolher o curso e garantir seu desconto.',
  },
  {
    question: 'A bolsa vale para todo o curso?',
    answer:
      'Sim. As bolsas de estudo do Bolsa Click valem do primeiro ao último semestre. Você paga a mensalidade com desconto durante toda a graduação ou pós-graduação.',
  },
  {
    question: 'Existem bolsas EAD disponíveis?',
    answer:
      'Sim. Temos milhares de bolsas EAD com descontos de até 80%. Os cursos a distância possuem diploma reconhecido pelo MEC, igual ao presencial. Estude de casa, no seu ritmo.',
  },
]

export default function FaqSection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Left column — sticky title */}
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-ink-300" />
                FAQ
              </span>
              <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05] mb-6">
                Tudo que você quer<br />
                <span className="italic text-ink-700">saber antes.</span>
              </h2>
              <p className="text-ink-500 text-[15px] leading-relaxed">
                Perguntas frequentes sobre bolsas, cadastros, modalidades e o que esperar do
                processo. Não achou sua dúvida? Fala com a gente.
              </p>
            </div>
          </div>

          {/* Right column — accordion */}
          <div className="md:col-span-7">
            <ul className="border-t border-hairline">
              {faqs.map((faq, idx) => (
                <li key={idx} className="border-b border-hairline">
                  <details className="group">
                    <summary className="flex items-start justify-between gap-6 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span className="font-mono num-tabular text-[11px] tracking-[0.2em] text-ink-500 pt-1">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-display text-xl md:text-2xl text-ink-900 leading-snug group-hover:italic transition-all duration-200">
                          {faq.question}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-ink-500 transition-all duration-200 group-open:rotate-45 group-open:border-ink-900 group-open:text-ink-900"
                      >
                        +
                      </span>
                    </summary>
                    <div className="pb-6 pl-10 pr-12">
                      <p className="text-ink-500 leading-relaxed text-[15px]">{faq.answer}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
