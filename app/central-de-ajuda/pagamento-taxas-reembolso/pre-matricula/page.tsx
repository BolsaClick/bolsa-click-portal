import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como funciona o pagamento da pré-matrícula? | Central de Ajuda',
  description:
    'Entenda o que é a pré-matrícula, valor médio, formas de pagamento aceitas e para onde vai esse investimento.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/pagamento-taxas-reembolso/pre-matricula',
  },
}

export default function PreMatriculaPage() {
  return (
    <ArticleLayout
      category="Pagamento, Taxas e Reembolso"
      categoryHref="/central-de-ajuda/pagamento-taxas-reembolso"
      title="Como funciona o pagamento da pré-matrícula?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          A pré-matrícula é uma taxa única e simbólica (geralmente R$ 50 a R$ 150) que você paga para
          reservar sua vaga e garantir a bolsa. O pagamento pode ser feito por Pix (instantâneo),
          cartão de crédito (aprovação imediata) ou boleto bancário (compensação em até 3 dias úteis).
        </p>
      </QuickAnswer>

      <h2>O que é a pré-matrícula</h2>
      <p>
        A pré-matrícula é o primeiro passo para garantir sua bolsa de estudo. Ao pagar essa taxa, você
        oficialmente reserva:
      </p>
      <ul>
        <li>Sua vaga no curso escolhido</li>
        <li>O percentual de desconto negociado</li>
        <li>Prioridade no processo de matrícula</li>
        <li>Acompanhamento personalizado da nossa equipe</li>
      </ul>
      <p>
        Pense na pré-matrícula como um sinal de compromisso mútuo: você demonstra interesse real no
        curso e nós garantimos que a bolsa ficará reservada para você.
      </p>

      <h2>Qual o valor da pré-matrícula</h2>
      <p>
        O valor varia conforme o curso, instituição e tipo de bolsa, mas geralmente fica entre:
      </p>
      <ul>
        <li>Cursos EAD e semipresenciais: R$ 50 a R$ 100</li>
        <li>Cursos presenciais e graduações tradicionais: R$ 100 a R$ 150</li>
        <li>Pós-graduações e cursos especiais: Pode variar mais, mas sempre informado antes</li>
      </ul>
      <p>
        O valor exato aparece na página do curso antes de você clicar em &quot;Garantir bolsa&quot;.
        Não há surpresas.
      </p>

      <h2>Formas de pagamento aceitas</h2>

      <h3>Pix (recomendado)</h3>
      <ul>
        <li>Pagamento instantâneo</li>
        <li>Confirmação automática em segundos</li>
        <li>Processo mais rápido</li>
        <li>Disponível 24 horas, inclusive finais de semana</li>
      </ul>

      <h3>Cartão de crédito</h3>
      <ul>
        <li>Aprovação imediata na maioria dos casos</li>
        <li>Pode parcelar em algumas situações (conforme valor)</li>
        <li>Processamento em tempo real</li>
        <li>Aceita principais bandeiras (Visa, Mastercard, Elo)</li>
      </ul>

      <h3>Boleto bancário</h3>
      <ul>
        <li>Opção para quem prefere pagamento em dinheiro</li>
        <li>Compensação em até 3 dias úteis</li>
        <li>Pode ser pago em bancos, lotéricas, apps bancários</li>
        <li>Importante: processo só continua após confirmação do pagamento</li>
      </ul>

      <h2>Passo a passo do pagamento</h2>
      <ol>
        <li>
          <strong>Escolha o curso:</strong> Navegue pela plataforma e encontre a bolsa ideal
        </li>
        <li>
          <strong>Clique em &quot;Garantir bolsa&quot;:</strong> Verifique o valor da pré-matrícula
        </li>
        <li>
          <strong>Preencha seus dados:</strong> Nome, CPF, e-mail, telefone
        </li>
        <li>
          <strong>Escolha a forma de pagamento:</strong> Pix, cartão ou boleto
        </li>
        <li>
          <strong>Efetue o pagamento:</strong> Siga as instruções conforme o método escolhido
        </li>
        <li>
          <strong>Receba confirmação:</strong> Por e-mail e WhatsApp
        </li>
        <li>
          <strong>Acompanhe o processo:</strong> Nossa equipe entrará em contato para próximos passos
        </li>
      </ol>

      <h2>O que acontece após o pagamento</h2>
      <p>Assim que confirmarmos seu pagamento:</p>
      <ul>
        <li>Sua vaga e bolsa ficam oficialmente reservadas</li>
        <li>Você recebe um e-mail de confirmação com todas as informações</li>
        <li>Nossa equipe entra em contato via WhatsApp para orientar sobre documentação</li>
        <li>Iniciamos o processo de matrícula junto à faculdade</li>
        <li>Você pode acompanhar o status em tempo real pela plataforma</li>
      </ul>

      <h2>Prazo de validade da pré-matrícula</h2>
      <p>
        Após pagar a pré-matrícula, você tem um prazo para completar a matrícula na faculdade
        (geralmente entre 7 e 15 dias, dependendo do calendário acadêmico). Se não concluir nesse
        prazo sem justificativa:
      </p>
      <ul>
        <li>A vaga pode ser liberada para outros estudantes</li>
        <li>O valor da pré-matrícula pode não ser reembolsável</li>
      </ul>
      <p>
        Por isso, só garanta a bolsa quando tiver certeza de que vai seguir com a matrícula ou entre
        em contato caso precise de mais tempo.
      </p>

      <h2>Para onde vai o valor da pré-matrícula</h2>
      <p>
        O valor que você paga fica com o Bolsa Click e cobre:
      </p>
      <ul>
        <li>Processamento da sua inscrição</li>
        <li>Reserva da vaga e da bolsa</li>
        <li>Atendimento personalizado da equipe</li>
        <li>Intermediação com a faculdade parceira</li>
        <li>Suporte durante todo o processo de matrícula</li>
      </ul>
      <p>
        A pré-matrícula NÃO é abatida da primeira mensalidade. Ela é uma taxa administrativa do Bolsa
        Click, separada dos valores que você pagará para a faculdade.
      </p>

      <h2>Segurança no pagamento</h2>
      <p>
        Todos os pagamentos realizados na plataforma do Bolsa Click são:
      </p>
      <ul>
        <li>Processados por gateways de pagamento certificados</li>
        <li>Protegidos por criptografia SSL</li>
        <li>Seguros conforme normas do Banco Central</li>
        <li>Seus dados bancários não são armazenados por nós</li>
      </ul>

      <h2>Dúvidas frequentes</h2>

      <h3>Posso parcelar a pré-matrícula?</h3>
      <p>
        Geralmente não, pois são valores baixos. Mas em casos especiais ou valores mais altos (pós-graduações, por exemplo), pode haver opção de parcelamento no cartão. Verifique na página de pagamento.
      </p>

      <h3>O pagamento é seguro?</h3>
      <p>
        Sim, totalmente seguro. Utilizamos sistemas certificados e respeitamos todas as normas de
        segurança digital.
      </p>

      <h3>Quanto tempo demora para confirmar?</h3>
      <ul>
        <li>Pix: Segundos a poucos minutos</li>
        <li>Cartão: Imediato a alguns minutos</li>
        <li>Boleto: 1 a 3 dias úteis após pagamento</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Taxas do Bolsa Click',
            description: 'Entenda todos os custos envolvidos no processo',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/taxas',
          },
          {
            title: 'Direito a reembolso',
            description: 'Saiba quando você pode solicitar devolução',
            href: '/central-de-ajuda/pagamento-taxas-reembolso/reembolso',
          },
          {
            title: 'Buscar bolsas agora',
            description: 'Encontre o curso ideal e garanta seu desconto',
            href: '/cursos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
