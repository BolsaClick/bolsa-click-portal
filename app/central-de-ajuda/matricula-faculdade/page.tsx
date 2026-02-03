import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Matrícula e Faculdade | Central de Ajuda Bolsa Click',
  description:
    'Guia completo sobre o processo de matrícula, documentos necessários, matrícula online vs presencial e quando você começa a estudar.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade',
  },
}

const articles = [
  {
    title: 'Como faço minha matrícula na faculdade?',
    description:
      'Passo a passo completo do processo de matrícula após garantir sua bolsa.',
    href: '/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
  },
  {
    title: 'Documentos necessários',
    description:
      'Lista completa de documentos para matrícula e como enviá-los de forma segura.',
    href: '/central-de-ajuda/matricula-faculdade/documentos',
  },
  {
    title: 'Matrícula online vs presencial',
    description:
      'Entenda as diferenças entre os dois formatos e qual escolher para sua situação.',
    href: '/central-de-ajuda/matricula-faculdade/online-presencial',
  },
  {
    title: 'Quando começo a estudar?',
    description:
      'Saiba quando começam as aulas e como funciona o calendário acadêmico.',
    href: '/central-de-ajuda/matricula-faculdade/quando-comeco',
  },
  {
    title: 'Posso trocar de curso, turno ou faculdade?',
    description:
      'Descubra as possibilidades de mudança e impacto na sua bolsa de estudo.',
    href: '/central-de-ajuda/matricula-faculdade/trocar-curso',
  },
]

export default function MatriculaFaculdadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-lg px-4 py-12">
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/central-de-ajuda" className="hover:text-[var(--bolsa-primary)]">
            Central de Ajuda
          </Link>
          <span>/</span>
          <span className="text-[var(--bolsa-black)]">Matrícula e Faculdade</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-[var(--bolsa-black)]">
          Matrícula e Faculdade
        </h1>
        <p className="mb-12 text-lg text-gray-600">
          Tudo sobre o processo de matrícula na instituição de ensino, documentação necessária,
          formatos de matrícula e possibilidades de mudança após o início.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article, index) => (
            <HelpArticleCard key={index} {...article} />
          ))}
        </div>
      </div>
    </div>
  )
}
