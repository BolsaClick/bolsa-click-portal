import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'O que acontece depois de garantir a bolsa? | Central de Ajuda',
  description:
    'Entenda o passo a passo do processo de matrícula depois de garantir sua bolsa de estudo pelo Bolsa Click.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos/depois-de-garantir',
  },
}

export default function DepoisDeGarantirPage() {
  return (
    <ArticleLayout
      category="Primeiros Passos"
      categoryHref="/central-de-ajuda/primeiros-passos"
      title="O que acontece depois de garantir a bolsa?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Depois de garantir sua bolsa, você receberá as instruções de matrícula por e-mail e
          WhatsApp. Nossa equipe acompanha todo o processo, desde o envio de documentos até a
          confirmação da sua vaga. Em poucos dias você estará oficialmente matriculado e pronto
          para começar as aulas.
        </p>
      </QuickAnswer>

      <h2>Passo a passo após garantir a bolsa</h2>
      <p>
        Garantir a bolsa é apenas o primeiro passo. Agora vem o processo de matrícula, mas fique
        tranquilo: vamos te acompanhar em cada etapa.
      </p>

      <h3>1. Confirmação imediata</h3>
      <p>Assim que você garante a bolsa:</p>
      <ul>
        <li>
          Recebe <strong>e-mail de confirmação</strong> com resumo da bolsa (curso, instituição,
          valor e desconto)
        </li>
        <li>
          Mensagem via <strong>WhatsApp</strong> com próximos passos
        </li>
        <li>Acesso à área do aluno no Bolsa Click para acompanhar o status da solicitação</li>
      </ul>

      <h3>2. Envio de documentos</h3>
      <p>Você precisará enviar documentação básica, geralmente:</p>
      <ul>
        <li>RG e CPF (digitalizados ou fotos legíveis)</li>
        <li>Comprovante de residência recente</li>
        <li>Certificado de conclusão do ensino médio ou diploma de graduação (para pós)</li>
        <li>Histórico escolar</li>
      </ul>
      <p>
        <strong>Importante:</strong> A lista exata de documentos varia conforme a instituição e o
        tipo de curso. Você receberá uma lista personalizada por e-mail.
      </p>

      <h3>3. Análise e validação</h3>
      <p>A faculdade parceira analisa seus documentos em até 2 a 5 dias úteis. Nesse período:</p>
      <ul>
        <li>Nossa equipe acompanha o andamento</li>
        <li>Você recebe atualizações de status</li>
        <li>Se houver pendências, entramos em contato para ajustar</li>
      </ul>

      <h3>4. Confirmação de matrícula</h3>
      <p>Aprovada a documentação, você recebe:</p>
      <ul>
        <li>
          <strong>E-mail de boas-vindas da faculdade</strong> com dados de acesso ao portal do
          aluno
        </li>
        <li>
          <strong>Instruções sobre pagamento da primeira mensalidade</strong> (se bolsa parcial) ou
          taxas adicionais
        </li>
        <li>
          <strong>Informações sobre início das aulas:</strong> data, horários, plataforma (EAD) ou
          local (presencial)
        </li>
        <li>
          <strong>Orientações sobre materiais didáticos</strong> e ambientação
        </li>
      </ul>

      <h3>5. Início das aulas</h3>
      <p>Pronto! Você está oficialmente matriculado. Agora é só:</p>
      <ul>
        <li>Acessar o ambiente virtual de aprendizagem (AVA) ou comparecer presencialmente</li>
        <li>Conhecer professores e colegas</li>
        <li>Começar sua jornada acadêmica</li>
      </ul>

      <h2>Quanto tempo leva todo o processo?</h2>
      <p>
        Do momento que você garante a bolsa até o início das aulas, o prazo varia conforme o
        calendário da instituição:
      </p>
      <ul>
        <li>
          <strong>Matrícula imediata:</strong> 2 a 7 dias úteis para confirmação
        </li>
        <li>
          <strong>Início das aulas:</strong> Depende do cronograma da faculdade (vestibulares,
          processos seletivos, calendário acadêmico)
        </li>
      </ul>
      <p>
        Muitas instituições têm múltiplas turmas ao longo do ano, especialmente em cursos EAD, o
        que reduz o tempo de espera.
      </p>

      <h2>E se eu tiver dúvidas durante o processo?</h2>
      <p>Nossa equipe está disponível do início ao fim:</p>
      <ul>
        <li>
          <strong>WhatsApp:</strong> Atendimento humanizado para dúvidas rápidas
        </li>
        <li>
          <strong>E-mail:</strong> Suporte técnico para questões mais detalhadas
        </li>
        <li>
          <strong>Telefone:</strong> Ligação direta em casos urgentes
        </li>
        <li>
          <strong>Portal do aluno:</strong> Área exclusiva para acompanhar o status em tempo real
        </li>
      </ul>

      <h2>Posso desistir após garantir a bolsa?</h2>
      <p>
        Sim. Garantir a bolsa não é um compromisso irreversível. Se você mudar de ideia antes de
        efetivar a matrícula, basta informar nossa equipe. Não há multas nem taxas de cancelamento
        nesta fase.
      </p>
      <p>
        <strong>Atenção:</strong> Após a efetivação da matrícula, as regras de cancelamento são
        definidas pela instituição de ensino.
      </p>

      <h2>O desconto continua valendo nas próximas mensalidades?</h2>
      <p>
        Sim! O desconto garantido pelo Bolsa Click vale para{' '}
        <strong>todo o período do curso</strong>, desde que você mantenha os pagamentos em dia e
        cumpra as regras acadêmicas da instituição.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Comece agora',
            description: 'Busque sua bolsa ideal e dê o primeiro passo',
            href: '/cursos',
          },
          {
            title: 'Tire dúvidas sobre o processo',
            description: 'Fale com nossa equipe pelo WhatsApp',
            href: 'https://wa.me/5511999999999',
          },
          {
            title: 'Entenda os tipos de bolsa',
            description: 'Saiba a diferença entre bolsa parcial e integral',
            href: '/central-de-ajuda/primeiros-passos/bolsa-parcial-integral',
          },
        ]}
      />
    </ArticleLayout>
  )
}
