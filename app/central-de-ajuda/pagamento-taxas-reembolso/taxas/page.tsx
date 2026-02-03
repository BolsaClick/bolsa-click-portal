import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Preciso pagar alguma taxa ao Bolsa Click? | Central de Ajuda',
  description:
    'Entenda quais taxas são cobradas pelo Bolsa Click, o valor da pré-matrícula e nossa política de transparência total.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso/taxas',
  },
}

export default function TaxasPage() {
  return (
    <ArticleLayout
      category="Pagamento, Taxas e Reembolso"
      categoryHref="/central-de-ajuda/pagamento-taxas-reembolso"
      title="Preciso pagar alguma taxa ao Bolsa Click?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Sim, apenas uma taxa simbólica de pré-matrícula (geralmente entre R$ 50 e R$ 150) para
          reservar sua vaga e bolsa. Não cobramos mensalidades adicionais, taxas ocultas ou qualquer
          outro valor além da pré-matrícula. Você paga diretamente para a faculdade com o desconto já
          aplicado.
        </p>
      </QuickAnswer>

      <h2>O que você paga ao Bolsa Click</h2>
      <p>
        Ao garantir uma bolsa conosco, você paga uma única taxa de pré-matrícula. Esse valor é
        cobrado uma vez e serve para:
      </p>
      <ul>
        <li>
          <strong>Reservar sua vaga:</strong> Garantir que a bolsa e a vaga no curso fiquem reservadas
          para você
        </li>
        <li>
          <strong>Processar sua inscrição:</strong> Cobrir os custos operacionais de análise e
          processamento
        </li>
        <li>
          <strong>Acompanhamento personalizado:</strong> Nossa equipe fica disponível para orientar
          todo o processo
        </li>
        <li>
          <strong>Intermediação com a faculdade:</strong> Facilitamos toda comunicação entre você e a
          instituição
        </li>
      </ul>

      <h2>Quanto custa a pré-matrícula</h2>
      <p>
        O valor varia conforme o curso e a instituição, mas geralmente fica entre R$ 50 e R$ 150. Esse
        valor é sempre informado de forma clara antes de você concluir a reserva.
      </p>
      <p>
        Em alguns casos especiais, cursos de alta demanda ou instituições premium podem ter valores
        diferentes. Mas tudo é mostrado com antecedência, sem surpresas.
      </p>

      <h2>O que NÃO cobramos</h2>
      <p>Para deixar absolutamente claro, o Bolsa Click não cobra:</p>
      <ul>
        <li>
          <strong>Mensalidades adicionais:</strong> Você paga apenas a mensalidade da faculdade (já
          com desconto)
        </li>
        <li>
          <strong>Taxa de manutenção da bolsa:</strong> Seu desconto não tem custo mensal ou anual
        </li>
        <li>
          <strong>Comissão sobre pagamentos:</strong> Não cobramos porcentagem das suas mensalidades
        </li>
        <li>
          <strong>Taxa de matrícula:</strong> A matrícula é paga diretamente para a faculdade
        </li>
        <li>
          <strong>Taxas ocultas ou surpresa:</strong> Tudo que você paga é informado antes
        </li>
      </ul>

      <h2>Para onde vai a taxa de pré-matrícula</h2>
      <p>
        A pré-matrícula cobre os custos operacionais do Bolsa Click, incluindo:
      </p>
      <ul>
        <li>Manutenção da plataforma online</li>
        <li>Equipe de atendimento humanizado</li>
        <li>Processamento de inscrições e documentos</li>
        <li>Intermediação com as faculdades parceiras</li>
        <li>Suporte durante todo o processo de matrícula</li>
      </ul>
      <p>
        É graças a esse modelo que conseguimos oferecer atendimento de qualidade, sem cobrar
        mensalidades ou taxas recorrentes de você.
      </p>

      <h2>Como funciona o pagamento das mensalidades</h2>
      <p>
        Após a matrícula, você paga suas mensalidades diretamente para a faculdade, sem qualquer
        intermediação do Bolsa Click. O valor já vem com o desconto aplicado.
      </p>
      <p>Exemplo prático:</p>
      <ul>
        <li>Você garante uma bolsa de 70% pelo Bolsa Click</li>
        <li>Paga a pré-matrícula (valor simbólico) para o Bolsa Click</li>
        <li>Faz a matrícula na faculdade (pode ter taxa de matrícula da própria instituição)</li>
        <li>
          A partir daí, paga mensalidades diretamente para a faculdade com 70% de desconto
        </li>
        <li>O Bolsa Click não recebe nada mais além da pré-matrícula inicial</li>
      </ul>

      <h2>Comparação com outros serviços</h2>
      <p>
        Alguns serviços de intermediação educacional cobram mensalidades adicionais ou taxas
        recorrentes. O Bolsa Click não funciona assim. Nosso modelo é:
      </p>
      <ul>
        <li>Uma taxa única de pré-matrícula</li>
        <li>Transparência total de valores</li>
        <li>Sem custos escondidos ou surpresas</li>
      </ul>

      <h2>Valores da faculdade (além da mensalidade)</h2>
      <p>
        Atenção: além das mensalidades, a faculdade pode cobrar outros valores que não passam pelo
        Bolsa Click:
      </p>
      <ul>
        <li>Taxa de matrícula (cobrada pela instituição, não por nós)</li>
        <li>Material didático (varia por curso)</li>
        <li>Provas e avaliações especiais</li>
        <li>Certificados e documentos</li>
      </ul>
      <p>
        Esses valores são de responsabilidade da instituição de ensino. Sempre que possível,
        informamos previamente sobre custos adicionais do curso escolhido.
      </p>

      <h2>Transparência é nossa prioridade</h2>
      <p>
        Acreditamos que educação deve ser acessível e transparente. Por isso:
      </p>
      <ul>
        <li>Todos os valores são informados antes de você se comprometer</li>
        <li>Não trabalhamos com letras miúdas ou pegadinhas</li>
        <li>Nossa equipe está disponível para esclarecer qualquer dúvida sobre custos</li>
        <li>
          Você tem direito a reembolso em situações específicas (veja nosso artigo sobre reembolso)
        </li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Como funciona a pré-matrícula',
            description: 'Entenda o processo e formas de pagamento',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/pre-matricula',
          },
          {
            title: 'Direito a reembolso',
            description: 'Saiba em quais casos você pode solicitar devolução',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
          },
          {
            title: 'Buscar cursos disponíveis',
            description: 'Veja valores e descontos de milhares de cursos',
            href: '/cursos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
