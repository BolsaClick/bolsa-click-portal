import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { Headphones } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Atendimento e Suporte | Central de Ajuda Bolsa Click',
  description:
    'Conheça todos os canais de atendimento, horários, como acompanhar sua solicitação e soluções para problemas comuns.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte',
  },
}

const articles = [
  {
    title: 'Como falar com o Bolsa Click?',
    description:
      'Conheça todos os canais de atendimento e qual usar em cada situação.',
    href: '/central-de-ajuda/atendimento-suporte/como-falar',
  },
  {
    title: 'Atendimento via WhatsApp, chat e e-mail',
    description:
      'Como usar cada canal de atendimento e tempo de resposta esperado.',
    href: '/central-de-ajuda/atendimento-suporte/whatsapp-chat-email',
  },
  {
    title: 'Horário de atendimento',
    description:
      'Horários de funcionamento de cada canal e atendimento em feriados.',
    href: '/central-de-ajuda/atendimento-suporte/horarios',
  },
  {
    title: 'Acompanhamento do status da minha bolsa',
    description:
      'Saiba como consultar o andamento da sua solicitação em tempo real.',
    href: '/central-de-ajuda/atendimento-suporte/acompanhamento',
  },
  {
    title: 'Problemas comuns e como resolver',
    description:
      'Soluções rápidas para as dúvidas e problemas mais frequentes.',
    href: '/central-de-ajuda/atendimento-suporte/problemas-comuns',
  },
]

export default function AtendimentoSuportePage() {
  return (
    <>
      <HelpCategoryHero
        title="Atendimento e Suporte"
        description="Estamos aqui para ajudar! Conheça todos os nossos canais de atendimento, horários e como resolver as dúvidas mais comuns rapidamente."
        icon={<Headphones size={28} />}
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
