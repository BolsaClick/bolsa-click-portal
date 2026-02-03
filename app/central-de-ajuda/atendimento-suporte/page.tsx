import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <nav className="mb-6 flex items-center gap-2 pt-12 text-sm text-gray-600">
          <Link href="/central-de-ajuda" className="hover:text-bolsa-primary">
            Central de Ajuda
          </Link>
          <span>/</span>
          <span className="text-bolsa-black">Atendimento e Suporte</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-bolsa-black">
          Atendimento e Suporte
        </h1>
        <p className="mb-12 text-lg text-gray-600">
          Estamos aqui para ajudar! Conheça todos os nossos canais de atendimento, horários e como
          resolver as dúvidas mais comuns rapidamente.
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
