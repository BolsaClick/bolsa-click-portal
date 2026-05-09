import React from 'react'
import Link from 'next/link'

const steps = [
  {
    n: '01',
    title: 'Escolha o curso',
    description: 'Diga o que quer estudar e onde. A gente lista as faculdades parceiras com bolsas ativas.',
  },
  {
    n: '02',
    title: 'Faça seu cadastro',
    description: 'Preencha seus dados em minutos para liberar acesso às bolsas exclusivas do Bolsa Click.',
  },
  {
    n: '03',
    title: 'Compare e escolha',
    description: 'Veja preços, descontos e modalidades lado a lado. Escolhe a que combina com você.',
  },
  {
    n: '04',
    title: 'Comece a estudar',
    description: 'Finaliza a matrícula direto na faculdade e começa as aulas com o desconto garantido.',
  },
]

const HowWork: React.FC = () => {
  return (
    <section className="bg-paper py-24 md:py-32 hairline-t">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
          <div className="md:col-span-6">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ink-300" />
              Como funciona
            </span>
            <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05]">
              Quatro passos.<br />
              <span className="italic text-ink-700">Sua bolsa garantida.</span>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:pt-3">
            <p className="text-ink-500 leading-relaxed text-[15px]">
              Sem ENEM, sem fila, sem custo de inscrição. Você escolhe, a gente cuida da parte
              chata — comparações, contato com a faculdade e suporte do início ao fim.
            </p>
          </div>
        </div>

        {/* Steps grid */}
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-hairline">
          {steps.map((s, idx) => (
            <li
              key={s.n}
              className={`group relative px-2 md:px-6 py-10 md:py-12 border-b border-hairline ${
                idx < steps.length - 1 ? 'lg:border-r' : ''
              } md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r`}
            >
              <span className="font-display num-tabular text-7xl md:text-8xl text-ink-100 leading-none block mb-6 transition-colors duration-300 group-hover:text-bolsa-secondary/70">
                {s.n}
              </span>
              <h3 className="font-display display-tight text-2xl text-ink-900 leading-tight mb-3">
                {s.title}
              </h3>
              <p className="text-ink-500 leading-relaxed text-[15px]">
                {s.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="flex justify-center mt-16">
          <Link
            href="/curso"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-ink-900 text-white font-mono text-[12px] tracking-[0.22em] uppercase hover:bg-bolsa-secondary transition-colors duration-300"
          >
            Encontre sua bolsa agora
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HowWork
