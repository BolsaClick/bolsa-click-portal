import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { Percent } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bolsas, Descontos e Regras | Central de Ajuda Bolsa Click',
  description:
    'Entenda como funcionam as bolsas, validade, cumulatividade com ENEM e FIES, exigências e como identificar seu desconto no boleto.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras',
  },
}

const articles = [
  {
    title: 'Por quanto tempo a bolsa é válida?',
    description:
      'Saiba por quanto tempo sua bolsa permanece ativa e quais condições garantem o desconto.',
    href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
  },
  {
    title: 'A bolsa pode mudar de valor?',
    description:
      'Entenda se o percentual da sua bolsa pode ser alterado e como funcionam os reajustes.',
    href: '/central-de-ajuda/bolsas-descontos-regras/bolsa-pode-mudar',
  },
  {
    title: 'Existe exigência de nota, presença ou desempenho?',
    description:
      'Descubra se há requisitos acadêmicos para manter sua bolsa de estudo.',
    href: '/central-de-ajuda/bolsas-descontos-regras/exigencias',
  },
  {
    title: 'Bolsa é cumulativa com ENEM, PROUNI ou FIES?',
    description:
      'Saiba se você pode combinar a bolsa do Bolsa Click com outros programas educacionais.',
    href: '/central-de-ajuda/bolsas-descontos-regras/cumulativa',
  },
  {
    title: 'O desconto aparece em qual boleto?',
    description:
      'Entenda a partir de quando o desconto é aplicado e como identificá-lo no boleto.',
    href: '/central-de-ajuda/bolsas-descontos-regras/desconto-boleto',
  },
]

export default function BolsasDescontosRegrasPage() {
  return (
    <>
      <HelpCategoryHero
        title="Bolsas, Descontos e Regras"
        description="Tire todas as suas dúvidas sobre como funcionam as bolsas, validade, alterações de valor, cumulatividade com outros programas e como identificar seu desconto."
        icon={<Percent size={28} />}
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
