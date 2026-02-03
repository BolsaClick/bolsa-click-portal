import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Cancelamento e desistência | Central de Ajuda',
  description:
    'Entenda como cancelar sua pré-matrícula ou desistir do curso, diferenças entre os momentos, impactos e política de reembolso.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso/cancelamento',
  },
}

export default function CancelamentoPage() {
  return (
    <ArticleLayout
      category="Pagamento, Taxas e Reembolso"
      categoryHref="/central-de-ajuda/pagamento-taxas-reembolso"
      title="Cancelamento e desistência"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Você pode cancelar ou desistir a qualquer momento, mas as consequências variam conforme a
          fase do processo. Antes da matrícula na faculdade, o cancelamento é mais simples (mas pode
          não gerar reembolso). Após a matrícula, você precisa seguir as regras da instituição de
          ensino e sua bolsa pode ser perdida.
        </p>
      </QuickAnswer>

      <h2>Cancelamento antes da matrícula</h2>

      <h3>Você ainda não pagou a pré-matrícula</h3>
      <p>
        Se você ainda não concluiu o pagamento da pré-matrícula, não há nada para cancelar. Sua vaga
        não está reservada e você não tem compromisso com o Bolsa Click ou com a faculdade.
      </p>
      <p>Simplesmente não prossiga com o processo e estará tudo resolvido.</p>

      <h3>Você pagou a pré-matrícula mas não finalizou a matrícula</h3>
      <p>
        Nesse caso, sua vaga está reservada, mas você ainda não é oficialmente aluno da faculdade.
        Para cancelar:
      </p>
      <ul>
        <li>Entre em contato com o Bolsa Click informando a desistência</li>
        <li>Explique o motivo (para melhorarmos nossos serviços)</li>
        <li>Verifique se há direito a reembolso conforme nossa política</li>
      </ul>
      <p>
        <strong>Reembolso:</strong> Desistência pessoal nessa fase geralmente não gera reembolso,
        pois a vaga foi reservada e mobilizamos recursos. Mas cada caso é analisado individualmente.
      </p>

      <h2>Cancelamento após a matrícula</h2>

      <h3>Você já se matriculou na faculdade</h3>
      <p>
        Após efetivar a matrícula, você passa a ter um vínculo direto com a instituição de ensino. O
        cancelamento precisa seguir as regras da faculdade:
      </p>
      <ul>
        <li>
          <strong>Acesse o portal do aluno:</strong> Algumas faculdades permitem cancelamento online
        </li>
        <li>
          <strong>Vá até a secretaria:</strong> Outras exigem comparecimento pessoal ou envio de
          documentos
        </li>
        <li>
          <strong>Preencha formulário de cancelamento:</strong> Protocole o pedido oficialmente
        </li>
        <li>
          <strong>Verifique pendências financeiras:</strong> Mensalidades ou taxas em aberto precisam
          ser quitadas
        </li>
      </ul>
      <p>
        O Bolsa Click pode orientar o processo, mas o cancelamento em si é feito com a faculdade.
      </p>

      <h3>Impacto na bolsa</h3>
      <p>
        Se você cancelar a matrícula após começar o curso, perde a bolsa do Bolsa Click. Caso deseje
        retornar no futuro:
      </p>
      <ul>
        <li>Será necessário buscar uma nova bolsa</li>
        <li>O desconto anterior não é garantido (pode ser maior, menor ou igual)</li>
        <li>Você passará pelo processo novamente</li>
      </ul>

      <h2>Diferença entre cancelamento e trancamento</h2>

      <h3>Cancelamento</h3>
      <ul>
        <li>Encerra definitivamente o vínculo com o curso</li>
        <li>Você deixa de ser aluno da instituição</li>
        <li>Perde a bolsa</li>
        <li>Para voltar, precisa fazer nova matrícula (como novo aluno)</li>
      </ul>

      <h3>Trancamento</h3>
      <ul>
        <li>Pausa temporária nos estudos</li>
        <li>Você continua sendo aluno (matrícula trancada)</li>
        <li>Pode retornar no próximo semestre ou ano</li>
        <li>Bolsa geralmente é mantida (veja nosso artigo sobre validade da bolsa)</li>
      </ul>
      <p>
        Se você precisa parar de estudar temporariamente, o trancamento é uma opção melhor que o
        cancelamento.
      </p>

      <h2>Cancelamento por motivos financeiros</h2>
      <p>
        Se você está pensando em cancelar porque não consegue pagar as mensalidades, antes de tomar
        essa decisão:
      </p>
      <ul>
        <li>
          <strong>Fale com a faculdade:</strong> Muitas instituições oferecem renegociação,
          parcelamento ou até bolsas adicionais
        </li>
        <li>
          <strong>Procure o FIES ou Pravaler:</strong> Opções de financiamento podem ajudar
        </li>
        <li>
          <strong>Considere trancar o semestre:</strong> Em vez de cancelar definitivamente
        </li>
        <li>
          <strong>Entre em contato com o Bolsa Click:</strong> Podemos tentar negociar condições
          melhores ou buscar alternativas
        </li>
      </ul>
      <p>Cancelar deve ser sempre a última opção, não a primeira.</p>

      <h2>Cancelamento por insatisfação com o curso</h2>
      <p>
        Se você descobriu que o curso não é o que esperava:
      </p>
      <ul>
        <li>
          <strong>Avalie mudar de curso na mesma instituição:</strong> Muitas faculdades permitem
          transferência interna
        </li>
        <li>
          <strong>Verifique a possibilidade de manter a bolsa:</strong> Em alguns casos, o desconto
          pode ser transferido
        </li>
        <li>
          <strong>Busque uma nova bolsa pelo Bolsa Click:</strong> Podemos te ajudar a encontrar um
          curso mais adequado
        </li>
      </ul>

      <h2>Prazos e consequências do cancelamento</h2>

      <h3>Cancelamento nos primeiros dias de aula</h3>
      <p>
        Algumas faculdades oferecem um período de &quot;arrependimento&quot; (geralmente 7 dias),
        onde você pode cancelar com menos burocracia e sem pagar todas as mensalidades.
      </p>

      <h3>Cancelamento após início do semestre</h3>
      <p>
        Geralmente você é responsável pelo pagamento das mensalidades até a data do protocolo de
        cancelamento. Por exemplo, se cancelar em abril mas começou em fevereiro, precisa pagar
        fevereiro, março e abril.
      </p>

      <h3>Cancelamento com mensalidades em atraso</h3>
      <p>
        Se você está inadimplente e solicita cancelamento, ainda precisa quitar os débitos para
        receber documentação e evitar negativação.
      </p>

      <h2>Como solicitar cancelamento pelo Bolsa Click</h2>
      <p>Se você ainda não se matriculou ou precisa de orientação:</p>
      <ol>
        <li>Entre em contato via WhatsApp, chat, e-mail ou telefone</li>
        <li>Informe que deseja cancelar e o motivo</li>
        <li>Nossa equipe explicará o processo e consequências</li>
        <li>Se for caso de reembolso, iniciaremos a análise</li>
        <li>Você receberá confirmação do cancelamento por e-mail</li>
      </ol>

      <h2>Evitar arrependimento</h2>
      <p>
        Antes de se comprometer com uma bolsa e curso, certifique-se de que:
      </p>
      <ul>
        <li>É realmente o curso que você quer fazer</li>
        <li>A modalidade (EAD, presencial, semipresencial) atende suas necessidades</li>
        <li>Você tem condições financeiras de arcar com as mensalidades</li>
        <li>O horário das aulas é compatível com sua rotina</li>
        <li>A faculdade é reconhecida pelo MEC e tem boa reputação</li>
      </ul>
      <p>
        Nossa equipe está disponível para tirar todas as dúvidas antes de você garantir a bolsa.
        Prefira esclarecer tudo antes a ter que cancelar depois.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Direito a reembolso',
            description: 'Veja em quais casos há devolução do valor pago',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
          },
          {
            title: 'Validade da bolsa',
            description: 'Entenda quanto tempo a bolsa permanece ativa',
            href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
          },
          {
            title: 'Fale com o suporte',
            description: 'Tire dúvidas antes de tomar qualquer decisão',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
