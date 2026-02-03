import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Em quais casos tenho direito a reembolso? | Central de Ajuda',
  description:
    'Conheça as situações em que você pode solicitar reembolso da pré-matrícula e os casos em que não há devolução de valores.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
  },
}

export default function ReembolsoPage() {
  return (
    <ArticleLayout
      category="Pagamento, Taxas e Reembolso"
      categoryHref="/central-de-ajuda/pagamento-taxas-reembolso"
      title="Em quais casos tenho direito a reembolso?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Você tem direito a reembolso da pré-matrícula em situações específicas: se a faculdade
          indeferir sua matrícula, se o curso não for ofertado conforme prometido, ou se houver erro
          por parte do Bolsa Click ou da instituição. Desistência pessoal após confirmação da vaga
          geralmente não gera reembolso.
        </p>
      </QuickAnswer>

      <h2>Situações com direito a reembolso</h2>

      <h3>1. Indeferimento pela faculdade</h3>
      <p>
        Se a instituição de ensino recusar sua matrícula por motivos legítimos (documentação
        incompleta que não pode ser regularizada, não atendimento a requisitos específicos do curso,
        etc.) e você não puder mais prosseguir, terá direito ao reembolso integral.
      </p>

      <h3>2. Curso não ofertado ou cancelado</h3>
      <p>
        Caso a faculdade cancele a turma por falta de quórum mínimo, não abra o curso no período
        prometido, ou a bolsa anunciada não esteja mais disponível por erro da instituição, você
        recebe 100% de volta.
      </p>

      <h3>3. Erro ou problema técnico do Bolsa Click</h3>
      <p>
        Se houver erro no processamento da sua pré-matrícula, duplicidade de cobrança, ou qualquer
        falha de responsabilidade do Bolsa Click, faremos o reembolso completo imediatamente.
      </p>

      <h3>4. Informações incorretas sobre o curso</h3>
      <p>
        Se descobrir que o curso, a modalidade (EAD/presencial), o valor ou o percentual de desconto
        eram diferentes do anunciado e isso impossibilitar sua matrícula, você tem direito ao
        reembolso.
      </p>

      <h3>5. Problemas com a faculdade parceira</h3>
      <p>
        Caso a instituição descumpra o acordo firmado (não reconheça a bolsa, cobre valores
        diferentes, ou apresente problemas graves que impeçam sua matrícula), intermediamos a solução
        e, se necessário, reembolsamos o valor.
      </p>

      <h2>Situações SEM direito a reembolso</h2>

      <h3>1. Desistência pessoal</h3>
      <p>
        Se você simplesmente mudar de ideia após pagar a pré-matrícula (decidir que não quer mais
        fazer o curso, encontrar outra opção, razões pessoais), geralmente não há reembolso. A
        pré-matrícula reservou a vaga e mobilizou recursos.
      </p>

      <h3>2. Atraso ou falta de documentação</h3>
      <p>
        Se você não enviar os documentos solicitados no prazo ou não completar o processo de matrícula
        por escolha própria, a vaga é perdida sem direito a devolução do valor.
      </p>

      <h3>3. Reprovação em processo seletivo próprio</h3>
      <p>
        Alguns cursos exigem processo seletivo adicional (prova, entrevista, análise de histórico). Se
        você for reprovado nesse processo por desempenho insuficiente (e isso estava claro desde o
        início), não há reembolso.
      </p>

      <h3>4. Inadimplência com a faculdade</h3>
      <p>
        Se você for matriculado mas não pagar a primeira mensalidade ou taxa de matrícula da
        faculdade, perdendo a vaga por inadimplência, o Bolsa Click não reembolsa a pré-matrícula.
      </p>

      <h2>Como solicitar reembolso</h2>
      <p>Se você se enquadra em alguma das situações com direito a reembolso:</p>
      <ol>
        <li>
          <strong>Entre em contato com nosso suporte:</strong> Via WhatsApp, chat, e-mail ou telefone
        </li>
        <li>
          <strong>Explique a situação:</strong> Forneça detalhes do que aconteceu
        </li>
        <li>
          <strong>Envie comprovantes:</strong> E-mail da faculdade, prints, documentos relevantes
        </li>
        <li>
          <strong>Aguarde análise:</strong> Nossa equipe verificará o caso em até 5 dias úteis
        </li>
        <li>
          <strong>Receba o reembolso:</strong> Se aprovado, o valor retorna conforme forma original de
          pagamento
        </li>
      </ol>

      <h2>Política de boa-fé</h2>
      <p>
        O Bolsa Click trabalha com transparência e boa-fé. Nosso objetivo nunca é reter valores
        indevidamente. Por isso:
      </p>
      <ul>
        <li>Analisamos cada caso individualmente</li>
        <li>Buscamos sempre uma solução justa</li>
        <li>Se houver dúvida sobre o direito a reembolso, damos o benefício ao estudante</li>
        <li>Mantemos diálogo aberto e respeitoso</li>
      </ul>

      <h2>Alternativas ao reembolso</h2>
      <p>
        Em algumas situações, podemos oferecer alternativas ao reembolso monetário:
      </p>
      <ul>
        <li>
          <strong>Transferência de curso:</strong> Usar o valor pago para garantir bolsa em outro
          curso
        </li>
        <li>
          <strong>Transferência de semestre:</strong> Reservar a vaga para o próximo processo seletivo
        </li>
        <li>
          <strong>Transferência para terceiro:</strong> Passar a pré-matrícula para outra pessoa (com
          autorização)
        </li>
      </ul>
      <p>
        Essas opções são avaliadas caso a caso e podem ser mais vantajosas que o reembolso,
        dependendo da situação.
      </p>

      <h2>Prazo para solicitar reembolso</h2>
      <p>
        Você deve solicitar o reembolso em até 30 dias após o fato que gerou o direito (indeferimento,
        cancelamento do curso, etc.). Após esse prazo, a análise fica mais complexa, mas ainda assim
        avaliamos com boa vontade.
      </p>

      <h2>Transparência nos termos</h2>
      <p>
        Todas as condições de reembolso estão descritas no termo de adesão que você recebe ao garantir
        a bolsa. Leia com atenção antes de concluir o pagamento.
      </p>
      <p>
        Se tiver dúvidas sobre a política de reembolso antes de pagar a pré-matrícula, entre em
        contato com nosso suporte. É melhor esclarecer tudo antes do que se arrepender depois.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Prazos de devolução',
            description: 'Saiba quanto tempo leva para receber seu reembolso',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/prazos-devolucao',
          },
          {
            title: 'Cancelamento e desistência',
            description: 'Entenda como funciona o cancelamento em diferentes momentos',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/cancelamento',
          },
          {
            title: 'Fale com o suporte',
            description: 'Tire dúvidas sobre sua situação específica',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
