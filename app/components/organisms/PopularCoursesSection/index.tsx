import Link from 'next/link'
import Container from '../../atoms/Container'

const cursosPopulares = [
  { nome: 'Administração', slug: 'administracao', desc: 'Bolsa de até 80%' },
  { nome: 'Direito', slug: 'direito', desc: 'Bolsa de até 75%' },
  { nome: 'Enfermagem', slug: 'enfermagem', desc: 'Bolsa de até 70%' },
  { nome: 'Psicologia', slug: 'psicologia', desc: 'Bolsa de até 80%' },
  { nome: 'Pedagogia', slug: 'pedagogia', desc: 'Bolsa de até 80%' },
  { nome: 'Educação Física', slug: 'educacao-fisica', desc: 'Bolsa de até 75%' },
  { nome: 'Ciências Contábeis', slug: 'ciencias-contabeis', desc: 'Bolsa de até 80%' },
  { nome: 'Engenharia Civil', slug: 'engenharia-civil', desc: 'Bolsa de até 70%' },
  { nome: 'Nutrição', slug: 'nutricao', desc: 'Bolsa de até 75%' },
  { nome: 'Fisioterapia', slug: 'fisioterapia', desc: 'Bolsa de até 70%' },
  { nome: 'ADS', slug: 'analise-e-desenvolvimento-de-sistemas', desc: 'Bolsa de até 80%' },
  { nome: 'Biomedicina', slug: 'biomedicina', desc: 'Bolsa de até 70%' },
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
    <section className="bg-white py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-3">
            Bolsas de Estudo nas Melhores Faculdades do Brasil
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Compare preços e encontre bolsas de estudo de até 95% de desconto em graduação, pós-graduação e cursos tecnólogos.
          </p>
        </div>

        {/* Cursos Populares */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-blue-950 mb-5">
            Cursos de Graduação com Bolsa de Estudo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cursosPopulares.map((curso) => (
              <Link
                key={curso.slug}
                href={`/cursos/${curso.slug}`}
                className="group flex flex-col items-center rounded-lg border border-neutral-200 p-4 hover:border-bolsa-primary hover:shadow-md transition-all text-center"
              >
                <span className="text-sm font-medium text-blue-950 group-hover:text-bolsa-primary transition-colors">
                  {curso.nome}
                </span>
                <span className="text-xs text-neutral-500 mt-1">{curso.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Cidades */}
        <div>
          <h3 className="text-lg font-semibold text-blue-950 mb-5">
            Bolsas de Estudo por Cidade
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cidadesPopulares.map((cidade) => (
              <Link
                key={cidade.nome}
                href={`/curso/resultado?cidade=${encodeURIComponent(cidade.nome)}&estado=${cidade.estado}&nivel=GRADUACAO`}
                className="group flex flex-col items-center rounded-lg border border-neutral-200 p-4 hover:border-bolsa-primary hover:shadow-md transition-all text-center"
              >
                <span className="text-sm font-medium text-blue-950 group-hover:text-bolsa-primary transition-colors">
                  {cidade.nome}
                </span>
                <span className="text-xs text-neutral-500 mt-1">{cidade.estado}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/cursos"
            className="inline-flex items-center px-6 py-3 bg-bolsa-primary text-white font-medium rounded-lg hover:bg-bolsa-primary/90 transition-colors"
          >
            Ver todos os cursos com bolsa
          </Link>
        </div>
      </Container>
    </section>
  )
}
