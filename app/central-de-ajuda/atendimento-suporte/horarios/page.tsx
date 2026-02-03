import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Horário de atendimento | Central de Ajuda',
  description:
    'Confira os horários de funcionamento de cada canal do Bolsa Click, atendimento em feriados e o que fazer em caso de urgência fora do horário.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte/horarios',
  },
}

export default function HorariosPage() {
  return (
    <ArticleLayout
      category="Atendimento e Suporte"
      categoryHref="/central-de-ajuda/atendimento-suporte"
      title="Horário de atendimento"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Nosso atendimento funciona de segunda a sexta das 8h às 20h e aos sábados das 9h às 15h
          (horário de Brasília). WhatsApp, chat e telefone seguem esses horários. E-mail recebe
          mensagens 24/7, mas respostas são enviadas em horário comercial. Não atendemos domingos e
          feriados nacionais.
        </p>
      </QuickAnswer>

      <h2>Horários por canal de atendimento</h2>

      <h3>WhatsApp</h3>
      <ul>
        <li>
          <strong>Segunda a sexta:</strong> 8h às 20h
        </li>
        <li>
          <strong>Sábado:</strong> 9h às 15h
        </li>
        <li>
          <strong>Domingo e feriados:</strong> Não há atendimento
        </li>
      </ul>
      <p>
        <strong>Observação:</strong> Você pode enviar mensagens fora do horário. Elas serão
        respondidas no próximo dia útil pela manhã.
      </p>

      <h3>Chat no site</h3>
      <ul>
        <li>
          <strong>Segunda a sexta:</strong> 8h às 20h
        </li>
        <li>
          <strong>Sábado:</strong> 9h às 15h
        </li>
        <li>
          <strong>Domingo e feriados:</strong> Não há atendimento
        </li>
      </ul>
      <p>
        <strong>Observação:</strong> Fora do horário, o chat fica offline. Você pode deixar uma
        mensagem que será respondida quando voltarmos.
      </p>

      <h3>Telefone</h3>
      <ul>
        <li>
          <strong>Segunda a sexta:</strong> 8h às 20h
        </li>
        <li>
          <strong>Sábado:</strong> 9h às 15h
        </li>
        <li>
          <strong>Domingo e feriados:</strong> Não há atendimento
        </li>
      </ul>
      <p>
        <strong>Observação:</strong> Ligações fora do horário recebem mensagem automática orientando
        a usar outros canais ou aguardar retorno.
      </p>

      <h3>E-mail</h3>
      <ul>
        <li>
          <strong>Envio de mensagens:</strong> 24 horas, 7 dias por semana
        </li>
        <li>
          <strong>Respostas:</strong> Em horário comercial (segunda a sexta, 8h às 20h | sábado, 9h às
          15h)
        </li>
        <li>
          <strong>Prazo de resposta:</strong> Até 24 horas úteis
        </li>
      </ul>
      <p>
        <strong>Observação:</strong> E-mails enviados sexta à noite ou finais de semana são
        respondidos na segunda-feira.
      </p>

      <h2>Horários especiais</h2>

      <h3>Feriados nacionais</h3>
      <p>Não há atendimento nos seguintes feriados:</p>
      <ul>
        <li>Ano Novo (1º de janeiro)</li>
        <li>Carnaval (terça-feira de Carnaval)</li>
        <li>Sexta-feira Santa</li>
        <li>Tiradentes (21 de abril)</li>
        <li>Dia do Trabalho (1º de maio)</li>
        <li>Corpus Christi (quando ponto facultativo)</li>
        <li>Independência do Brasil (7 de setembro)</li>
        <li>Nossa Senhora Aparecida (12 de outubro)</li>
        <li>Finados (2 de novembro)</li>
        <li>Proclamação da República (15 de novembro)</li>
        <li>Consciência Negra (20 de novembro, quando aplicável)</li>
        <li>Natal (25 de dezembro)</li>
        <li>Réveillon (31 de dezembro - expediente reduzido)</li>
      </ul>

      <h3>Vésperas de feriados</h3>
      <p>
        Em vésperas de feriados prolongados (como Natal e Ano Novo), podemos ter horário reduzido.
        Sempre avisamos com antecedência nos canais de comunicação.
      </p>

      <h3>Período de férias coletivas</h3>
      <p>
        Geralmente entre 24 de dezembro e 2 de janeiro, mantemos atendimento reduzido ou suspenso.
        Informamos previamente por e-mail e avisos no site.
      </p>

      <h2>Fuso horário</h2>
      <p>
        <strong>Todos os horários são referentes ao horário de Brasília (GMT-3).</strong>
      </p>
      <p>Se você está em outro fuso, ajuste conforme sua localização:</p>
      <ul>
        <li>Acre e Amazonas: -1 hora (7h às 19h de segunda a sexta)</li>
        <li>Fernando de Noronha: +1 hora (9h às 21h de segunda a sexta)</li>
      </ul>

      <h2>Picos de atendimento</h2>
      <p>Horários com maior volume de contatos (espera pode ser um pouco maior):</p>
      <ul>
        <li>
          <strong>8h às 9h:</strong> Início do expediente
        </li>
        <li>
          <strong>12h às 14h:</strong> Horário de almoço
        </li>
        <li>
          <strong>18h às 20h:</strong> Final do expediente
        </li>
        <li>
          <strong>Segundas-feiras:</strong> Retorno do fim de semana
        </li>
        <li>
          <strong>Início e meio de mês:</strong> Prazos de matrícula e pagamentos
        </li>
      </ul>
      <p>
        <strong>Dica:</strong> Se possível, evite esses horários para ter atendimento mais rápido.
        Meados da manhã (10h-11h) e meio da tarde (15h-17h) costumam ter menos fila.
      </p>

      <h2>O que fazer fora do horário de atendimento</h2>

      <h3>Se não for urgente</h3>
      <ul>
        <li>
          <strong>Envie mensagem por WhatsApp ou e-mail:</strong> Será respondido no próximo horário
          de atendimento
        </li>
        <li>
          <strong>Consulte a Central de Ajuda:</strong> Muitas dúvidas têm resposta imediata aqui
        </li>
        <li>
          <strong>Navegue pelo site:</strong> Busque cursos, compare opções, simule valores
        </li>
      </ul>

      <h3>Se for urgente</h3>
      <ul>
        <li>
          <strong>Envie WhatsApp marcando como urgente:</strong> Equipe prioriza ao retornar
        </li>
        <li>
          <strong>Ligue e deixe recado:</strong> Se houver URA, deixe mensagem para retorno prioritário
        </li>
        <li>
          <strong>Envie e-mail com assunto URGENTE:</strong> Equipe verifica caixa prioritária ao
          iniciar expediente
        </li>
      </ul>

      <h3>Emergências reais</h3>
      <p>
        Para situações críticas (prazo de matrícula vencendo em poucas horas, problema grave com
        documentação, etc.), nossa equipe eventualmente monitora mensagens mesmo fora do horário.
      </p>
      <p>
        Porém, isso não é garantido. Sempre que possível, entre em contato em horário comercial ou
        com antecedência.
      </p>

      <h2>Tempo de espera por canal</h2>

      <h3>Em horário normal</h3>
      <ul>
        <li>
          <strong>Chat:</strong> Conexão imediata a 2 minutos
        </li>
        <li>
          <strong>WhatsApp:</strong> Resposta em até 30 minutos
        </li>
        <li>
          <strong>Telefone:</strong> Fila de espera de 1 a 5 minutos
        </li>
        <li>
          <strong>E-mail:</strong> Resposta em até 24 horas úteis
        </li>
      </ul>

      <h3>Em horário de pico</h3>
      <ul>
        <li>
          <strong>Chat:</strong> Até 5 minutos
        </li>
        <li>
          <strong>WhatsApp:</strong> Até 1 hora
        </li>
        <li>
          <strong>Telefone:</strong> Até 10 minutos de espera
        </li>
        <li>
          <strong>E-mail:</strong> Até 48 horas (sempre avisamos se precisar de mais tempo)
        </li>
      </ul>

      <h2>Atendimento em períodos de alta demanda</h2>
      <p>
        Em períodos de processos seletivos (janeiro/fevereiro e julho/agosto), o volume de contatos
        aumenta. Para garantir qualidade:
      </p>
      <ul>
        <li>Reforçamos a equipe de atendimento</li>
        <li>Estendemos horários quando necessário</li>
        <li>Priorizamos casos urgentes</li>
        <li>Enviamos comunicados proativos para reduzir dúvidas</li>
      </ul>

      <h2>Comunicação proativa</h2>
      <p>
        Não espere apenas você nos procurar. Nós também entramos em contato:
      </p>
      <ul>
        <li>Após você garantir uma bolsa (orientações sobre próximos passos)</li>
        <li>Quando há atualizações no status da matrícula</li>
        <li>Se detectamos algum problema que precisa de sua atenção</li>
        <li>Para confirmar dados ou documentos</li>
        <li>Lembretes de prazos importantes</li>
      </ul>

      <h2>Autoatendimento 24/7</h2>
      <p>
        Mesmo fora do horário de atendimento humano, você tem acesso a:
      </p>
      <ul>
        <li>
          <strong>Central de Ajuda:</strong> Artigos completos sobre todos os temas (disponível agora!)
        </li>
        <li>
          <strong>Portal do estudante:</strong> Acompanhe status de matrícula e documentos
        </li>
        <li>
          <strong>Busca de cursos:</strong> Pesquise e compare bolsas 24 horas por dia
        </li>
        <li>
          <strong>FAQ no site:</strong> Perguntas frequentes com respostas imediatas
        </li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Como falar conosco',
            description: 'Veja todos os canais de contato disponíveis',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
          {
            title: 'WhatsApp, chat e e-mail',
            description: 'Detalhes sobre como usar cada canal',
            href: '/central-de-ajuda/atendimento-suporte/whatsapp-chat-email',
          },
          {
            title: 'Problemas comuns',
            description: 'Resolva dúvidas frequentes sem precisar esperar atendimento',
            href: '/central-de-ajuda/atendimento-suporte/problemas-comuns',
          },
        ]}
      />
    </ArticleLayout>
  )
}
