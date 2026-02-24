import type { Metadata } from 'next'
import HeroSection from '../components/organisms/HeroSection'
import Cta from '../components/organisms/Cta'
import Filter from '../components/molecules/Filter'
import { getCurrentTheme } from '../lib/themes'
import ScholarshipCarousel from '../components/molecules/ScolarShipCarousel'
import AboutSection from '../components/molecules/AboutSection'
import HowWork from '../components/organisms/Recommended/HowWork'
import PopularCoursesSection from '../components/organisms/PopularCoursesSection'
import ScholarshipInfoSection from '../components/organisms/ScholarshipInfoSection'
import FaqSection from '../components/organisms/FaqSection'

const theme = getCurrentTheme()

export const metadata: Metadata = {
  title: {
    default: 'Bolsas de Estudo até 95% | 30.000+ Faculdades | 100.000+ Cursos',
    template: `%s | ${theme.shortTitle}`,
  },
  description: 'Encontre bolsa de estudo em mais de 30.000 faculdades com até 95% de desconto. Mais de 100.000 cursos disponíveis: graduação, pós-graduação, técnicos e EAD. Desconto em faculdade garantido. Cadastre-se grátis!',
  keywords: [
    'bolsa de estudo',
    'bolsa de estudos',
    'bolsas de estudo',
    'bolsa de estudo faculdade',
    'bolsa de estudos faculdade',
    'desconto em faculdade',
    'desconto faculdade',
    'bolsa faculdade',
    'faculdade com bolsa',
    'faculdades com bolsa',
    'faculdades com desconto',
    'faculdade com desconto',
    'bolsa para faculdade',
    'bolsa de estudo até 95%',
    '30.000 faculdades',
    '100.000 cursos',
    'bolsa de estudo online',
    'bolsa de estudo EAD',
    'bolsa de estudo presencial',
    'melhor bolsa de estudo',
    'quero bolsa alternativa',
    'melhor que quero bolsa',
    'graduação EAD',
    'educação superior',
    'bolsas ead',
    'bolsas faculdade',
    'faculdade bolsa',
    'bolsa click',
    theme.shortTitle.toLowerCase(),
  ],
  openGraph: {
    title: theme.title,
    description: theme.description,
    url: theme.siteUrl,
    siteName: theme.name,
    images: [
      {
        url: theme.ogImage,
        width: 1200,
        height: 630,
        alt: theme.name,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: theme.twitter,
    title: theme.title,
    description: theme.description,
    images: [theme.ogImage],
  },
  icons: {
    icon: theme.favicon,
    shortcut: theme.favicon,
    apple: theme.favicon,
  },
  robots: 'index, follow',
  // Schema.org removido: já definido em layout.tsx para evitar duplicação
}

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Como funcionam as bolsas de estudo do Bolsa Click?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O Bolsa Click conecta estudantes a bolsas de estudo de até 95% de desconto em mais de 30.000 escolas e faculdades em todo Brasil. Você pode buscar por curso, cidade e modalidade, comparar preços e se cadastrar gratuitamente para garantir sua bolsa."
        }
      },
      {
        "@type": "Question",
        "name": "As bolsas de estudo são realmente gratuitas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O cadastro no Bolsa Click é 100% gratuito. Você não paga nada para buscar e comparar bolsas. Apenas quando você escolhe uma bolsa e se matricula na faculdade é que paga a mensalidade com desconto."
        }
      },
      {
        "@type": "Question",
        "name": "Quais tipos de cursos posso encontrar no Bolsa Click?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No Bolsa Click você encontra bolsas para graduação (bacharelado, licenciatura e tecnólogo), pós-graduação, cursos técnicos, educação básica e idiomas. Todas as modalidades estão disponíveis: presencial, semipresencial e EAD (ensino a distância)."
        }
      },
      {
        "@type": "Question",
        "name": "Como posso garantir minha bolsa de estudo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "É muito simples! Basta buscar o curso desejado, escolher a bolsa que mais se adequa ao seu perfil, clicar em 'Quero essa bolsa' e preencher o cadastro. Após isso, você será direcionado para finalizar a matrícula na faculdade escolhida."
        }
      },
      {
        "@type": "Question",
        "name": "As bolsas são válidas para todo o Brasil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O Bolsa Click oferece bolsas em mais de 30.000 escolas e faculdades em todas as regiões do Brasil. Você pode buscar por cidade e estado para encontrar as melhores ofertas na sua região."
        }
      },
      {
        "@type": "Question",
        "name": "Posso usar a bolsa junto com outros descontos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As condições variam conforme a faculdade e o tipo de bolsa. Recomendamos verificar as condições específicas de cada oferta antes de se cadastrar. Algumas bolsas podem ser combinadas com outros descontos, outras não."
        }
      },
      {
        "@type": "Question",
        "name": "Preciso da nota do ENEM para conseguir bolsa de estudo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não! No Bolsa Click, você não precisa de nota do ENEM para conseguir sua bolsa de estudo. Basta se cadastrar, escolher o curso e garantir seu desconto."
        }
      },
      {
        "@type": "Question",
        "name": "Existem bolsas EAD disponíveis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! O Bolsa Click oferece milhares de bolsas EAD com descontos de até 80%. Os cursos a distância possuem diploma reconhecido pelo MEC, igual ao presencial. Estude de casa, no seu ritmo."
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSection />
      <Filter />
      <Cta />
      <ScholarshipCarousel />
      <PopularCoursesSection />
      <ScholarshipInfoSection />
      <AboutSection />
      <HowWork />
      <FaqSection />
    </>
  )
}
