import { Metadata } from 'next'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-lg px-4 py-12">
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/central-de-ajuda" className="hover:text-[var(--bolsa-primary)]">
            Central de Ajuda
          </Link>
          <span>/</span>
          <span className="text-[var(--bolsa-black)]">Segurança, Dados e Privacidade</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-[var(--bolsa-black)]">
          Segurança, Dados e Privacidade
        </h1>
        <p className="mb-12 text-lg text-gray-600">
          Sua privacidade é nossa prioridade. Entenda como protegemos seus dados, nossa
          conformidade com a LGPD e como exercer seus direitos.
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
