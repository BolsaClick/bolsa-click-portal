import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Comunicação oficial do Bolsa Click | Central de Ajuda',
  description:
    'Aprenda a identificar e-mails e mensagens legítimas do Bolsa Click, proteja-se contra golpes e phishing, e conheça nossos canais oficiais.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/comunicacao-oficial',
  },
}

export default function ComunicacaoOficialPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Comunicação oficial do Bolsa Click"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          E-mails oficiais vêm de @bolsaclick.com.br, nosso WhatsApp é (11) 99999-9999, e o site
          oficial é bolsaclick.com.br (sempre com HTTPS e cadeado verde). Nunca pedimos senha por
          e-mail, dados bancários completos ou pagamentos para contas pessoais. Desconfie de urgências
          exageradas e sempre confira remetentes antes de clicar em links.
        </p>
      </QuickAnswer>

      <h2>Canais oficiais de comunicação</h2>

      <h3>E-mail</h3>
      <p>
        Nossos e-mails sempre vêm de domínios oficiais:
      </p>
      <ul>
        <li>
          <strong>noreply@bolsaclick.com.br:</strong> E-mails automáticos (confirmações, notificações)
        </li>
        <li>
          <strong>contato@bolsaclick.com.br:</strong> Atendimento geral
        </li>
        <li>
          <strong>suporte@bolsaclick.com.br:</strong> Suporte técnico
        </li>
        <li>
          <strong>dpo@bolsaclick.com.br:</strong> Questões de privacidade
        </li>
        <li>
          <strong>nome@bolsaclick.com.br:</strong> E-mails individuais de consultores
        </li>
      </ul>
      <p>
        <strong>Atenção:</strong> Qualquer e-mail que NÃO termine com @bolsaclick.com.br não é oficial
        (ex: bolsaclick@gmail.com, bolsaclick.info@hotmail.com são FALSOS).
      </p>

      <h3>WhatsApp</h3>
      <p>
        <strong>Número oficial:</strong> (11) 99999-9999
      </p>
      <ul>
        <li>Perfil verificado com selo verde (quando disponível)</li>
        <li>Nome exibido: &quot;Bolsa Click&quot;</li>
        <li>Foto de perfil: Logotipo oficial do Bolsa Click</li>
      </ul>
      <p>
        <strong>Atenção:</strong> Não atendemos por números pessoais, apenas pelo número oficial.
        Desconfie de mensagens de outros números.
      </p>

      <h3>Site</h3>
      <p>
        <strong>URL oficial:</strong> https://www.bolsaclick.com.br
      </p>
      <ul>
        <li>Sempre com HTTPS (cadeado verde na barra de endereço)</li>
        <li>Certificado SSL válido (pode verificar clicando no cadeado)</li>
      </ul>
      <p>
        <strong>Atenção:</strong> Sites parecidos como bolsaclick.net, bolsa-click.com,
        bolsaclickbrasil.com NÃO são nossos.
      </p>

      <h3>Redes sociais oficiais</h3>
      <ul>
        <li>
          <strong>Instagram:</strong> @bolsaclick (perfil verificado com selo azul)
        </li>
        <li>
          <strong>Facebook:</strong> facebook.com/bolsaclick
        </li>
        <li>
          <strong>LinkedIn:</strong> linkedin.com/company/bolsaclick
        </li>
      </ul>

      <h2>Como identificar e-mails legítimos</h2>

      <h3>Características de e-mails oficiais</h3>
      <ul>
        <li>
          <strong>Remetente:</strong> Domínio @bolsaclick.com.br
        </li>
        <li>
          <strong>Personalização:</strong> Chamam você pelo nome cadastrado
        </li>
        <li>
          <strong>Logotipo e identidade visual:</strong> Padrão profissional, sem erros gráficos
        </li>
        <li>
          <strong>Ortografia correta:</strong> Sem erros de português
        </li>
        <li>
          <strong>Links diretos para bolsaclick.com.br:</strong> Passe o mouse sobre links (sem
          clicar) para ver URL de destino
        </li>
        <li>
          <strong>Assinatura completa:</strong> Nome do consultor (quando aplicável), cargo, contatos
          oficiais
        </li>
      </ul>

      <h3>Tipos de e-mails que enviamos</h3>
      <ul>
        <li>Confirmação de cadastro ou pré-matrícula</li>
        <li>Atualizações sobre status da matrícula</li>
        <li>Solicitação de documentos ou correções</li>
        <li>Confirmação de pagamentos</li>
        <li>Alertas de novos cursos ou bolsas (se você optou por receber)</li>
        <li>Respostas às suas solicitações de suporte</li>
      </ul>

      <h2>O que NUNCA pedimos</h2>
      <p>
        O Bolsa Click jamais solicita:
      </p>
      <ul>
        <li>
          <strong>Senha da sua conta:</strong> Jamais pedimos senha por e-mail, WhatsApp ou telefone
        </li>
        <li>
          <strong>Número completo de cartão de crédito:</strong> Pagamentos são feitos via gateway
          seguro, não por mensagem
        </li>
        <li>
          <strong>Código de segurança (CVV) do cartão:</strong> Essa informação nunca é solicitada
          fora do ambiente seguro de pagamento
        </li>
        <li>
          <strong>Senha bancária ou token:</strong> Não temos motivo para solicitar acesso ao seu
          banco
        </li>
        <li>
          <strong>Pagamentos para contas pessoais:</strong> Pagamentos sempre via sistema oficial ou
          boletos nominais
        </li>
        <li>
          <strong>Transferências via Pix para CPF pessoal:</strong> Pix do Bolsa Click é sempre para
          CNPJ
        </li>
      </ul>

      <h2>Golpes comuns (phishing)</h2>
      <p>
        Golpistas tentam se passar pelo Bolsa Click. Fique atento a:
      </p>

      <h3>E-mail falso de &quot;urgência&quot;</h3>
      <p>
        <strong>Golpe:</strong> &quot;Sua matrícula será cancelada em 24h! Clique aqui para
        regularizar.&quot;
      </p>
      <p>
        <strong>Realidade:</strong> Sempre damos prazos razoáveis e notificamos por múltiplos canais
        (e-mail + WhatsApp). Nunca usamos tom alarmista.
      </p>

      <h3>Pedido de &quot;revalidação de dados&quot;</h3>
      <p>
        <strong>Golpe:</strong> &quot;Atualize seus dados bancários clicando neste link.&quot;
      </p>
      <p>
        <strong>Realidade:</strong> Não pedimos atualização de dados por link em e-mail. Se precisar
        atualizar algo, orientamos você a acessar o portal diretamente.
      </p>

      <h3>Bolsa &quot;grátis&quot; mas com taxa antecipada</h3>
      <p>
        <strong>Golpe:</strong> &quot;Você ganhou bolsa 100%! Pague apenas R$ 500 de taxa
        administrativa.&quot;
      </p>
      <p>
        <strong>Realidade:</strong> Nosso modelo é transparente. Bolsa 100% significa que você não
        paga mensalidade. A pré-matrícula (R$ 50-150) está sempre clara antes de você se comprometer.
      </p>

      <h3>WhatsApp falso</h3>
      <p>
        <strong>Golpe:</strong> Mensagem de número desconhecido dizendo ser do Bolsa Click, pedindo
        pagamento urgente.
      </p>
      <p>
        <strong>Realidade:</strong> Nosso número é sempre o mesmo: (11) 99999-9999. Se receber de
        outro número, não é oficial.
      </p>

      <h3>Site falso (clone)</h3>
      <p>
        <strong>Golpe:</strong> Site visualmente parecido com bolsaclick.com.br, mas com URL diferente
        (ex: bolsaclick-brasil.com).
      </p>
      <p>
        <strong>Realidade:</strong> Sempre verifique a URL. Nossa única URL é bolsaclick.com.br.
      </p>

      <h2>Como se proteger</h2>

      <h3>Verificações básicas</h3>
      <ol>
        <li>
          <strong>Confira o remetente:</strong> E-mail termina com @bolsaclick.com.br?
        </li>
        <li>
          <strong>Passe mouse sobre links (sem clicar):</strong> Vão para bolsaclick.com.br?
        </li>
        <li>
          <strong>Leia com calma:</strong> Há erros de português ou tom alarmista exagerado?
        </li>
        <li>
          <strong>Questione urgências:</strong> Se diz &quot;último aviso&quot; mas você não recebeu
          avisos anteriores, é suspeito
        </li>
        <li>
          <strong>Não clique em links suspeitos:</strong> Acesse o site diretamente digitando a URL
        </li>
      </ol>

      <h3>Se tiver dúvida</h3>
      <ul>
        <li>
          <strong>Entre em contato pelos canais oficiais:</strong> Pergunte se aquele e-mail ou
          mensagem é real
        </li>
        <li>
          <strong>Não responda diretamente à mensagem suspeita:</strong> Use nosso WhatsApp, chat ou
          e-mail oficial
        </li>
        <li>
          <strong>Encaminhe para conferência:</strong> Envie print ou encaminhe o e-mail suspeito para
          contato@bolsaclick.com.br
        </li>
      </ul>

      <h2>Se você caiu em um golpe</h2>
      <p>
        Se você forneceu informações ou fez pagamento para golpistas:
      </p>
      <ol>
        <li>
          <strong>Avise-nos imediatamente:</strong> Entre em contato urgente pelo WhatsApp ou telefone
        </li>
        <li>
          <strong>Mude sua senha:</strong> Se compartilhou senha, altere imediatamente
        </li>
        <li>
          <strong>Contate seu banco:</strong> Se forneceu dados bancários ou fez transferência, avise
          seu banco para bloquear
        </li>
        <li>
          <strong>Registre boletim de ocorrência:</strong> Delegacia ou delegacia virtual (fundamental
          para processos)
        </li>
        <li>
          <strong>Bloqueie contatos falsos:</strong> No WhatsApp, e-mail, etc.
        </li>
      </ol>
      <p>
        Nossa equipe te auxiliará no que for possível, mas não conseguimos reembolsar valores pagos a
        golpistas (eles não têm relação conosco).
      </p>

      <h2>Reportar tentativas de golpe</h2>
      <p>
        Se você recebeu comunicação suspeita se passando pelo Bolsa Click:
      </p>
      <ul>
        <li>
          <strong>Encaminhe para:</strong> seguranca@bolsaclick.com.br
        </li>
        <li>
          <strong>Inclua:</strong> Print ou encaminhamento completo (com cabeçalhos se possível)
        </li>
        <li>
          <strong>Ajude a comunidade:</strong> Reportar nos ajuda a tomar ações legais e alertar outros
          estudantes
        </li>
      </ul>

      <h2>Comunicações legítimas mas suspeitas?</h2>
      <p>
        Às vezes, comunicações legítimas podem parecer suspeitas. Se você não tem certeza:
      </p>
      <ul>
        <li>
          <strong>Ligue para nós:</strong> (11) 3000-0000 (horário comercial)
        </li>
        <li>
          <strong>Mande WhatsApp:</strong> (11) 99999-9999
        </li>
        <li>
          <strong>Acesse o portal diretamente:</strong> Digite bolsaclick.com.br/portal na barra de
          endereço
        </li>
      </ul>
      <p>
        Preferimos que você confira conosco dez vezes a cair em um golpe uma vez!
      </p>

      <h2>Educação e conscientização</h2>
      <p>
        Periodicamente, publicamos alertas sobre golpes nas redes sociais e enviamos e-mails
        educativos sobre segurança. Fique atento às nossas comunicações oficiais para se manter
        protegido.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Como protegemos seus dados',
            description: 'Veja todas as camadas de segurança que utilizamos',
            href: '/central-de-ajuda/seguranca-dados-privacidade/protecao-dados',
          },
          {
            title: 'Como falar conosco',
            description: 'Todos os canais oficiais de atendimento',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
          {
            title: 'LGPD e seus direitos',
            description: 'Entenda seus direitos sobre privacidade de dados',
            href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
          },
        ]}
      />
    </ArticleLayout>
  )
}
