import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'O que é o Bolsa Click? | Central de Ajuda',
  description:
    'Descubra o que é o Bolsa Click e como nossa plataforma conecta estudantes a oportunidades educacionais com descontos de até 100%.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click/o-que-e',
  },
}

export default function OQueEPage() {
  return (
    <ArticleLayout
      category="Sobre o Bolsa Click"
      categoryHref="/central-de-ajuda/sobre-o-bolsa-click"
      title="O que é o Bolsa Click?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          O Bolsa Click é um marketplace educacional que conecta você a milhares de bolsas de
          estudo e descontos em cursos de graduação, pós-graduação e técnicos. Temos parcerias
          diretas com faculdades reconhecidas pelo MEC e oferecemos descontos de até 100% com
          processo simplificado e atendimento humanizado.
        </p>
      </QuickAnswer>

      <h2>Como o Bolsa Click nasceu</h2>
      <p>
        O Bolsa Click foi criado com um propósito claro: democratizar o acesso ao ensino superior
        no Brasil. Percebemos que muitas faculdades tinham vagas disponíveis, mas estudantes não
        conseguiam encontrá-las com facilidade. Ao mesmo tempo, famílias enfrentavam dificuldades
        para pagar mensalidades integrais.
      </p>
      <p>
        Nossa solução foi simples: criar uma plataforma digital que conecta esses dois mundos,
        beneficiando tanto estudantes quanto instituições de ensino.
      </p>

      <h2>O que fazemos</h2>
      <p>O Bolsa Click funciona como uma ponte entre você e as faculdades:</p>
      <ul>
        <li>
          <strong>Negociamos descontos diretos:</strong> Trabalhamos com instituições de ensino
          para garantir condições especiais que você não encontra sozinho
        </li>
        <li>
          <strong>Simplificamos a busca:</strong> Reunimos milhares de cursos em um só lugar, com
          filtros por cidade, modalidade, preço e área de interesse
        </li>
        <li>
          <strong>Acompanhamos sua jornada:</strong> Do momento da busca até o início das aulas,
          nossa equipe está disponível para ajudar
        </li>
        <li>
          <strong>Garantimos transparência:</strong> Sem letras miúdas, sem pegadinhas. Tudo fica
          claro desde o primeiro contato
        </li>
      </ul>

      <h2>Por que somos diferentes</h2>
      <p>
        Diferente de outros intermediários, o Bolsa Click não é apenas um buscador. Somos
        parceiros oficiais das faculdades, o que significa:
      </p>
      <ul>
        <li>Descontos reais e garantidos durante todo o curso</li>
        <li>Processo de matrícula simplificado e sem burocracia</li>
        <li>Atendimento próximo via WhatsApp, chat e telefone</li>
        <li>Acompanhamento personalizado da sua solicitação</li>
      </ul>

      <h2>Para quem é o Bolsa Click</h2>
      <p>Nossa plataforma é para você que:</p>
      <ul>
        <li>Quer começar ou retomar os estudos com economia</li>
        <li>Busca uma graduação, pós-graduação ou curso técnico</li>
        <li>Precisa de flexibilidade (oferecemos cursos EAD, presenciais e semipresenciais)</li>
        <li>Valoriza atendimento humanizado e processo transparente</li>
      </ul>

      <h2>Nossa missão</h2>
      <p>
        Acreditamos que educação é a base para transformar vidas e construir um futuro melhor.
        Nossa missão é tornar o ensino superior acessível para todos os brasileiros,
        independentemente da sua condição financeira.
      </p>
      <p>
        Cada bolsa garantida é um sonho realizado, uma família que investe no futuro, um
        profissional que se qualifica para o mercado.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Entenda como funciona',
            description: 'Veja o passo a passo de como garantir sua bolsa pelo Bolsa Click',
            href: '/central-de-ajuda/sobre-o-bolsa-click/como-funciona',
          },
          {
            title: 'Busque sua bolsa ideal',
            description: 'Explore milhares de cursos e encontre a oportunidade perfeita',
            href: '/cursos',
          },
          {
            title: 'Fale com um especialista',
            description: 'Nossa equipe está pronta para tirar suas dúvidas pelo WhatsApp',
            href: 'https://wa.me/5511999999999',
          },
        ]}
      />
    </ArticleLayout>
  )
}
