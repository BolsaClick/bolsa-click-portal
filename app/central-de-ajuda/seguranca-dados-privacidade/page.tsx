import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Segurança, Dados e Privacidade | Central de Ajuda Bolsa Click',
  description:
    'Saiba como protegemos seus dados, nossa conformidade com a LGPD, uso de informações pessoais e como identificar comunicação oficial.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade',
  },
}

const articles = [
  {
    title: 'Como o Bolsa Click protege meus dados?',
    description:
      'Conheça as tecnologias e práticas de segurança que usamos para proteger suas informações.',
    href: '/central-de-ajuda/seguranca-dados-privacidade/protecao-dados',
  },
  {
    title: 'Uso de informações pessoais',
    description:
      'Entenda como e por que utilizamos seus dados e com quem compartilhamos.',
    href: '/central-de-ajuda/seguranca-dados-privacidade/uso-informacoes',
  },
  {
    title: 'LGPD e transparência',
    description:
      'Seus direitos sob a LGPD e nosso compromisso com a transparência total.',
    href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
  },
  {
    title: 'Comunicação oficial do Bolsa Click',
    description:
      'Aprenda a identificar mensagens legítimas e se proteger contra golpes.',
    href: '/central-de-ajuda/seguranca-dados-privacidade/comunicacao-oficial',
  },
]

export default function SegurancaDadosPrivacidadePage() {
  return (
    <>
      <HelpCategoryHero
        title="Segurança, Dados e Privacidade"
        description="Sua privacidade é nossa prioridade. Entenda como protegemos seus dados, nossa conformidade com a LGPD e como exercer seus direitos."
        icon={<Shield size={28} />}
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
