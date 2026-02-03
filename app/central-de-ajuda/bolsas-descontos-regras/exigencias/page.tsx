import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Existe exigência de nota, presença ou desempenho? | Central de Ajuda',
  description:
    'Descubra se há requisitos de nota mínima, presença ou desempenho acadêmico para manter sua bolsa de estudo no Bolsa Click.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras/exigencias',
  },
}

export default function ExigenciasPage() {
  return (
    <ArticleLayout
      category="Bolsas, Descontos e Regras"
      categoryHref="/central-de-ajuda/bolsas-descontos-regras"
      title="Existe exigência de nota, presença ou desempenho?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Não. As bolsas comerciais do Bolsa Click não exigem nota mínima, desempenho específico ou
          frequência além da obrigatória pela faculdade. Você só precisa cumprir as mesmas regras
          acadêmicas que qualquer outro aluno da instituição para manter sua bolsa ativa.
        </p>
      </QuickAnswer>

      <h2>Bolsa comercial vs bolsa-mérito</h2>
      <p>
        É importante entender a diferença entre os dois tipos de bolsa para não confundir as
        exigências:
      </p>
      <ul>
        <li>
          <strong>Bolsa comercial (Bolsa Click):</strong> Desconto negociado diretamente com a
          faculdade, sem exigências de desempenho. É a que você encontra em nossa plataforma.
        </li>
        <li>
          <strong>Bolsa-mérito (algumas instituições):</strong> Bolsa acadêmica oferecida pela própria
          faculdade com base em nota, desempenho no vestibular ou ENEM. Essa sim pode ter exigências
          de manutenção.
        </li>
      </ul>
      <p>
        Quando você garante uma bolsa pelo Bolsa Click, está recebendo uma bolsa comercial, que é bem
        mais tranquila em termos de exigências.
      </p>

      <h2>O que você precisa fazer para manter a bolsa</h2>
      <p>As únicas obrigações são as mesmas de qualquer estudante:</p>
      <ul>
        <li>
          <strong>Estar matriculado:</strong> Manter sua matrícula ativa na instituição
        </li>
        <li>
          <strong>Seguir o regulamento acadêmico:</strong> Cumprir as regras gerais da faculdade
          (frequência mínima, comportamento, prazos, etc.)
        </li>
        <li>
          <strong>Pagar as mensalidades em dia:</strong> Manter os pagamentos regulares
        </li>
        <li>
          <strong>Não abandonar o curso:</strong> Trancamentos oficiais são aceitos, mas abandono pode
          gerar problemas
        </li>
      </ul>
      <p>
        Não existe exigência de média mínima, coeficiente de rendimento ou número de disciplinas
        aprovadas para manter o desconto.
      </p>

      <h2>Frequência mínima</h2>
      <p>
        A frequência mínima exigida é a mesma determinada pelo MEC para todos os alunos: geralmente
        75% de presença nas aulas. Isso não é uma exigência da bolsa, mas sim uma regra acadêmica
        padrão.
      </p>
      <p>
        Se você não atingir a frequência mínima, pode reprovar por falta na disciplina, conforme
        regulamento da faculdade. Mas isso não cancela sua bolsa — você continuará com o desconto nas
        próximas disciplinas.
      </p>

      <h2>E se eu reprovar em matérias?</h2>
      <p>
        Reprovar em disciplinas não afeta sua bolsa. Você continuará pagando com desconto nas
        dependências ou quando refizer a matéria. A bolsa permanece ativa independentemente do seu
        desempenho acadêmico.
      </p>
      <p>
        Obviamente, nosso desejo é que você seja aprovado em tudo e conclua o curso no prazo ideal.
        Mas caso tenha dificuldades em alguma matéria, sua bolsa estará garantida.
      </p>

      <h2>Comportamento e regulamento interno</h2>
      <p>
        Embora não haja exigência de notas, você precisa seguir o código de ética e regulamento
        interno da instituição, assim como todos os estudantes. Infrações graves (fraude acadêmica,
        desrespeito a colegas ou professores, entre outros) podem resultar em medidas disciplinares
        conforme regras da faculdade.
      </p>
      <p>
        Esses casos são raríssimos e seguem os mesmos critérios aplicados a qualquer aluno,
        independentemente de ter bolsa ou não.
      </p>

      <h2>Documentação e rematrícula</h2>
      <p>
        A cada semestre ou ano, você precisará fazer a rematrícula conforme calendário da faculdade.
        Durante esse processo:
      </p>
      <ul>
        <li>Seu desconto é automaticamente renovado</li>
        <li>Não é necessário comprovar notas ou desempenho</li>
        <li>Basta estar em dia com as mensalidades e documentação</li>
      </ul>

      <h2>Transparência nas regras</h2>
      <p>
        Todas as condições da bolsa estão descritas no termo de adesão que você recebe ao garantir a
        vaga. Leia com atenção e, se tiver qualquer dúvida, nossa equipe está disponível para
        esclarecer antes, durante e depois da matrícula.
      </p>
      <p>
        Não trabalhamos com surpresas ou letras miúdas. Tudo é transparente desde o primeiro contato.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Validade da bolsa',
            description: 'Saiba por quanto tempo a bolsa permanece ativa',
            href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
          },
          {
            title: 'Como garantir sua bolsa',
            description: 'Veja o processo completo para garantir seu desconto',
            href: '/central-de-ajuda/primeiros-passos/depois-de-garantir',
          },
          {
            title: 'Tire suas dúvidas',
            description: 'Fale com nossa equipe para esclarecer qualquer questão',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
