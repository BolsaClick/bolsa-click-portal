import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { Rocket } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Primeiros Passos | Central de Ajuda Bolsa Click',
  description:
    'Aprenda a criar sua conta, buscar e garantir a bolsa ideal. Guia completo para começar sua jornada educacional no Bolsa Click.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos',
  },
}

const articles = [
  {
    title: 'Como criar uma conta no Bolsa Click?',
    description:
      'Passo a passo simples para criar sua conta e começar a buscar bolsas de estudo.',
    href: '/central-de-ajuda/primeiros-passos/criar-conta',
  },
  {
    title: 'Como encontrar a bolsa ideal?',
    description:
      'Dicas e filtros para você encontrar o curso perfeito com o melhor desconto.',
    href: '/central-de-ajuda/primeiros-passos/encontrar-bolsa',
  },
  {
    title: 'Diferença entre bolsa parcial e integral',
    description:
      'Entenda o que significa cada tipo de bolsa e qual faz mais sentido para você.',
    href: '/central-de-ajuda/primeiros-passos/bolsa-parcial-integral',
  },
  {
    title: 'O que acontece depois de garantir a bolsa?',
    description:
      'Saiba quais são os próximos passos após garantir sua bolsa de estudo.',
    href: '/central-de-ajuda/primeiros-passos/depois-de-garantir',
  },
  {
    title: 'Não encontrei a bolsa que quero — o que fazer?',
    description:
      'Descubra outras formas de encontrar o curso ideal ou receber alertas de novas vagas.',
    href: '/central-de-ajuda/primeiros-passos/nao-encontrei-bolsa',
  },
]

export default function PrimeirosPassosPage() {
  return (
    <>
      <HelpCategoryHero
        title="Primeiros Passos"
        description="Tudo o que você precisa saber para começar sua jornada no Bolsa Click, desde a criação da conta até garantir a bolsa perfeita para você."
        icon={<Rocket size={28} />}
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
