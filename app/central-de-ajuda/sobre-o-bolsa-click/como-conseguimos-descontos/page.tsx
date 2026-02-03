import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como conseguimos descontos de até 100%? | Central de Ajuda',
  description:
    'Descubra como o Bolsa Click consegue oferecer descontos de até 100% através de parcerias diretas com instituições de ensino.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click/como-conseguimos-descontos',
  },
}

export default function ComoConseguimosDescontosPage() {
  return (
    <ArticleLayout
      category="Sobre o Bolsa Click"
      categoryHref="/central-de-ajuda/sobre-o-bolsa-click"
      title="Como conseguimos descontos de até 100%?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Conseguimos esses descontos através de parcerias oficiais e diretas com faculdades
          reconhecidas pelo MEC. As instituições têm interesse em preencher vagas ociosas e
          preferem ter alunos com desconto do que deixar turmas vazias. Negociamos condições
          especiais em grande escala, garantindo benefícios reais e sustentáveis para você.
        </p>
      </QuickAnswer>

      <h2>O modelo de negócio que beneficia todos</h2>
      <p>
        O segredo está em entender que educação funciona melhor quando há ganho mútuo. Veja como
        funciona:
      </p>
      <ul>
        <li>
          <strong>Faculdades têm vagas disponíveis:</strong> Muitas instituições possuem turmas
          com lugares não preenchidos, especialmente em determinados turnos ou modalidades
        </li>
        <li>
          <strong>Custos fixos existem independentemente:</strong> Professores, estrutura e
          material didático são custos que a faculdade já tem, com ou sem você na sala
        </li>
        <li>
          <strong>É melhor ter aluno com desconto do que vaga vazia:</strong> Financeiramente, faz
          mais sentido oferecer condições especiais do que deixar a vaga ociosa
        </li>
      </ul>
      <p>
        Ao negociar em grande escala, conseguimos descontos que você não teria acesso negociando
        sozinho com a faculdade.
      </p>

      <h2>Como funcionam as parcerias</h2>
      <p>Nossas parcerias são oficiais e transparentes:</p>
      <ul>
        <li>
          <strong>Contratos formais:</strong> Temos acordos diretos com cada instituição de ensino
        </li>
        <li>
          <strong>Condições pré-negociadas:</strong> Valores e descontos são definidos previamente
        </li>
        <li>
          <strong>Vagas exclusivas:</strong> Muitas ofertas estão disponíveis apenas pelo Bolsa
          Click
        </li>
        <li>
          <strong>Garantia de validade:</strong> O desconto é mantido durante todo o curso,
          conforme contrato
        </li>
      </ul>

      <h2>Por que as faculdades aceitam esse modelo</h2>
      <p>As instituições de ensino se beneficiam porque:</p>
      <ul>
        <li>
          <strong>Reduzem custo de marketing:</strong> Em vez de investir em propaganda, usam esse
          valor para oferecer descontos
        </li>
        <li>
          <strong>Preenchem turmas mais rápido:</strong> Nossa plataforma conecta estudantes às
          vagas com agilidade
        </li>
        <li>
          <strong>Mantêm qualidade:</strong> Estudantes motivados e engajados contribuem para o
          ambiente acadêmico
        </li>
        <li>
          <strong>Fidelizam alunos:</strong> Descontos justos criam relações duradouras
        </li>
      </ul>

      <h2>Descontos de 100% são reais?</h2>
      <p>
        Sim, mas existem algumas nuances importantes de entender:
      </p>
      <ul>
        <li>
          <strong>100% de desconto na mensalidade:</strong> Significa que você não paga mensalidade
          do curso, mas pode haver taxas administrativas ou de material
        </li>
        <li>
          <strong>Condições específicas:</strong> Geralmente aplicam-se a cursos EAD ou
          semipresenciais, onde o custo operacional é menor
        </li>
        <li>
          <strong>Vagas limitadas:</strong> Descontos maiores costumam ter número restrito de vagas
        </li>
        <li>
          <strong>Transparência total:</strong> Sempre deixamos claro o que está incluso e o que
          não está
        </li>
      </ul>

      <h2>Como sabemos que o desconto é real?</h2>
      <p>Você pode ter certeza porque:</p>
      <ul>
        <li>
          Mostramos o valor integral do curso e o valor com desconto lado a lado
        </li>
        <li>
          O contrato de matrícula da faculdade confirma o valor final que você vai pagar
        </li>
        <li>
          O desconto aparece aplicado em todas as mensalidades, não apenas na primeira
        </li>
        <li>
          Temos milhares de alunos estudando com descontos garantidos pelo Bolsa Click
        </li>
      </ul>

      <h2>E se a faculdade tentar cobrar o valor integral?</h2>
      <p>
        Isso não acontece porque sua bolsa é garantida por contrato. Mas, caso ocorra alguma
        inconsistência:
      </p>
      <ul>
        <li>Entre em contato imediatamente com nossa equipe</li>
        <li>Apresente o comprovante de garantia da bolsa que você recebeu</li>
        <li>Intermediamos a solução diretamente com a faculdade</li>
        <li>Seu desconto será aplicado retroativamente, se necessário</li>
      </ul>

      <h2>Outros benefícios além do desconto</h2>
      <p>Além de economia, você ganha:</p>
      <ul>
        <li>
          <strong>Processo simplificado:</strong> Menos burocracia na hora da matrícula
        </li>
        <li>
          <strong>Atendimento dedicado:</strong> Equipe disponível para esclarecer dúvidas
        </li>
        <li>
          <strong>Segurança:</strong> Plataforma confiável com milhares de alunos matriculados
        </li>
        <li>
          <strong>Variedade:</strong> Acesso a múltiplas faculdades e cursos em um só lugar
        </li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Veja nossas faculdades parceiras',
            description: 'Conheça as instituições reconhecidas pelo MEC que temos parceria',
            href: '/central-de-ajuda/sobre-o-bolsa-click/faculdades-parceiras',
          },
          {
            title: 'Explore cursos com desconto',
            description: 'Busque agora e veja os descontos disponíveis para você',
            href: '/cursos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
