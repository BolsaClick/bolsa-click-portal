import { Metadata } from "next";
import QuemSomosCliente from "./ClienteQuemSomos";

export const metadata: Metadata = {
  title: 'Quem Somos - Bolsa Click | Bolsas de Estudo com até 85% de Desconto',
  description:
    'Conheça o Bolsa Click, a plataforma que conecta alunos a bolsas de estudo de até 85%. Saiba mais sobre nossa missão, valores e como ajudamos milhares de brasileiros a acessarem o ensino superior com qualidade e economia.',
  keywords: [
    'quem somos',
    'sobre o bolsa click',
    'bolsa de estudo',
    'educação acessível',
    'plataforma de bolsas',
    'faculdade com desconto',
    'missão bolsa click',
    'bolsa faculdade',
    'estudar com desconto',
    'bolsa click',
    'bolsa click quem somos',
    'educação superior acessível',
    'faculdade EAD com bolsa',
    'ajuda para estudar',
    'projeto social educação',
    'ensino com propósito',
    'bolsas de graduação',
    'tecnólogo com bolsa',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Quem Somos - Bolsa Click',
    description:
      'A Bolsa Click é uma plataforma que ajuda estudantes a encontrarem bolsas de estudo com até 85% de desconto. Descubra nossa história, propósito e impacto na educação brasileira.',
    url: 'https://www.bolsaclick.com.br/quem-somos',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/assets/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Equipe Bolsa Click - Educação com Propósito',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Quem Somos - Bolsa Click',
    description:
      'Conheça a história e missão do Bolsa Click. Facilitamos o acesso à educação com bolsas de até 85% de desconto.',
    images: ['https://www.bolsaclick.com.br/assets/og-banner.jpg'],
  },
}


export default function QuemSomos() {

  return (
    <QuemSomosCliente />
  );
}