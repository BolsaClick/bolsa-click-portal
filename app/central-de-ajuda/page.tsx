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
  const totalArticles = categories.reduce((sum, c) => sum + (c.articleCount || 0), 0)

  return (
    <>
      {/* HERO editorial — paper-warm com serif XL */}
      <section className="relative bg-paper-warm overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-bolsa-secondary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-bolsa-primary/10 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20 relative">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ink-300" />
              Central de ajuda · Suporte humano
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-ink-900 leading-[1.05] mb-5">
              Como podemos{' '}
              <span className="italic text-ink-700">te ajudar?</span>
            </h1>
            <p className="text-ink-500 text-base md:text-lg max-w-2xl leading-relaxed">
              Encontre respostas sobre matrícula, bolsas, pagamento, reembolso e tudo o que precisa
              pra começar seu curso com tranquilidade.
            </p>

            {/* Stats inline */}
            <dl className="mt-10 grid grid-cols-3 max-w-2xl w-full divide-x divide-hairline border-y border-hairline">
              <div className="px-4 py-5 text-center">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                  Categorias
                </dt>
                <dd className="font-display num-tabular text-2xl md:text-3xl text-ink-900 mt-1">
                  {String(categories.length).padStart(2, '0')}
                </dd>
              </div>
              <div className="px-4 py-5 text-center">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                  Artigos
                </dt>
                <dd className="font-display num-tabular text-2xl md:text-3xl text-ink-900 mt-1">
                  {totalArticles}+
                </dd>
              </div>
              <div className="px-4 py-5 text-center">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                  Resposta
                </dt>
                <dd className="font-display text-2xl md:text-3xl text-ink-900 mt-1">
                  <span className="text-bolsa-secondary">&lt; 5 min</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-paper py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Categorias
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(categories.length).padStart(2, '0')})
              </span>
            </div>

            <ul className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {categories.map((category) => (
                <li key={category.id} className="h-full">
                  <HelpCategory
                    icon={renderIcon(category.icon)}
                    title={category.title}
                    description={category.description}
                    href={`/central-de-ajuda/${category.slug}`}
                    articleCount={category.articleCount}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <ContactCTA
                title="Não encontrou sua resposta?"
                description="Fale com nossa equipe humana pelo WhatsApp em poucos minutos — sem fila, sem robô."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
