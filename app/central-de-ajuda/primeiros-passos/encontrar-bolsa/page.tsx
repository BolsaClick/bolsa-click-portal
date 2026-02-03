import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como encontrar a bolsa ideal? | Central de Ajuda',
  description:
    'Aprenda a usar os filtros e ferramentas do Bolsa Click para encontrar o curso perfeito com o melhor desconto para você.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos/encontrar-bolsa',
  },
}

export default function EncontrarBolsaPage() {
  return (
    <ArticleLayout
      category="Primeiros Passos"
      categoryHref="/central-de-ajuda/primeiros-passos"
      title="Como encontrar a bolsa ideal?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Use os filtros do Bolsa Click para buscar por curso, cidade, modalidade (EAD, presencial
          ou semipresencial), tipo de graduação e faixa de preço. Você pode comparar opções, salvar
          favoritos e solicitar atendimento personalizado para tirar dúvidas antes de decidir.
        </p>
      </QuickAnswer>

      <h2>Como funciona a busca no Bolsa Click</h2>
      <p>
        Nossa plataforma foi desenvolvida para facilitar sua vida. Em vez de visitar sites de
        dezenas de faculdades, você encontra milhares de cursos em um só lugar, com filtros
        inteligentes e informações completas.
      </p>

      <h2>Passo a passo para encontrar sua bolsa</h2>
      <ol>
        <li>
          <strong>Acesse a página de busca:</strong> Clique em Buscar cursos ou Encontre sua bolsa
          na página inicial
        </li>
        <li>
          <strong>Use os filtros principais:</strong>
          <ul>
            <li>
              <strong>Curso ou área:</strong> Digite o nome do curso (ex: Administração, Pedagogia)
              ou escolha uma área de interesse
            </li>
            <li>
              <strong>Cidade:</strong> Selecione onde você quer estudar (ou escolha EAD para estudar
              de qualquer lugar)
            </li>
            <li>
              <strong>Modalidade:</strong> Presencial, EAD (online) ou semipresencial
            </li>
            <li>
              <strong>Tipo de curso:</strong> Graduação, pós-graduação, técnico ou tecnólogo
            </li>
          </ul>
        </li>
        <li>
          <strong>Refine os resultados:</strong> Use filtros adicionais como faixa de preço, turno
          (manhã, tarde, noite) ou instituição específica
        </li>
        <li>
          <strong>Compare as opções:</strong> Veja desconto percentual, valor da mensalidade com
          bolsa, duração do curso e avaliação MEC
        </li>
      </ol>

      <h2>Dicas para escolher a melhor bolsa</h2>
      <ul>
        <li>
          <strong>Verifique o reconhecimento MEC:</strong> Todos os cursos parceiros são de
          instituições autorizadas, mas confira a nota de avaliação
        </li>
        <li>
          <strong>Compare modalidades:</strong> Cursos EAD costumam ter mensalidades menores e maior
          flexibilidade de horários
        </li>
        <li>
          <strong>Considere o custo total:</strong> Além da mensalidade, pense em transporte,
          material didático e tempo disponível
        </li>
        <li>
          <strong>Leia a descrição completa:</strong> Clique no curso para ver grade curricular,
          duração e requisitos
        </li>
        <li>
          <strong>Salve seus favoritos:</strong> Marque os cursos mais interessantes para comparar
          depois com calma
        </li>
      </ul>

      <h2>E se eu tiver dúvidas na hora de escolher?</h2>
      <p>
        Nossa equipe está disponível para ajudar! Você pode entrar em contato via WhatsApp, chat ou
        telefone. Nossos especialistas conhecem as instituições parceiras e podem orientar sobre:
      </p>
      <ul>
        <li>Diferenças entre cursos similares</li>
        <li>Reputação e infraestrutura das faculdades</li>
        <li>Possibilidades de transferência ou aproveitamento de disciplinas</li>
        <li>Formas de pagamento e parcelamento</li>
      </ul>

      <h2>Posso mudar de ideia depois de solicitar?</h2>
      <p>
        Sim! Solicitar uma bolsa não é um compromisso final. Você pode explorar várias opções,
        solicitar informações sobre diferentes cursos e só confirmar a matrícula quando tiver
        certeza da sua escolha.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Comece sua busca agora',
            description: 'Explore milhares de cursos e encontre a oportunidade perfeita',
            href: '/cursos',
          },
          {
            title: 'Entenda os tipos de bolsa',
            description: 'Descubra a diferença entre bolsa parcial e integral',
            href: '/central-de-ajuda/primeiros-passos/bolsa-parcial-integral',
          },
          {
            title: 'Fale com um especialista',
            description: 'Tire dúvidas com nossa equipe pelo WhatsApp',
            href: 'https://wa.me/5511999999999',
          },
        ]}
      />
    </ArticleLayout>
  )
}
