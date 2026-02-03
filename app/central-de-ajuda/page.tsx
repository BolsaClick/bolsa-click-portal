import { Metadata } from 'next'
import { HelpCategory } from '@/app/components/help/HelpCategory'

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
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Sobre o Bolsa Click',
    description: 'Entenda como funciona nossa plataforma e como conseguimos os melhores descontos',
    href: '/central-de-ajuda/sobre-o-bolsa-click',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: 'Primeiros Passos',
    description: 'Aprenda a criar sua conta, buscar e garantir a bolsa ideal para você',
    href: '/central-de-ajuda/primeiros-passos',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Bolsas, Descontos e Regras',
    description: 'Saiba tudo sobre validade, requisitos e como seu desconto é aplicado',
    href: '/central-de-ajuda/bolsas-descontos-regras',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    title: 'Pagamento, Taxas e Reembolso',
    description: 'Entenda custos, formas de pagamento e políticas de cancelamento',
    href: '/central-de-ajuda/pagamento-taxas-reembolso',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    title: 'Matrícula e Faculdade',
    description: 'Processo de matrícula, documentos necessários e início das aulas',
    href: '/central-de-ajuda/matricula-faculdade',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    title: 'Atendimento e Suporte',
    description: 'Canais de contato, horários e como acompanhar sua solicitação',
    href: '/central-de-ajuda/atendimento-suporte',
    articleCount: 5,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: 'Segurança, Dados e Privacidade',
    description: 'Como protegemos suas informações e nossa política de privacidade',
    href: '/central-de-ajuda/seguranca-dados-privacidade',
    articleCount: 4,
  },
]

export default function CentralDeAjudaPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-bolsa-primary to-blue-900 pt-24 pb-14 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Central de Ajuda</h1>
          <p className="text-lg text-white/90">
            Tire suas dúvidas e encontre todas as informações que precisa sobre o Bolsa Click
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-screen bg-gray-50">
        {/* Categories Grid */}
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {categories.map((category, index) => (
              <HelpCategory key={index} {...category} />
            ))}
          </div>

          {/* Quick Contact */}
          <div className="mt-10 rounded-xl bg-white p-6 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-[var(--bolsa-black)]">
              Não encontrou o que procurava?
            </h2>
            <p className="mb-5 text-gray-600">
              Fale diretamente com nossa equipe pelo WhatsApp ou envie uma mensagem
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://wa.me/5511936200198"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-all hover:bg-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Falar no WhatsApp
              </a>
              <a
                href="/contato"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--bolsa-primary)] bg-white px-6 py-3 font-semibold text-[var(--bolsa-primary)] transition-all hover:bg-[var(--bolsa-primary)] hover:text-white"
              >
                Enviar mensagem
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
