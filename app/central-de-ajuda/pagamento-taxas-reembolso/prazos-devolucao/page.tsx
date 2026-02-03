import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Prazos e forma de devolução | Central de Ajuda',
  description:
    'Saiba quanto tempo leva para receber seu reembolso, como é feita a devolução do valor e quais documentos são necessários.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso/prazos-devolucao',
  },
}

export default function PrazosDevolucaoPage() {
  return (
    <ArticleLayout
      category="Pagamento, Taxas e Reembolso"
      categoryHref="/central-de-ajuda/pagamento-taxas-reembolso"
      title="Prazos e forma de devolução"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Após aprovação do reembolso, o prazo de devolução é de até 10 dias úteis. O valor retorna
          preferencialmente na mesma forma de pagamento original (cartão, Pix ou depósito bancário).
          Você precisa enviar comprovante de pagamento e dados bancários atualizados.
        </p>
      </QuickAnswer>

      <h2>Prazo para análise da solicitação</h2>
      <p>
        Quando você solicita um reembolso, nossa equipe precisa analisar a situação para verificar se
        há direito à devolução conforme nossa política. Esse processo leva:
      </p>
      <ul>
        <li>
          <strong>Casos simples:</strong> 2 a 3 dias úteis (erro técnico, duplicidade, curso cancelado
          pela faculdade)
        </li>
        <li>
          <strong>Casos que exigem contato com a faculdade:</strong> 5 a 7 dias úteis
        </li>
        <li>
          <strong>Casos complexos:</strong> Até 10 dias úteis (necessário apuração detalhada)
        </li>
      </ul>
      <p>
        Durante esse período, mantemos você informado sobre o andamento da análise via e-mail e
        WhatsApp.
      </p>

      <h2>Prazo para receber o dinheiro de volta</h2>
      <p>
        Após a aprovação do reembolso pela nossa equipe, o prazo para o valor cair na sua conta é:
      </p>
      <ul>
        <li>
          <strong>Pagamento via Pix:</strong> Até 5 dias úteis após aprovação
        </li>
        <li>
          <strong>Pagamento via cartão de crédito:</strong> Até 2 faturas (dependendo da data de
          fechamento)
        </li>
        <li>
          <strong>Pagamento via boleto:</strong> Até 10 dias úteis via transferência bancária
        </li>
      </ul>
      <p>
        Importante: os prazos começam a contar a partir da aprovação do reembolso, não da solicitação.
      </p>

      <h2>Forma de devolução do valor</h2>

      <h3>Se você pagou por Pix</h3>
      <p>
        O reembolso é feito via transferência Pix para a mesma chave utilizada no pagamento ou para
        outra chave que você informar. O processo é rápido e você recebe notificação do banco.
      </p>

      <h3>Se você pagou por cartão de crédito</h3>
      <p>
        O estorno é processado diretamente na operadora do cartão. O valor aparece como crédito na
        fatura atual ou na próxima, dependendo da data. Você verá algo como &quot;Estorno Bolsa
        Click&quot; no extrato.
      </p>
      <p>
        Se o cartão utilizado foi cancelado, entre em contato com sua operadora para saber como
        receber o estorno.
      </p>

      <h3>Se você pagou por boleto</h3>
      <p>
        Como não há forma de &quot;estornar&quot; um boleto, a devolução é feita via depósito ou
        transferência bancária para uma conta que você informar. Por isso, precisamos dos seus dados
        bancários atualizados.
      </p>

      <h2>Documentos necessários para reembolso</h2>
      <p>Para processar sua devolução, você precisa enviar:</p>
      <ul>
        <li>
          <strong>Comprovante de pagamento da pré-matrícula:</strong> Recibo, print da transação, ou
          e-mail de confirmação
        </li>
        <li>
          <strong>Documento de identidade (RG ou CNH):</strong> Para confirmar titularidade
        </li>
        <li>
          <strong>CPF:</strong> Mesmo utilizado na pré-matrícula
        </li>
        <li>
          <strong>Dados bancários (se necessário):</strong> Banco, agência, conta e nome completo do
          titular
        </li>
        <li>
          <strong>Motivo do reembolso:</strong> Explicação ou comprovantes (e-mail da faculdade,
          prints, etc.)
        </li>
      </ul>
      <p>
        Quanto mais rápido você enviar os documentos completos, mais rápido processamos o reembolso.
      </p>

      <h2>Como acompanhar o status do reembolso</h2>
      <p>Após solicitar, você pode acompanhar o andamento:</p>
      <ul>
        <li>
          <strong>Por e-mail:</strong> Enviamos atualizações automáticas sobre cada etapa
        </li>
        <li>
          <strong>Por WhatsApp:</strong> Nossa equipe responde e atualiza você diretamente
        </li>
        <li>
          <strong>Pelo telefone:</strong> Ligue para nosso suporte e informe seu CPF ou número de
          protocolo
        </li>
      </ul>
      <p>Você receberá notificações quando:</p>
      <ol>
        <li>Recebermos sua solicitação</li>
        <li>A análise for concluída (aprovado ou negado)</li>
        <li>O pagamento for processado</li>
        <li>O valor for transferido/estornado</li>
      </ol>

      <h2>Reembolso parcial</h2>
      <p>
        Em alguns casos excepcionais, podemos processar reembolso parcial. Por exemplo:
      </p>
      <ul>
        <li>Você desistiu após começar o processo, mas antes da matrícula final</li>
        <li>Houve custos operacionais já incorridos que precisam ser descontados</li>
        <li>Acordo negociado entre as partes</li>
      </ul>
      <p>
        Nesses casos, deixamos claro o valor a ser devolvido e o motivo da retenção parcial antes de
        processar.
      </p>

      <h2>O que fazer se o prazo vencer</h2>
      <p>
        Se o prazo informado passou e você ainda não recebeu o reembolso:
      </p>
      <ol>
        <li>
          <strong>Verifique sua conta bancária ou fatura:</strong> Às vezes o crédito entra e passa
          despercebido
        </li>
        <li>
          <strong>Confira se os dados bancários estavam corretos:</strong> Erro nos dados pode
          bloquear a transferência
        </li>
        <li>
          <strong>Entre em contato com nosso suporte:</strong> Informe o número do protocolo
        </li>
        <li>
          <strong>Solicite comprovante:</strong> Podemos enviar o comprovante da transferência
          realizada
        </li>
      </ol>
      <p>
        Se houve erro por parte do Bolsa Click, corrigimos imediatamente e, se necessário,
        compensamos pelo transtorno.
      </p>

      <h2>Impostos e taxas bancárias</h2>
      <p>
        O valor devolvido é bruto (sem descontos). Eventuais taxas bancárias de recebimento (raras em
        Pix e transferências) são de responsabilidade do banco, não do Bolsa Click.
      </p>
      <p>
        Não há incidência de impostos no reembolso de pré-matrícula, pois trata-se de devolução de
        valor pago, não de renda.
      </p>

      <h2>Transparência e comprovação</h2>
      <p>
        Ao final do processo, você receberá:
      </p>
      <ul>
        <li>E-mail confirmando o processamento do reembolso</li>
        <li>Comprovante de transferência (se aplicável)</li>
        <li>Protocolo de atendimento para registro</li>
      </ul>
      <p>Guarde esses documentos para controle pessoal.</p>

      <NextSteps
        steps={[
          {
            title: 'Casos com direito a reembolso',
            description: 'Veja em quais situações você pode solicitar devolução',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
          },
          {
            title: 'Cancelamento e desistência',
            description: 'Entenda a diferença entre cancelar antes e após a matrícula',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/cancelamento',
          },
          {
            title: 'Fale com o suporte',
            description: 'Tire dúvidas sobre seu reembolso específico',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
