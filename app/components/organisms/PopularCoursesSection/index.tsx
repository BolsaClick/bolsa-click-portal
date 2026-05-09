import Link from 'next/link'
import Container from '../../atoms/Container'

const cursosPopulares = [
  { nome: 'Administração', slug: 'administracao', desc: '80%' },
  { nome: 'Direito', slug: 'direito', desc: '75%' },
  { nome: 'Enfermagem', slug: 'enfermagem', desc: '70%' },
  { nome: 'Psicologia', slug: 'psicologia', desc: '80%' },
  { nome: 'Pedagogia', slug: 'pedagogia', desc: '80%' },
  { nome: 'Educação Física', slug: 'educacao-fisica', desc: '75%' },
  { nome: 'Ciências Contábeis', slug: 'ciencias-contabeis', desc: '80%' },
  { nome: 'Engenharia Civil', slug: 'engenharia-civil', desc: '70%' },
  { nome: 'Nutrição', slug: 'nutricao', desc: '75%' },
  { nome: 'Fisioterapia', slug: 'fisioterapia', desc: '70%' },
  { nome: 'ADS', slug: 'analise-e-desenvolvimento-de-sistemas', desc: '80%' },
  { nome: 'Biomedicina', slug: 'biomedicina', desc: '70%' },
]

const cidadesPopulares = [
  { nome: 'São Paulo', estado: 'SP' },
  { nome: 'Rio de Janeiro', estado: 'RJ' },
  { nome: 'Belo Horizonte', estado: 'MG' },
  { nome: 'Curitiba', estado: 'PR' },
  { nome: 'Porto Alegre', estado: 'RS' },
  { nome: 'Brasília', estado: 'DF' },
  { nome: 'Salvador', estado: 'BA' },
  { nome: 'Recife', estado: 'PE' },
  { nome: 'Fortaleza', estado: 'CE' },
  { nome: 'Goiânia', estado: 'GO' },
  { nome: 'Campinas', estado: 'SP' },
  { nome: 'Manaus', estado: 'AM' },
]

export default function PopularCoursesSection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
          <div className="md:col-span-5">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ink-300" />
              Catálogo
            </span>
            <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05]">
              As melhores faculdades<br />
              <span className="italic text-ink-700">do Brasil em um só lugar.</span>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-3">
            <p className="text-ink-500 leading-relaxed text-[15px] md:text-base">
              Compare preços, modalidades e bolsas em mais de 30 mil instituições parceiras. Inscrição gratuita,
              sem precisar de nota do ENEM, com diploma reconhecido pelo MEC.
            </p>
          </div>
        </div>

        {/* Cursos */}
        <div className="mb-20">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h3 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Graduação · Cursos populares
            </h3>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cursosPopulares.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-hairline">
            {cursosPopulares.map((curso) => (
              <li key={curso.slug} className="bg-white">
                <Link
                  href={`/cursos/${curso.slug}`}
                  className="group flex items-baseline justify-between px-5 py-5 transition-colors duration-200 hover:bg-paper"
                >
                  <span className="font-display text-lg md:text-xl text-ink-900 group-hover:italic transition-all duration-200">
                    {curso.nome}
                  </span>
                  <span className="font-mono num-tabular text-xs text-ink-500 group-hover:text-bolsa-secondary transition-colors">
                    —{curso.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cidades */}
        <div className="mb-16">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h3 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Bolsas por cidade
            </h3>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cidadesPopulares.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-hairline">
            {cidadesPopulares.map((cidade) => (
              <li key={cidade.nome} className="bg-white">
                <Link
                  href={`/curso/resultado?cidade=${encodeURIComponent(cidade.nome)}&estado=${cidade.estado}&nivel=GRADUACAO`}
                  className="group flex flex-col px-5 py-5 transition-colors duration-200 hover:bg-paper"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                    {cidade.estado}
                  </span>
                  <span className="font-display text-lg text-ink-900 group-hover:italic transition-all duration-200">
                    {cidade.nome}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="/cursos"
            className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.22em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
          >
            Ver catálogo completo
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Container>
    </section>
  )
}
