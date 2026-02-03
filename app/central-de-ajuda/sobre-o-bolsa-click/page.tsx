import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre o Bolsa Click | Central de Ajuda',
  description:
    'Entenda como funciona o Bolsa Click, como conseguimos os melhores descontos e por que somos referência em bolsas de estudo.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click',
  },
}

const articles = [
  {
    title: 'O que é o Bolsa Click?',
    description:
      'Descubra o que é o Bolsa Click e como nossa plataforma conecta você às melhores oportunidades educacionais.',
    href: '/central-de-ajuda/sobre-o-bolsa-click/o-que-e',
  },
  {
    title: 'Como o Bolsa Click funciona?',
    description:
      'Passo a passo de como nossa plataforma funciona, desde a busca até o início das aulas.',
    href: '/central-de-ajuda/sobre-o-bolsa-click/como-funciona',
  },
  {
    title: 'Como conseguimos descontos de até 100%?',
    description:
      'Entenda nossa parceria com instituições de ensino e como garantimos os melhores descontos para você.',
    href: '/central-de-ajuda/sobre-o-bolsa-click/como-conseguimos-descontos',
  },
  {
    title: 'O Bolsa Click é confiável?',
    description:
      'Saiba por que milhares de estudantes confiam no Bolsa Click para realizar o sonho de estudar.',
    href: '/central-de-ajuda/sobre-o-bolsa-click/e-confiavel',
  },
  {
    title: 'Faculdades parceiras e reconhecimento MEC',
    description:
      'Conheça nossas faculdades parceiras e a importância do reconhecimento do MEC para seu diploma.',
    href: '/central-de-ajuda/sobre-o-bolsa-click/faculdades-parceiras',
  },
]

export default function SobreOBolsaClickPage() {
  return (
    <>
      <HelpCategoryHero
        title="Sobre o Bolsa Click"
        description="Entenda como funciona nossa plataforma e como ajudamos milhares de estudantes a realizarem o sonho de estudar com descontos de até 100%."
        icon={<Info size={28} />}
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
