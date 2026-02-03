import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como falar com o Bolsa Click? | Central de Ajuda',
  description:
    'Conheça todos os canais de atendimento do Bolsa Click (WhatsApp, chat, e-mail, telefone) e qual usar em cada situação.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte/como-falar',
  },
}

export default function ComoFalarPage() {
  return (
    <ArticleLayout
      category="Atendimento e Suporte"
      categoryHref="/central-de-ajuda/atendimento-suporte"
      title="Como falar com o Bolsa Click?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Você pode falar com o Bolsa Click por WhatsApp (11) 99999-9999, chat ao vivo no site,
          e-mail contato@bolsaclick.com.br ou telefone (11) 3000-0000. Cada canal tem vantagens
          específicas: WhatsApp para dúvidas rápidas, chat para suporte em tempo real, e-mail para
          questões formais e telefone para assuntos urgentes.
        </p>
      </QuickAnswer>

      <h2>Todos os nossos canais de atendimento</h2>

      <h3>WhatsApp (recomendado)</h3>
      <p>
        <strong>Número:</strong> (11) 99999-9999
      </p>
      <p>
        <strong>Quando usar:</strong>
      </p>
      <ul>
        <li>Dúvidas rápidas sobre cursos e bolsas</li>
        <li>Acompanhamento do processo de matrícula</li>
        <li>Envio de documentos</li>
        <li>Atendimento personalizado com consultor dedicado</li>
      </ul>
      <p>
        <strong>Vantagens:</strong> Resposta rápida, histórico de conversas, envio de fotos e
        documentos, atendimento humanizado.
      </p>
      <p>
        <strong>Tempo de resposta:</strong> Geralmente em até 30 minutos (horário comercial).
      </p>

      <h3>Chat ao vivo no site</h3>
      <p>
        <strong>Onde encontrar:</strong> Ícone de chat no canto inferior direito de qualquer página do
        site
      </p>
      <p>
        <strong>Quando usar:</strong>
      </p>
      <ul>
        <li>Navegando pelo site e surgiu uma dúvida</li>
        <li>Quer suporte em tempo real</li>
        <li>Não tem WhatsApp disponível</li>
      </ul>
      <p>
        <strong>Vantagens:</strong> Atendimento imediato, prático enquanto navega, sem precisar trocar
        de aplicativo.
      </p>
      <p>
        <strong>Tempo de resposta:</strong> Imediato a 5 minutos (horário comercial).
      </p>

      <h3>E-mail</h3>
      <p>
        <strong>Endereço:</strong> contato@bolsaclick.com.br
      </p>
      <p>
        <strong>Quando usar:</strong>
      </p>
      <ul>
        <li>Questões formais ou que exigem registro</li>
        <li>Envio de documentos grandes ou múltiplos anexos</li>
        <li>Solicitações de reembolso ou cancelamento</li>
        <li>Reclamações ou elogios detalhados</li>
        <li>Preferência por comunicação escrita e formal</li>
      </ul>
      <p>
        <strong>Vantagens:</strong> Registro formal, possibilidade de anexar múltiplos arquivos,
        detalhamento de questões complexas.
      </p>
      <p>
        <strong>Tempo de resposta:</strong> Até 24 horas (dias úteis).
      </p>

      <h3>Telefone</h3>
      <p>
        <strong>Número:</strong> (11) 3000-0000
      </p>
      <p>
        <strong>Quando usar:</strong>
      </p>
      <ul>
        <li>Questões urgentes que não podem esperar</li>
        <li>Preferência por falar diretamente com uma pessoa</li>
        <li>Situações complexas que exigem explicação detalhada</li>
        <li>Dificuldade com canais digitais</li>
      </ul>
      <p>
        <strong>Vantagens:</strong> Contato humano direto, resolução rápida de questões urgentes,
        explicações detalhadas.
      </p>
      <p>
        <strong>Horário:</strong> Segunda a sexta, 8h às 20h | Sábado, 9h às 15h.
      </p>

      <h2>Qual canal usar em cada situação</h2>

      <h3>Para tirar dúvidas sobre cursos e bolsas</h3>
      <p>
        <strong>Melhor opção:</strong> WhatsApp ou Chat
      </p>
      <p>Respostas rápidas e possibilidade de enviar links de cursos específicos.</p>

      <h3>Para acompanhar status da matrícula</h3>
      <p>
        <strong>Melhor opção:</strong> WhatsApp
      </p>
      <p>Seu consultor dedicado mantém histórico e pode atualizar em tempo real.</p>

      <h3>Para enviar documentos</h3>
      <p>
        <strong>Melhor opção:</strong> WhatsApp (arquivos menores) ou E-mail (múltiplos arquivos
        grandes)
      </p>

      <h3>Para solicitar reembolso ou cancelamento</h3>
      <p>
        <strong>Melhor opção:</strong> E-mail
      </p>
      <p>Registro formal da solicitação e possibilidade de anexar comprovantes.</p>

      <h3>Para problemas urgentes (boleto errado, prazo vencendo)</h3>
      <p>
        <strong>Melhor opção:</strong> WhatsApp ou Telefone
      </p>
      <p>Agilidade na resolução de situações que não podem esperar.</p>

      <h3>Para reclamações ou elogios</h3>
      <p>
        <strong>Melhor opção:</strong> E-mail (formal) ou WhatsApp (informal)
      </p>

      <h2>Dicas para um atendimento mais rápido</h2>
      <ul>
        <li>
          <strong>Tenha seus dados em mãos:</strong> CPF, nome completo, curso de interesse
        </li>
        <li>
          <strong>Seja claro e objetivo:</strong> Explique sua dúvida de forma direta
        </li>
        <li>
          <strong>Envie prints quando relevante:</strong> Facilita entender o problema
        </li>
        <li>
          <strong>Mencione se é urgente:</strong> Priorizamos atendimento conforme criticidade
        </li>
        <li>
          <strong>Utilize o mesmo canal:</strong> Continue a conversa por onde começou (mantém
          histórico)
        </li>
        <li>
          <strong>Evite horários de pico:</strong> Início da manhã e hora do almoço costumam ter mais
          demanda
        </li>
      </ul>

      <h2>Central de Ajuda (autoatendimento)</h2>
      <p>
        Antes de entrar em contato, visite nossa Central de Ajuda (você está nela agora!). Muitas
        dúvidas podem ser resolvidas rapidamente consultando nossos artigos:
      </p>
      <ul>
        <li>Como funciona o Bolsa Click</li>
        <li>Documentos necessários</li>
        <li>Política de reembolso</li>
        <li>Validade da bolsa</li>
        <li>E muito mais!</li>
      </ul>
      <p>
        Isso agiliza seu tempo e deixa nossos consultores disponíveis para questões mais complexas.
      </p>

      <h2>Redes sociais</h2>
      <p>
        Também estamos presentes nas redes sociais:
      </p>
      <ul>
        <li>
          <strong>Instagram:</strong> @bolsaclick - Novidades, dicas e conteúdo educacional
        </li>
        <li>
          <strong>Facebook:</strong> /bolsaclick - Comunicados e interação com a comunidade
        </li>
        <li>
          <strong>LinkedIn:</strong> /company/bolsaclick - Conteúdo profissional e vagas
        </li>
      </ul>
      <p>
        <strong>Importante:</strong> Redes sociais são para conteúdo e interação. Para atendimento
        personalizado, use os canais oficiais (WhatsApp, chat, e-mail, telefone).
      </p>

      <h2>Atendimento pós-matrícula</h2>
      <p>
        Após você se matricular na faculdade, questões acadêmicas (notas, faltas, grade curricular)
        devem ser tratadas diretamente com a instituição de ensino. Mas continuamos disponíveis para:
      </p>
      <ul>
        <li>Dúvidas sobre a bolsa e desconto</li>
        <li>Problemas com valores ou boletos</li>
        <li>Intermediação com a faculdade quando necessário</li>
        <li>Novas bolsas para pós-graduação ou outros cursos</li>
      </ul>

      <h2>Feedback e sugestões</h2>
      <p>
        Queremos sempre melhorar! Envie seus feedbacks, sugestões ou críticas construtivas por
        qualquer canal. Levamos todos os retornos a sério e usamos para aprimorar nossos serviços.
      </p>

      <NextSteps
        steps={[
          {
            title: 'WhatsApp, chat e e-mail',
            description: 'Detalhes sobre como usar cada canal',
            href: '/central-de-ajuda/atendimento-suporte/whatsapp-chat-email',
          },
          {
            title: 'Horários de atendimento',
            description: 'Veja quando cada canal está disponível',
            href: '/central-de-ajuda/atendimento-suporte/horarios',
          },
          {
            title: 'Problemas comuns',
            description: 'Soluções rápidas para dúvidas frequentes',
            href: '/central-de-ajuda/atendimento-suporte/problemas-comuns',
          },
        ]}
      />
    </ArticleLayout>
  )
}
