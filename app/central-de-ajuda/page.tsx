import { Metadata } from 'next'
import { HelpCategory } from '@/app/components/help/HelpCategory'
import { ContactCTA } from '@/app/components/help/ContactCTA'
import { Info, BookOpen, Percent, CreditCard, GraduationCap, Headphones, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Central de Ajuda | Bolsa Click - Tire suas dúvidas sobre bolsas de estudo',
  description:
    'Encontre respostas sobre como funcionam as bolsas de estudo, matrícula, pagamento, reembolso e muito mais. Atendimento humanizado para você realizar seu sonho de estudar.',
  keywords: [
    'ajuda bolsa de estudo',
    'como funciona bolsa click',
    'dúvidas matrícula faculdade',
    'suporte educacional',
    'atendimento bolsa de estudo',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda',
  },
  openGraph: {
    title: 'Central de Ajuda | Bolsa Click',
    description:
      'Tire suas dúvidas sobre bolsas de estudo, matrícula, pagamento e muito mais',
    url: 'https://www.bolsaclick.com.br/central-de-ajuda',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

const categories = [
  {
    icon: <Info size={24} />,
    title: 'Sobre o Bolsa Click',
    description: 'Entenda como funciona nossa plataforma e como conseguimos os melhores descontos',
    href: '/central-de-ajuda/sobre-o-bolsa-click',
    articleCount: 5,
  },
  {
    icon: <BookOpen size={24} />,
    title: 'Primeiros Passos',
    description: 'Aprenda a criar sua conta, buscar e garantir a bolsa ideal para você',
    href: '/central-de-ajuda/primeiros-passos',
    articleCount: 5,
  },
  {
    icon: <Percent size={24} />,
    title: 'Bolsas, Descontos e Regras',
    description: 'Saiba tudo sobre validade, requisitos e como seu desconto é aplicado',
    href: '/central-de-ajuda/bolsas-descontos-regras',
    articleCount: 5,
  },
  {
    icon: <CreditCard size={24} />,
    title: 'Pagamento, Taxas e Reembolso',
    description: 'Entenda custos, formas de pagamento e políticas de cancelamento',
    href: '/central-de-ajuda/pagamento-taxas-reembolso',
    articleCount: 5,
  },
  {
    icon: <GraduationCap size={24} />,
    title: 'Matrícula e Faculdade',
    description: 'Processo de matrícula, documentos necessários e início das aulas',
    href: '/central-de-ajuda/matricula-faculdade',
    articleCount: 5,
  },
  {
    icon: <Headphones size={24} />,
    title: 'Atendimento e Suporte',
    description: 'Canais de contato, horários e como acompanhar sua solicitação',
    href: '/central-de-ajuda/atendimento-suporte',
    articleCount: 5,
  },
  {
    icon: <Shield size={24} />,
    title: 'Segurança, Dados e Privacidade',
    description: 'Como protegemos suas informações e nossa política de privacidade',
    href: '/central-de-ajuda/seguranca-dados-privacidade',
    articleCount: 7,
  },
]

export default function CentralDeAjudaPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-bolsa-primary via-blue-800 to-blue-900 pt-32 pb-16 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="mx-auto max-w-5xl px-4 relative z-10">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-4">
            Suporte 24/7
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Central de Ajuda</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Tire suas dúvidas e encontre todas as informações que precisa sobre o Bolsa Click.
            Estamos aqui para ajudar você a realizar o sonho de estudar.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-screen bg-gray-50">
        {/* Categories Grid */}
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-5 sm:grid-cols-2">
            {categories.map((category, index) => (
              <HelpCategory key={index} {...category} />
            ))}
          </div>

          {/* Quick Contact */}
          <ContactCTA
            title="Não encontrou o que procurava?"
            description="Fale diretamente com nossa equipe pelo WhatsApp ou envie uma mensagem"
            className="mt-12"
          />
        </div>
      </div>
    </>
  )
}
