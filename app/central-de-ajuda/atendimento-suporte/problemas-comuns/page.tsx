import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Problemas comuns e como resolver | Central de Ajuda',
  description:
    'Soluções rápidas para os problemas e dúvidas mais frequentes: boleto errado, acesso negado, documentos recusados e muito mais.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte/problemas-comuns',
  },
}

export default function ProblemasComunsPage() {
  return (
    <ArticleLayout
      category="Atendimento e Suporte"
      categoryHref="/central-de-ajuda/atendimento-suporte"
      title="Problemas comuns e como resolver"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          A maioria dos problemas tem solução rápida: boleto com valor errado (entre em contato antes
          de pagar), não consigo acessar o portal (use recuperação de senha), documento recusado
          (verifique qualidade da imagem), desconto não aplicado (avise imediatamente). Veja soluções
          detalhadas abaixo para cada situação.
        </p>
      </QuickAnswer>

      <h2>Problema 1: Boleto com valor errado</h2>

      <h3>Situação</h3>
      <p>
        Você recebeu o boleto da mensalidade mas o desconto da bolsa não foi aplicado ou o valor está
        diferente do esperado.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Não pague o boleto:</strong> Aguarde correção
        </li>
        <li>
          <strong>Verifique o termo de adesão:</strong> Confirme qual era o percentual de desconto
          garantido
        </li>
        <li>
          <strong>Entre em contato imediatamente:</strong> Via WhatsApp ou telefone
        </li>
        <li>
          <strong>Informe:</strong> CPF, nome, curso, valor que deveria ser e valor que veio
        </li>
        <li>
          <strong>Aguarde:</strong> Intermediamos com a faculdade e um novo boleto correto é emitido
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Sempre confira o primeiro boleto assim que receber. Problemas corrigidos antes do vencimento
        são resolvidos mais rapidamente.
      </p>

      <h2>Problema 2: Não consigo acessar o portal do estudante</h2>

      <h3>Situação</h3>
      <p>
        Você tenta fazer login no portal do Bolsa Click mas recebe mensagem de erro ou senha
        incorreta.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Verifique se está no site correto:</strong> bolsaclick.com.br/portal
        </li>
        <li>
          <strong>Confirme o CPF:</strong> Digite sem pontos e traços
        </li>
        <li>
          <strong>Use recuperação de senha:</strong> Clique em &quot;Esqueci minha senha&quot;
        </li>
        <li>
          <strong>Verifique e-mail:</strong> Link de recuperação chega em até 5 minutos (confira spam)
        </li>
        <li>
          <strong>Crie nova senha:</strong> Siga instruções do e-mail
        </li>
        <li>
          <strong>Se persistir:</strong> Entre em contato via WhatsApp ou chat
        </li>
      </ol>

      <h3>Dicas</h3>
      <ul>
        <li>Use navegador atualizado (Chrome, Firefox, Edge, Safari)</li>
        <li>Limpe cache e cookies se der erro constante</li>
        <li>Tente em modo anônimo/privado para testar</li>
      </ul>

      <h2>Problema 3: Documento recusado pela faculdade</h2>

      <h3>Situação</h3>
      <p>
        Você enviou documentos mas recebeu notificação de que estão ilegíveis, incompletos ou
        incorretos.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Leia atentamente o motivo:</strong> E-mail ou WhatsApp informa o que está errado
        </li>
        <li>
          <strong>Verifique qualidade da imagem:</strong> Legível, sem cortes, sem sombras
        </li>
        <li>
          <strong>Confira se enviou o documento certo:</strong> Às vezes enviamos RG em vez de CPF por
          engano
        </li>
        <li>
          <strong>Tire nova foto ou escaneie novamente:</strong> Com boa iluminação, foco nítido
        </li>
        <li>
          <strong>Envie imediatamente:</strong> Atenção ao prazo de regularização
        </li>
        <li>
          <strong>Confirme recebimento:</strong> Peça confirmação de que o novo arquivo está OK
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Antes de enviar, abra a imagem e leia você mesmo. Se você não conseguir ler algum texto, a
        faculdade também não conseguirá.
      </p>

      <h2>Problema 4: Não recebi e-mail de confirmação</h2>

      <h3>Situação</h3>
      <p>
        Você garantiu a bolsa ou enviou documentos mas não recebeu e-mail confirmando.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Aguarde 15 minutos:</strong> E-mails automáticos podem demorar um pouco
        </li>
        <li>
          <strong>Verifique caixa de spam/lixo eletrônico:</strong> Muitos e-mails automáticos vão
          para lá
        </li>
        <li>
          <strong>Confira se digitou e-mail corretamente:</strong> No cadastro ou envio
        </li>
        <li>
          <strong>Adicione noreply@bolsaclick.com.br aos contatos:</strong> Melhora entrega futura
        </li>
        <li>
          <strong>Solicite reenvio:</strong> Via WhatsApp, chat ou telefone
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Sempre confira se o e-mail cadastrado está correto antes de finalizar qualquer ação. Use um
        e-mail que você acessa regularmente.
      </p>

      <h2>Problema 5: Prazo de envio de documentos venceu</h2>

      <h3>Situação</h3>
      <p>
        Você perdeu o prazo para enviar documentação e agora o sistema não permite mais upload.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Entre em contato imediatamente:</strong> Quanto mais rápido, maiores as chances de
          prorrogação
        </li>
        <li>
          <strong>Explique o motivo:</strong> Justificativas válidas podem resultar em extensão de
          prazo
        </li>
        <li>
          <strong>Envie documentos via WhatsApp ou e-mail:</strong> Enquanto aguarda resposta oficial
        </li>
        <li>
          <strong>Aguarde análise:</strong> Verificaremos com a faculdade se ainda é possível seguir
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Não deixe para a última hora. Assim que garantir a bolsa, já comece a reunir e enviar
        documentos.
      </p>

      <h2>Problema 6: Pagamento do Pix não foi confirmado</h2>

      <h3>Situação</h3>
      <p>
        Você pagou a pré-matrícula via Pix mas não recebeu confirmação.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Aguarde até 30 minutos:</strong> Pix é rápido mas confirmação pode demorar um pouco
        </li>
        <li>
          <strong>Verifique se o pagamento saiu da sua conta:</strong> Confira extrato bancário
        </li>
        <li>
          <strong>Tire print do comprovante:</strong> Mostrando data, hora, valor e destinatário
        </li>
        <li>
          <strong>Envie comprovante via WhatsApp:</strong> Nossa equipe confirma manualmente
        </li>
        <li>
          <strong>Não pague novamente:</strong> Evite duplicidade, aguarde orientação
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Sempre confira se copiou o código Pix corretamente antes de pagar. Verifique o nome do
        beneficiário.
      </p>

      <h2>Problema 7: Quero trocar de curso mas já paguei</h2>

      <h3>Situação</h3>
      <p>
        Você garantiu bolsa para um curso mas mudou de ideia e quer outro curso.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Entre em contato rapidamente:</strong> Quanto antes, mais fácil fazer alteração
        </li>
        <li>
          <strong>Informe o novo curso desejado:</strong> Precisamos verificar disponibilidade
        </li>
        <li>
          <strong>Aguarde verificação:</strong> Checamos se há bolsa disponível e condições
        </li>
        <li>
          <strong>Possíveis cenários:</strong>
          <ul>
            <li>Transferência sem custo adicional (se valor for igual ou menor)</li>
            <li>Pagamento de diferença (se novo curso for mais caro)</li>
            <li>Reembolso parcial (se novo curso for mais barato)</li>
          </ul>
        </li>
      </ol>

      <h3>Prevenção</h3>
      <p>
        Pesquise bem antes de garantir a bolsa. Leia sobre o curso, grade curricular, mercado de
        trabalho. Tire todas as dúvidas com nosso suporte.
      </p>

      <h2>Problema 8: Não consigo entrar em contato com a faculdade</h2>

      <h3>Situação</h3>
      <p>
        Você precisa falar com a instituição mas não consegue contato ou não recebe resposta.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Entre em contato com o Bolsa Click:</strong> Nós intermediamos comunicação
        </li>
        <li>
          <strong>Explique o motivo:</strong> O que você precisa da faculdade
        </li>
        <li>
          <strong>Fornecemos canais diretos:</strong> Telefones e e-mails específicos da secretaria
        </li>
        <li>
          <strong>Se necessário, cobramos:</strong> Facilitamos o diálogo entre você e a instituição
        </li>
      </ol>

      <h3>Dica</h3>
      <p>
        Sempre que possível, use o Bolsa Click como ponte. Temos contato direto com as instituições
        parceiras e conseguimos respostas mais rápidas.
      </p>

      <h2>Problema 9: Site ou portal está fora do ar</h2>

      <h3>Situação</h3>
      <p>
        Você tenta acessar nosso site ou portal mas recebe erro ou página não carrega.
      </p>

      <h3>Solução</h3>
      <ol>
        <li>
          <strong>Verifique sua internet:</strong> Teste outros sites para confirmar que não é sua
          conexão
        </li>
        <li>
          <strong>Tente outro navegador:</strong> Chrome, Firefox, Edge, Safari
        </li>
        <li>
          <strong>Limpe cache e cookies:</strong> Às vezes resolvem problemas de carregamento
        </li>
        <li>
          <strong>Aguarde alguns minutos:</strong> Pode ser manutenção temporária
        </li>
        <li>
          <strong>Entre em contato por outro canal:</strong> WhatsApp, telefone, redes sociais
        </li>
      </ol>

      <h3>Observação</h3>
      <p>
        Raramente temos instabilidade, mas se houver manutenção programada, avisamos com antecedência
        nas redes sociais e por e-mail.
      </p>

      <h2>Problema 10: Tenho dúvida que não está na Central de Ajuda</h2>

      <h3>Situação</h3>
      <p>
        Sua dúvida ou problema é específico e não encontrou resposta nos artigos.
      </p>

      <h3>Solução</h3>
      <p>
        <strong>Entre em contato com nosso suporte:</strong> Estamos aqui para isso!
      </p>
      <ul>
        <li>WhatsApp: (11) 99999-9999</li>
        <li>Chat: Ícone no canto da página</li>
        <li>E-mail: contato@bolsaclick.com.br</li>
        <li>Telefone: (11) 3000-0000</li>
      </ul>
      <p>
        Nossa equipe está preparada para atender casos específicos e complexos. Nenhuma dúvida é
        pequena demais ou grande demais.
      </p>

      <h2>Dicas gerais para evitar problemas</h2>
      <ul>
        <li>Leia atentamente todos os e-mails que enviamos</li>
        <li>Mantenha WhatsApp ativo e notificações ligadas</li>
        <li>Responda rapidamente quando solicitado algo</li>
        <li>Guarde comprovantes, prints e documentos</li>
        <li>Não deixe para última hora (documentos, pagamentos, prazos)</li>
        <li>Tire dúvidas ANTES de garantir bolsa, não depois</li>
        <li>Confira informações duas vezes antes de enviar</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Como falar conosco',
            description: 'Veja todos os canais de atendimento disponíveis',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
          {
            title: 'Acompanhar status da bolsa',
            description: 'Consulte andamento da sua solicitação em tempo real',
            href: '/central-de-ajuda/atendimento-suporte/acompanhamento',
          },
          {
            title: 'Documentos necessários',
            description: 'Veja lista completa e evite documentos recusados',
            href: '/central-de-ajuda/matricula-faculdade/documentos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
