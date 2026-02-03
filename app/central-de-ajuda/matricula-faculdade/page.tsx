import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { GraduationCap } from 'lucide-react'

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
    <>
      <HelpCategoryHero
        title="Matrícula e Faculdade"
        description="Tudo sobre o processo de matrícula na instituição de ensino, documentação necessária, formatos de matrícula e possibilidades de mudança após o início."
        icon={<GraduationCap size={28} />}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((article, index) => (
              <HelpArticleCard key={index} {...article} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
