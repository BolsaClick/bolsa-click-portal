import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { CreditCard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pagamento, Taxas e Reembolso | Central de Ajuda Bolsa Click',
  description:
    'Entenda todas as taxas envolvidas, como funciona o pagamento da pré-matrícula, reembolsos, devoluções e cancelamentos.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso',
  },
}

const articles = [
  {
    title: 'Preciso pagar alguma taxa ao Bolsa Click?',
    description:
      'Saiba quais taxas são cobradas e o que está incluso no serviço do Bolsa Click.',
    href: '/central-de-ajuda/pagamento-taxas-reembolso/taxas',
  },
  {
    title: 'Como funciona o pagamento da pré-matrícula?',
    description:
      'Entenda o que é a pré-matrícula, valor, formas de pagamento e para onde vai esse valor.',
    href: '/central-de-ajuda/pagamento-taxas-reembolso/pre-matricula',
  },
  {
    title: 'Em quais casos tenho direito a reembolso?',
    description:
      'Conheça as situações em que você pode solicitar reembolso da pré-matrícula.',
    href: '/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
  },
  {
    title: 'Prazos e forma de devolução',
    description:
      'Saiba quanto tempo leva para receber seu reembolso e como é feita a devolução.',
    href: '/central-de-ajuda/pagamento-taxas-reembolso/prazos-devolucao',
  },
  {
    title: 'Cancelamento e desistência',
    description:
      'Entenda como funciona o cancelamento antes e após a matrícula e a política de reembolso.',
    href: '/central-de-ajuda/pagamento-taxas-reembolso/cancelamento',
  },
]

export default function PagamentoTaxasReembolsoPage() {
  return (
    <>
      <HelpCategoryHero
        title="Pagamento, Taxas e Reembolso"
        description="Transparência total sobre custos, formas de pagamento, política de reembolso e tudo que envolve a parte financeira do processo."
        icon={<CreditCard size={28} />}
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
