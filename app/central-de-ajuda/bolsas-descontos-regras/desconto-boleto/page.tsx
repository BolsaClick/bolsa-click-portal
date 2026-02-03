import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'O desconto aparece em qual boleto? | Central de Ajuda',
  description:
    'Saiba a partir de quando o desconto da sua bolsa é aplicado, como identificá-lo no boleto e o que fazer se o valor estiver incorreto.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras/desconto-boleto',
  },
}

export default function DescontoBoletoPage() {
  return (
    <ArticleLayout
      category="Bolsas, Descontos e Regras"
      categoryHref="/central-de-ajuda/bolsas-descontos-regras"
      title="O desconto aparece em qual boleto?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          O desconto da sua bolsa aparece desde a primeira mensalidade após a matrícula. O boleto já
          virá com o valor reduzido conforme o percentual negociado. Se você tem 70% de desconto, por
          exemplo, pagará apenas 30% do valor integral já na primeira parcela.
        </p>
      </QuickAnswer>

      <h2>A partir de quando o desconto é aplicado</h2>
      <p>
        Assim que sua matrícula for efetivada pela faculdade com a bolsa do Bolsa Click, o sistema
        financeiro da instituição já registra seu desconto. Isso significa que:
      </p>
      <ul>
        <li>
          <strong>Primeira mensalidade:</strong> Já vem com desconto aplicado
        </li>
        <li>
          <strong>Todas as mensalidades seguintes:</strong> Desconto automático até o fim do curso
        </li>
        <li>
          <strong>Dependências e matérias extras:</strong> Também recebem o desconto percentual
        </li>
      </ul>
      <p>
        Você não precisa pagar valor integral e depois pedir reembolso. O valor já sai correto no
        boleto.
      </p>

      <h2>Como identificar o desconto no boleto</h2>
      <p>Cada faculdade emite boletos de forma diferente, mas geralmente você verá:</p>
      <ul>
        <li>
          <strong>Valor integral do curso:</strong> Mensalidade sem desconto (valor de referência)
        </li>
        <li>
          <strong>Desconto ou bolsa:</strong> Linha especificando o percentual ou valor abatido
        </li>
        <li>
          <strong>Valor final a pagar:</strong> Mensalidade com desconto já aplicado
        </li>
      </ul>
      <p>
        Algumas instituições especificam &quot;Bolsa Comercial&quot;, &quot;Desconto Bolsa
        Click&quot; ou simplesmente &quot;Desconto&quot;. O importante é que o valor final esteja
        correto.
      </p>

      <h3>Exemplo prático</h3>
      <p>Se você tem uma bolsa de 60% em um curso de R$ 1.000,00:</p>
      <ul>
        <li>Mensalidade integral: R$ 1.000,00</li>
        <li>Desconto (60%): - R$ 600,00</li>
        <li>Valor a pagar: R$ 400,00</li>
      </ul>
      <p>Esse cálculo aparecerá discriminado no boleto ou no portal financeiro da faculdade.</p>

      <h2>O que fazer se o valor estiver errado</h2>
      <p>
        Se você recebeu um boleto com valor diferente do esperado, não entre em pânico. Siga estes
        passos:
      </p>
      <ol>
        <li>
          <strong>Confira os documentos:</strong> Verifique no termo de adesão qual era o percentual
          de desconto garantido
        </li>
        <li>
          <strong>Calcule o valor correto:</strong> Mensalidade integral x percentual que você deve
          pagar
        </li>
        <li>
          <strong>Entre em contato com a faculdade:</strong> Fale com a secretaria ou setor
          financeiro da instituição
        </li>
        <li>
          <strong>Contate o Bolsa Click:</strong> Nossa equipe pode intermediar a solução junto à
          faculdade
        </li>
        <li>
          <strong>Não pague o valor errado:</strong> Aguarde a correção ou orientação antes de
          efetuar o pagamento
        </li>
      </ol>

      <h2>Atraso na aplicação do desconto</h2>
      <p>
        Em raríssimos casos, pode haver um pequeno atraso na aplicação do desconto, especialmente se
        sua matrícula foi finalizada muito próxima ao vencimento da primeira mensalidade. Se isso
        acontecer:
      </p>
      <ul>
        <li>Avise imediatamente o Bolsa Click e a faculdade</li>
        <li>Não pague o valor integral sem confirmação</li>
        <li>A faculdade emitirá segundo boleto corrigido ou aplicará o desconto retroativamente</li>
      </ul>
      <p>
        Nossa equipe acompanha o processo de matrícula justamente para evitar esse tipo de problema.
      </p>

      <h2>Portal do aluno e acompanhamento online</h2>
      <p>
        Além do boleto em papel ou PDF, a maioria das faculdades oferece um portal do aluno onde você
        pode:
      </p>
      <ul>
        <li>Visualizar todas as mensalidades do semestre</li>
        <li>Conferir se o desconto está aplicado corretamente</li>
        <li>Baixar segunda via de boletos</li>
        <li>Acompanhar histórico de pagamentos</li>
      </ul>
      <p>
        Recomendamos acessar o portal logo após a matrícula para confirmar que tudo está correto.
      </p>

      <h2>Desconto em taxas e serviços adicionais</h2>
      <p>
        Atenção: o desconto da bolsa normalmente se aplica apenas à mensalidade. Outros custos podem
        não ter o desconto:
      </p>
      <ul>
        <li>
          <strong>Taxa de matrícula:</strong> Geralmente sem desconto (valor único no início)
        </li>
        <li>
          <strong>Material didático:</strong> Pode ou não ter desconto, varia por faculdade
        </li>
        <li>
          <strong>Provas especiais:</strong> Custos administrativos geralmente sem desconto
        </li>
        <li>
          <strong>Certificados e documentos:</strong> Taxas de emissão normalmente sem desconto
        </li>
      </ul>
      <p>
        Se tiver dúvidas sobre quais custos têm ou não o desconto aplicado, consulte a faculdade ou
        nossa equipe.
      </p>

      <h2>Guardar comprovantes</h2>
      <p>
        Recomendamos fortemente que você:
      </p>
      <ul>
        <li>Guarde todos os boletos pagos (comprovantes)</li>
        <li>Salve PDFs dos boletos antes de pagar</li>
        <li>Tire prints do portal do aluno mostrando o desconto aplicado</li>
        <li>Mantenha o termo de adesão do Bolsa Click arquivado</li>
      </ul>
      <p>
        Esses documentos podem ser úteis em caso de qualquer divergência futura ou para comprovar
        regularidade de pagamentos.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Validade da bolsa',
            description: 'Entenda por quanto tempo o desconto é mantido',
            href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
          },
          {
            title: 'Bolsa pode mudar de valor?',
            description: 'Saiba se o percentual pode ser alterado',
            href: '/central-de-ajuda/bolsas-descontos-regras/bolsa-pode-mudar',
          },
          {
            title: 'Fale com nosso suporte',
            description: 'Tire dúvidas sobre boletos e valores',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
