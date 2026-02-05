import { Metadata } from 'next'
import { HelpCategory } from '@/app/components/help/HelpCategory'
import { ContactCTA } from '@/app/components/help/ContactCTA'
import { getHelpCategories } from './_lib/data'
import { renderIcon } from './_lib/icons'

export const revalidate = 3600 // Revalidar a cada 1 hora

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

export default async function CentralDeAjudaPage() {
  const categories = await getHelpCategories()

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
            {categories.map((category) => (
              <HelpCategory
                key={category.id}
                icon={renderIcon(category.icon)}
                title={category.title}
                description={category.description}
                href={`/central-de-ajuda/${category.slug}`}
                articleCount={category.articleCount}
              />
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
