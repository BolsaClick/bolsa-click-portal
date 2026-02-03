import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Atendimento via WhatsApp, chat e e-mail | Central de Ajuda',
  description:
    'Como usar cada canal de atendimento do Bolsa Click, tempo de resposta esperado e dicas para ser atendido rapidamente.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte/whatsapp-chat-email',
  },
}

export default function WhatsAppChatEmailPage() {
  return (
    <ArticleLayout
      category="Atendimento e Suporte"
      categoryHref="/central-de-ajuda/atendimento-suporte"
      title="Atendimento via WhatsApp, chat e e-mail"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          WhatsApp oferece atendimento personalizado com consultor dedicado (resposta em até 30min).
          Chat no site é ideal para suporte imediato enquanto navega (resposta em até 5min). E-mail é
          para questões formais e complexas (resposta em até 24h). Todos funcionam em horário
          comercial estendido.
        </p>
      </QuickAnswer>

      <h2>Atendimento via WhatsApp</h2>

      <h3>Como funciona</h3>
      <p>
        O WhatsApp é nosso principal canal de atendimento. Quando você entra em contato pela primeira
        vez:
      </p>
      <ol>
        <li>Envia mensagem para (11) 99999-9999</li>
        <li>Recebe saudação automática e menu de opções</li>
        <li>É direcionado para um consultor humano</li>
        <li>Esse consultor fica dedicado ao seu atendimento</li>
        <li>Conversa fica salva para futuras consultas</li>
      </ol>

      <h3>Vantagens do WhatsApp</h3>
      <ul>
        <li>
          <strong>Histórico de conversas:</strong> Tudo que foi dito fica registrado
        </li>
        <li>
          <strong>Envio de arquivos:</strong> Fotos de documentos, prints, PDFs
        </li>
        <li>
          <strong>Notificações:</strong> Você recebe alerta quando chega resposta
        </li>
        <li>
          <strong>Consultor dedicado:</strong> Mesmo profissional te acompanha do início ao fim
        </li>
        <li>
          <strong>Praticidade:</strong> Atendimento no app que você já usa diariamente
        </li>
      </ul>

      <h3>Tempo de resposta</h3>
      <ul>
        <li>Horário comercial: Até 30 minutos</li>
        <li>Horário de pico: Até 1 hora</li>
        <li>Fora do horário: Resposta no próximo dia útil</li>
      </ul>

      <h3>Boas práticas no WhatsApp</h3>
      <ul>
        <li>
          <strong>Apresente-se:</strong> Na primeira mensagem, diga seu nome e o que precisa
        </li>
        <li>
          <strong>Seja direto:</strong> &quot;Olá, gostaria de saber sobre bolsas para Medicina em São
          Paulo&quot;
        </li>
        <li>
          <strong>Aguarde resposta:</strong> Evite enviar várias mensagens seguidas
        </li>
        <li>
          <strong>Fotos legíveis:</strong> Se enviar documentos, certifique-se que estão nítidos
        </li>
        <li>
          <strong>Use o mesmo número:</strong> Facilita o consultor te reconhecer
        </li>
      </ul>

      <h2>Atendimento via Chat no site</h2>

      <h3>Como funciona</h3>
      <p>
        O chat ao vivo está disponível em todas as páginas do nosso site:
      </p>
      <ol>
        <li>Procure o ícone de balão de conversa (canto inferior direito)</li>
        <li>Clique e a janela de chat abre</li>
        <li>Digite sua mensagem</li>
        <li>Aguarde conexão com um atendente (geralmente instantâneo)</li>
        <li>Converse em tempo real</li>
      </ol>

      <h3>Vantagens do Chat</h3>
      <ul>
        <li>
          <strong>Atendimento instantâneo:</strong> Fila de espera mínima
        </li>
        <li>
          <strong>Sem sair do site:</strong> Continue navegando enquanto conversa
        </li>
        <li>
          <strong>Compartilhamento de links:</strong> Atendente pode enviar links de cursos
          diretamente
        </li>
        <li>
          <strong>Transcrição por e-mail:</strong> Ao final, receba cópia da conversa
        </li>
      </ul>

      <h3>Tempo de resposta</h3>
      <ul>
        <li>Conexão inicial: Imediato a 2 minutos</li>
        <li>Respostas durante conversa: 1 a 5 minutos</li>
      </ul>

      <h3>Boas práticas no Chat</h3>
      <ul>
        <li>
          <strong>Informe seus dados:</strong> Nome, e-mail, telefone (para continuidade)
        </li>
        <li>
          <strong>Fique atento:</strong> Atendente aguarda resposta por tempo limitado
        </li>
        <li>
          <strong>Salve a transcrição:</strong> Peça envio por e-mail ao final
        </li>
        <li>
          <strong>Use para dúvidas rápidas:</strong> Questões complexas são melhor tratadas por
          e-mail
        </li>
      </ul>

      <h2>Atendimento via E-mail</h2>

      <h3>Como funciona</h3>
      <p>
        O e-mail é nosso canal formal de atendimento:
      </p>
      <ol>
        <li>Envie mensagem para contato@bolsaclick.com.br</li>
        <li>Inclua assunto claro (&quot;Dúvida sobre reembolso&quot;, &quot;Solicitação de
          documentos&quot;)</li>
        <li>Descreva detalhadamente sua questão</li>
        <li>Anexe arquivos relevantes (se necessário)</li>
        <li>Aguarde resposta em até 24 horas úteis</li>
      </ol>

      <h3>Vantagens do E-mail</h3>
      <ul>
        <li>
          <strong>Registro formal:</strong> Tudo fica documentado e rastreável
        </li>
        <li>
          <strong>Anexos múltiplos:</strong> Envie vários arquivos grandes
        </li>
        <li>
          <strong>Tempo para elaborar:</strong> Escreva com calma e detalhes
        </li>
        <li>
          <strong>Protocolo de atendimento:</strong> Recebe número para acompanhamento
        </li>
        <li>
          <strong>Respostas detalhadas:</strong> Nossa equipe responde com informações completas
        </li>
      </ul>

      <h3>Tempo de resposta</h3>
      <ul>
        <li>E-mails recebidos em horário comercial: Até 24 horas</li>
        <li>E-mails recebidos fora do horário: Próximo dia útil</li>
        <li>Questões complexas: Até 48 horas (sempre avisamos se precisar de mais tempo)</li>
      </ul>

      <h3>Boas práticas no E-mail</h3>
      <ul>
        <li>
          <strong>Assunto descritivo:</strong> &quot;Reembolso - João Silva - CPF 123.456.789-00&quot;
        </li>
        <li>
          <strong>Cumprimento e assinatura:</strong> Seja educado e assine com seus dados
        </li>
        <li>
          <strong>Texto organizado:</strong> Use parágrafos, tópicos, negrito para destacar
        </li>
        <li>
          <strong>Anexos nomeados:</strong> &quot;RG_JoaoSilva.pdf&quot; em vez de
          &quot;documento1.pdf&quot;
        </li>
        <li>
          <strong>Evite múltiplos e-mails:</strong> Compile tudo em uma única mensagem
        </li>
      </ul>

      <h2>Exemplo de uso de cada canal</h2>

      <h3>Situação 1: Dúvida rápida sobre curso</h3>
      <p>
        <strong>Melhor canal:</strong> Chat ou WhatsApp
      </p>
      <p>
        &quot;Olá! O curso de Enfermagem da UNIP tem estágio obrigatório?&quot;
      </p>

      <h3>Situação 2: Acompanhar processo de matrícula</h3>
      <p>
        <strong>Melhor canal:</strong> WhatsApp
      </p>
      <p>
        &quot;Oi! Enviei os documentos ontem. Já foram analisados pela faculdade?&quot;
      </p>

      <h3>Situação 3: Solicitar reembolso com comprovantes</h3>
      <p>
        <strong>Melhor canal:</strong> E-mail
      </p>
      <p>
        Assunto: Solicitação de Reembolso - Maria Santos - CPF XXX
        <br />
        Corpo: Explicação detalhada + anexos (comprovante pagamento, e-mail da faculdade, etc.)
      </p>

      <h3>Situação 4: Problema urgente (boleto vence hoje)</h3>
      <p>
        <strong>Melhor canal:</strong> WhatsApp ou Telefone
      </p>
      <p>
        &quot;URGENTE: Meu boleto vence hoje mas o desconto não foi aplicado. Preciso de ajuda!&quot;
      </p>

      <h2>Integração entre canais</h2>
      <p>
        Nossos sistemas são integrados. Isso significa:
      </p>
      <ul>
        <li>Se você começou no chat, pode continuar por e-mail (e vice-versa)</li>
        <li>Seu histórico de atendimento fica registrado em todos os canais</li>
        <li>Consultores têm acesso ao que foi conversado anteriormente</li>
        <li>Você não precisa repetir informações</li>
      </ul>

      <h2>Privacidade e segurança</h2>
      <p>
        Em todos os canais:
      </p>
      <ul>
        <li>Suas conversas são privadas e criptografadas</li>
        <li>Dados pessoais são tratados conforme LGPD</li>
        <li>Não compartilhamos informações com terceiros</li>
        <li>Arquivos enviados ficam em servidores seguros</li>
      </ul>

      <h2>Satisfação com o atendimento</h2>
      <p>
        Ao final de cada interação, você pode:
      </p>
      <ul>
        <li>Avaliar o atendimento (estrelas ou nota)</li>
        <li>Deixar comentário sobre a experiência</li>
        <li>Sugerir melhorias</li>
      </ul>
      <p>
        Usamos esses feedbacks para treinar nossa equipe e melhorar continuamente.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Todos os canais de contato',
            description: 'Veja resumo de como falar com o Bolsa Click',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
          {
            title: 'Horários de atendimento',
            description: 'Confira quando cada canal está disponível',
            href: '/central-de-ajuda/atendimento-suporte/horarios',
          },
          {
            title: 'Acompanhar status da bolsa',
            description: 'Saiba como consultar andamento da sua solicitação',
            href: '/central-de-ajuda/atendimento-suporte/acompanhamento',
          },
        ]}
      />
    </ArticleLayout>
  )
}
