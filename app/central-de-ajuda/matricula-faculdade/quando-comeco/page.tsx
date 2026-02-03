import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Quando começo a estudar? | Central de Ajuda',
  description:
    'Saiba quando começam as aulas após garantir sua bolsa, como funciona o calendário acadêmico e os processos seletivos contínuos.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade/quando-comeco',
  },
}

export default function QuandoComecoPage() {
  return (
    <ArticleLayout
      category="Matrícula e Faculdade"
      categoryHref="/central-de-ajuda/matricula-faculdade"
      title="Quando começo a estudar?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Isso depende do calendário acadêmico da faculdade e da modalidade do curso. Em processos
          seletivos semestrais, as aulas começam em fevereiro/março (1º semestre) ou julho/agosto (2º
          semestre). Em vestibulares contínuos, você pode começar em poucas semanas após a matrícula.
          Cursos EAD geralmente têm início flexível.
        </p>
      </QuickAnswer>

      <h2>Calendário acadêmico tradicional</h2>
      <p>
        A maioria das faculdades segue o calendário semestral:
      </p>

      <h3>Primeiro semestre</h3>
      <ul>
        <li>
          <strong>Processo seletivo:</strong> Novembro a janeiro
        </li>
        <li>
          <strong>Matrículas:</strong> Janeiro a fevereiro
        </li>
        <li>
          <strong>Início das aulas:</strong> Final de fevereiro ou início de março
        </li>
        <li>
          <strong>Término:</strong> Junho/julho
        </li>
      </ul>

      <h3>Segundo semestre</h3>
      <ul>
        <li>
          <strong>Processo seletivo:</strong> Maio a junho
        </li>
        <li>
          <strong>Matrículas:</strong> Junho a julho
        </li>
        <li>
          <strong>Início das aulas:</strong> Final de julho ou início de agosto
        </li>
        <li>
          <strong>Término:</strong> Novembro/dezembro
        </li>
      </ul>

      <p>
        Se você garantir a bolsa em dezembro, por exemplo, provavelmente começará a estudar no final
        de fevereiro.
      </p>

      <h2>Processos seletivos contínuos</h2>
      <p>
        Muitas faculdades parceiras do Bolsa Click trabalham com vestibular contínuo (ou processo
        seletivo agendado). Nesse modelo:
      </p>
      <ul>
        <li>Você pode se inscrever e matricular em qualquer época do ano</li>
        <li>As turmas abrem com frequência (mensal, bimestral ou conforme demanda)</li>
        <li>
          O início das aulas pode ser em 2 a 4 semanas após a matrícula
        </li>
        <li>Ideal para quem quer começar rapidamente, sem esperar o semestre tradicional</li>
      </ul>
      <p>
        Essa modalidade é comum em cursos EAD e semipresenciais, mas algumas graduações presenciais
        também oferecem.
      </p>

      <h2>Cursos EAD e início flexível</h2>
      <p>
        Cursos 100% online (EAD) costumam ter início bem mais flexível:
      </p>
      <ul>
        <li>
          <strong>Turmas mensais:</strong> Você começa no mês seguinte à matrícula
        </li>
        <li>
          <strong>Início imediato:</strong> Algumas instituições liberam acesso ao material assim que
          a matrícula é efetivada
        </li>
        <li>
          <strong>Calendário próprio:</strong> Não precisa esperar fevereiro ou agosto
        </li>
      </ul>
      <p>
        Por exemplo: matriculou em 15 de abril, pode começar as aulas em 1º de maio.
      </p>

      <h2>Tempo entre garantir a bolsa e começar as aulas</h2>
      <p>
        Veja um cronograma típico:
      </p>
      <ol>
        <li>
          <strong>Dia 1:</strong> Você garante a bolsa e paga a pré-matrícula
        </li>
        <li>
          <strong>Dias 2-7:</strong> Envia documentos para a faculdade
        </li>
        <li>
          <strong>Dias 8-14:</strong> Faculdade valida documentos e efetiva matrícula
        </li>
        <li>
          <strong>Dias 15-21:</strong> Você recebe acesso ao portal, boletos, calendário
        </li>
        <li>
          <strong>Conforme calendário:</strong> Aguarda início das aulas (pode ser semanas ou meses,
          dependendo da época)
        </li>
      </ol>

      <h2>Como saber a data exata do início das aulas</h2>
      <p>
        Após finalizar a matrícula, você recebe:
      </p>
      <ul>
        <li>
          <strong>Calendário acadêmico:</strong> Documento com todas as datas importantes do semestre
          ou ano
        </li>
        <li>
          <strong>E-mail de boas-vindas:</strong> Com data, horário e local (ou link) da primeira aula
        </li>
        <li>
          <strong>Acesso ao portal do aluno:</strong> Onde constam datas, grade de horários,
          professores
        </li>
      </ul>
      <p>
        O Bolsa Click também mantém você informado sobre essas datas importantes.
      </p>

      <h2>Aula inaugural e recepção de calouros</h2>
      <p>
        Muitas faculdades realizam eventos de recepção:
      </p>
      <ul>
        <li>
          <strong>Aula inaugural:</strong> Apresentação da instituição, diretoria, coordenação
        </li>
        <li>
          <strong>Tour pela estrutura:</strong> Conhecer salas, laboratórios, biblioteca
        </li>
        <li>
          <strong>Integração entre alunos:</strong> Atividades para calouros se conhecerem
        </li>
        <li>
          <strong>Orientações acadêmicas:</strong> Como funciona o curso, regras, avaliações
        </li>
      </ul>
      <p>
        Essas atividades geralmente acontecem na semana anterior ou na primeira semana de aulas.
      </p>

      <h2>Cursos que começaram há pouco tempo</h2>
      <p>
        E se o curso que você quer já começou há algumas semanas? Depende:
      </p>
      <ul>
        <li>
          <strong>Primeiras semanas:</strong> Algumas faculdades aceitam matrícula com ajuste de
          calendário
        </li>
        <li>
          <strong>Após prazo limite:</strong> Você precisará aguardar a próxima turma
        </li>
        <li>
          <strong>Reposição de aulas:</strong> Quando permitido, você compensa o conteúdo perdido
        </li>
      </ul>
      <p>
        Consulte o Bolsa Click para verificar se ainda há possibilidade de entrar em turmas recém-iniciadas.
      </p>

      <h2>Adiantando os estudos antes do início oficial</h2>
      <p>
        Enquanto aguarda o início das aulas, você pode:
      </p>
      <ul>
        <li>
          <strong>Acessar material introdutório:</strong> Algumas faculdades liberam conteúdo
          preparatório
        </li>
        <li>
          <strong>Participar de grupos de alunos:</strong> WhatsApp, Telegram, redes sociais
        </li>
        <li>
          <strong>Estudar por conta:</strong> Livros, vídeos e cursos online sobre temas do curso
        </li>
        <li>
          <strong>Organizar rotina:</strong> Preparar espaço de estudos, horários, materiais
        </li>
      </ul>

      <h2>E se eu não puder começar na data prevista?</h2>
      <p>
        Se você tem algum impedimento para iniciar na turma prevista:
      </p>
      <ul>
        <li>
          <strong>Antes da matrícula:</strong> Escolha uma turma com data de início que funcione para
          você
        </li>
        <li>
          <strong>Após a matrícula:</strong> Veja se a faculdade permite transferir para próxima turma
        </li>
        <li>
          <strong>Trancamento inicial:</strong> Algumas instituições permitem trancar antes mesmo de
          começar
        </li>
      </ul>
      <p>
        Entre em contato com o Bolsa Click e com a faculdade o quanto antes para buscar soluções.
      </p>

      <h2>Diferenças por modalidade</h2>

      <h3>Presencial</h3>
      <p>
        Geralmente segue calendário semestral rígido (fevereiro e agosto). Turmas precisam de quórum
        mínimo para abrir.
      </p>

      <h3>Semipresencial</h3>
      <p>
        Pode ter calendário semestral ou processos contínuos, dependendo da instituição. Encontros
        presenciais têm datas fixas.
      </p>

      <h3>EAD</h3>
      <p>
        Maior flexibilidade, com turmas abrindo mensalmente ou até início imediato após matrícula.
      </p>

      <h2>Comunicação clara sobre datas</h2>
      <p>
        O Bolsa Click sempre informa:
      </p>
      <ul>
        <li>Qual é a próxima turma disponível</li>
        <li>Data prevista de início das aulas</li>
        <li>Se há outras turmas em breve (caso você prefira esperar)</li>
      </ul>
      <p>
        Tudo isso fica claro antes de você garantir a bolsa, para que não haja surpresas.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Como fazer matrícula',
            description: 'Veja o processo completo para se matricular',
            href: '/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
          },
          {
            title: 'Buscar cursos disponíveis',
            description: 'Veja opções de cursos e datas de início',
            href: '/cursos',
          },
          {
            title: 'Trocar de curso ou turno',
            description: 'Saiba sobre possibilidades de mudança',
            href: '/central-de-ajuda/matricula-faculdade/trocar-curso',
          },
        ]}
      />
    </ArticleLayout>
  )
}
