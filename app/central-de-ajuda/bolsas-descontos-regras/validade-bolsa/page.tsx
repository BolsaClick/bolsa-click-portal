import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Por quanto tempo a bolsa é válida? | Central de Ajuda',
  description:
    'Entenda a validade da sua bolsa de estudo, condições para manter o desconto e o que acontece em casos de trancamento ou transferência.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
  },
}

export default function ValidadeBolsaPage() {
  return (
    <ArticleLayout
      category="Bolsas, Descontos e Regras"
      categoryHref="/central-de-ajuda/bolsas-descontos-regras"
      title="Por quanto tempo a bolsa é válida?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          A bolsa do Bolsa Click vale durante todo o curso, do início ao fim da graduação. Enquanto
          você estiver matriculado e frequentando normalmente, o desconto percentual é mantido em
          todas as mensalidades até a conclusão do curso.
        </p>
      </QuickAnswer>

      <h2>Validade durante todo o curso</h2>
      <p>
        Quando você garante uma bolsa pelo Bolsa Click, o desconto é permanente. Isso significa que
        se você conseguiu uma bolsa de 70%, por exemplo, pagará apenas 30% do valor integral da
        mensalidade durante os 4, 5 ou 6 anos do seu curso.
      </p>
      <p>
        Não existe prazo de validade ou período de renovação. A bolsa acompanha você semestre após
        semestre, ano após ano, até o diploma.
      </p>

      <h2>Condições para manter a bolsa</h2>
      <p>Para que seu desconto continue ativo, você precisa:</p>
      <ul>
        <li>
          <strong>Estar matriculado:</strong> A bolsa vale enquanto você mantiver matrícula ativa na
          instituição
        </li>
        <li>
          <strong>Pagar as mensalidades em dia:</strong> Inadimplência pode suspender temporariamente
          seus benefícios (conforme regras da faculdade)
        </li>
        <li>
          <strong>Cumprir as regras acadêmicas:</strong> Seguir o regulamento da instituição, como
          qualquer outro aluno
        </li>
        <li>
          <strong>Não trancar o curso por tempo indeterminado:</strong> Trancamentos prolongados podem
          impactar a bolsa
        </li>
      </ul>

      <h2>E se eu precisar trancar o curso?</h2>
      <p>
        O trancamento é um direito seu, mas existem algumas considerações importantes sobre a bolsa:
      </p>
      <ul>
        <li>
          <strong>Trancamento de 1 ou 2 semestres:</strong> Geralmente a bolsa é mantida quando você
          retornar, mas é preciso comunicar a faculdade e o Bolsa Click
        </li>
        <li>
          <strong>Trancamento prolongado:</strong> Após períodos muito longos, pode ser necessário
          renegociar condições
        </li>
        <li>
          <strong>Abandono sem trancamento oficial:</strong> Pode resultar em perda da bolsa e
          inadimplência
        </li>
      </ul>
      <p>
        Se você precisa pausar os estudos, entre em contato com nossa equipe para orientação sobre
        como proteger seu desconto.
      </p>

      <h2>Transferência para outra instituição</h2>
      <p>
        A bolsa do Bolsa Click é vinculada ao curso e instituição escolhidos. Se você decidir fazer
        transferência externa (para outra faculdade), o desconto não é automaticamente transferido.
      </p>
      <p>Porém, você pode:</p>
      <ul>
        <li>Buscar uma nova bolsa na faculdade de destino pelo Bolsa Click</li>
        <li>Aproveitar possíveis descontos que temos com a instituição para onde você vai</li>
        <li>Contar com nossa equipe para facilitar o processo</li>
      </ul>

      <h2>Mudança de curso na mesma instituição</h2>
      <p>
        Se você quiser mudar de curso dentro da mesma faculdade, geralmente é possível manter a bolsa
        ou negociar condições similares. Cada instituição tem suas próprias regras de transferência
        interna.
      </p>
      <p>
        Nossa recomendação: antes de solicitar qualquer mudança, fale com nosso suporte para
        verificarmos as melhores condições junto à faculdade parceira.
      </p>

      <h2>A bolsa vale para dependências e matérias extras?</h2>
      <p>
        Sim! O desconto percentual se aplica também a disciplinas de dependência, matérias extras e
        outras atividades curriculares cobradas pela faculdade. Se a faculdade cobra mensalidade, o
        desconto é aplicado.
      </p>

      <NextSteps
        steps={[
          {
            title: 'A bolsa pode mudar de valor?',
            description: 'Entenda se o percentual do desconto pode ser alterado',
            href: '/central-de-ajuda/bolsas-descontos-regras/bolsa-pode-mudar',
          },
          {
            title: 'Exigências de desempenho',
            description: 'Saiba se há requisitos de nota para manter a bolsa',
            href: '/central-de-ajuda/bolsas-descontos-regras/exigencias',
          },
          {
            title: 'Fale com nosso suporte',
            description: 'Tire dúvidas específicas sobre sua bolsa',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
