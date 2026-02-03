import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Acompanhamento do status da minha bolsa | Central de Ajuda',
  description:
    'Saiba como consultar o andamento da sua solicitação em tempo real, entenda cada status e receba notificações automáticas.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/atendimento-suporte/acompanhamento',
  },
}

export default function AcompanhamentoPage() {
  return (
    <ArticleLayout
      category="Atendimento e Suporte"
      categoryHref="/central-de-ajuda/atendimento-suporte"
      title="Acompanhamento do status da minha bolsa"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Você pode acompanhar o status da sua bolsa pelo portal do estudante (acesso com CPF e
          senha), por e-mail (recebe notificações automáticas a cada mudança) ou via WhatsApp
          (consultando seu atendente dedicado). O processo passa por etapas: Pré-matrícula
          confirmada, Documentos em análise, Matrícula em processamento e Matriculado.
        </p>
      </QuickAnswer>

      <h2>Como acompanhar em tempo real</h2>

      <h3>Portal do Estudante</h3>
      <p>
        A forma mais completa de acompanhar:
      </p>
      <ol>
        <li>Acesse bolsaclick.com.br/portal</li>
        <li>Faça login com seu CPF e senha (criada ao garantir a bolsa)</li>
        <li>No painel, veja o status atual da sua solicitação</li>
        <li>Clique em detalhes para mais informações</li>
      </ol>
      <p>
        <strong>Vantagens:</strong> Informações atualizadas em tempo real, histórico completo,
        documentos enviados, próximos passos.
      </p>

      <h3>Notificações por E-mail</h3>
      <p>
        Sempre que há mudança no status, você recebe e-mail automático com:
      </p>
      <ul>
        <li>Novo status da solicitação</li>
        <li>Explicação do que isso significa</li>
        <li>O que você precisa fazer (se aplicável)</li>
        <li>Prazos importantes</li>
        <li>Link para acessar o portal</li>
      </ul>
      <p>
        <strong>Dica:</strong> Confira também a caixa de spam/lixo eletrônico. Adicione
        noreply@bolsaclick.com.br aos contatos confiáveis.
      </p>

      <h3>WhatsApp</h3>
      <p>
        Seu consultor dedicado também envia atualizações importantes:
      </p>
      <ul>
        <li>Quando documentos são aprovados ou há pendências</li>
        <li>Quando a matrícula é efetivada</li>
        <li>Lembretes de prazos</li>
        <li>Responde consultas sobre status atual</li>
      </ul>

      <h2>Etapas do processo e significado de cada status</h2>

      <h3>1. Pré-matrícula confirmada</h3>
      <p>
        <strong>O que significa:</strong> Você pagou a pré-matrícula e sua vaga está reservada.
      </p>
      <p>
        <strong>Próximo passo:</strong> Enviar documentos para a faculdade.
      </p>
      <p>
        <strong>Prazo:</strong> Geralmente até 7 dias após confirmação do pagamento.
      </p>

      <h3>2. Aguardando envio de documentos</h3>
      <p>
        <strong>O que significa:</strong> Estamos esperando você enviar a documentação necessária.
      </p>
      <p>
        <strong>Próximo passo:</strong> Enviar RG, CPF, histórico escolar e demais documentos via
        portal, e-mail ou WhatsApp.
      </p>
      <p>
        <strong>Atenção:</strong> Se o prazo vencer sem envio, a vaga pode ser liberada.
      </p>

      <h3>3. Documentos em análise</h3>
      <p>
        <strong>O que significa:</strong> A faculdade está validando seus documentos.
      </p>
      <p>
        <strong>Próximo passo:</strong> Aguardar retorno (2 a 7 dias úteis). Não precisa fazer nada
        agora.
      </p>
      <p>
        <strong>Observação:</strong> Se houver pendências, você será notificado para regularizar.
      </p>

      <h3>4. Pendência documental</h3>
      <p>
        <strong>O que significa:</strong> Algum documento está faltando, ilegível ou incorreto.
      </p>
      <p>
        <strong>Próximo passo:</strong> Verificar e-mail ou WhatsApp para saber exatamente o que
        precisa ser corrigido. Enviar novamente o documento solicitado.
      </p>
      <p>
        <strong>Prazo:</strong> Geralmente 3 a 5 dias para regularização.
      </p>

      <h3>5. Documentos aprovados</h3>
      <p>
        <strong>O que significa:</strong> Toda documentação está correta e aprovada pela faculdade.
      </p>
      <p>
        <strong>Próximo passo:</strong> Aguardar geração de contrato e/ou taxa de matrícula (se
        houver).
      </p>

      <h3>6. Aguardando pagamento de taxa de matrícula</h3>
      <p>
        <strong>O que significa:</strong> A faculdade cobra uma taxa inicial (diferente da
        mensalidade). Você recebeu o boleto.
      </p>
      <p>
        <strong>Próximo passo:</strong> Pagar o boleto no prazo indicado.
      </p>
      <p>
        <strong>Observação:</strong> Nem todas as faculdades cobram essa taxa.
      </p>

      <h3>7. Matrícula em processamento</h3>
      <p>
        <strong>O que significa:</strong> A faculdade está finalizando sua matrícula no sistema.
      </p>
      <p>
        <strong>Próximo passo:</strong> Aguardar confirmação final (1 a 3 dias úteis).
      </p>

      <h3>8. Matriculado - Concluído</h3>
      <p>
        <strong>O que significa:</strong> Parabéns! Sua matrícula foi efetivada com sucesso.
      </p>
      <p>
        <strong>Próximo passo:</strong> Acessar portal da faculdade, conferir grade de horários,
        aguardar início das aulas.
      </p>
      <p>
        <strong>Você receberá:</strong> Número de matrícula, acesso ao portal do aluno, boleto da
        primeira mensalidade (com desconto), calendário acadêmico.
      </p>

      <h3>9. Cancelado/Indeferido</h3>
      <p>
        <strong>O que significa:</strong> A matrícula não foi efetivada por algum motivo.
      </p>
      <p>
        <strong>Motivos possíveis:</strong> Documentação não regularizada no prazo, não pagamento de
        taxa, reprovação em processo seletivo específico, desistência.
      </p>
      <p>
        <strong>Próximo passo:</strong> Entrar em contato para entender o motivo e verificar
        possibilidade de reembolso ou nova tentativa.
      </p>

      <h2>Quanto tempo demora cada etapa</h2>
      <p>Timeline típico do processo completo:</p>
      <ul>
        <li>
          <strong>Dia 1:</strong> Garantir bolsa e pagar pré-matrícula
        </li>
        <li>
          <strong>Dias 1-7:</strong> Enviar documentos
        </li>
        <li>
          <strong>Dias 8-14:</strong> Análise de documentos pela faculdade
        </li>
        <li>
          <strong>Dias 15-17:</strong> Pagamento de taxa (se houver)
        </li>
        <li>
          <strong>Dias 18-21:</strong> Processamento final da matrícula
        </li>
        <li>
          <strong>Dia 21:</strong> Matrícula efetivada
        </li>
      </ul>
      <p>
        <strong>Importante:</strong> Prazos podem variar conforme faculdade, época do ano e
        complexidade de cada caso.
      </p>

      <h2>Como consultar status sem acessar o portal</h2>
      <p>
        Se você não consegue acessar o portal, pode consultar por:
      </p>
      <ul>
        <li>
          <strong>WhatsApp:</strong> Pergunte ao seu atendente dedicado
        </li>
        <li>
          <strong>E-mail:</strong> Envie para contato@bolsaclick.com.br com seu CPF
        </li>
        <li>
          <strong>Telefone:</strong> Ligue informando nome completo e CPF
        </li>
        <li>
          <strong>Chat:</strong> Fale com atendente online
        </li>
      </ul>

      <h2>Notificações e alertas</h2>
      <p>
        Configure notificações para não perder nada:
      </p>
      <ul>
        <li>
          <strong>Push (celular):</strong> Se tiver o app do Bolsa Click instalado
        </li>
        <li>
          <strong>WhatsApp:</strong> Ative notificações do número do Bolsa Click
        </li>
        <li>
          <strong>E-mail:</strong> Adicione nosso e-mail aos contatos para não ir para spam
        </li>
        <li>
          <strong>SMS:</strong> Em alguns casos, enviamos SMS para lembretes importantes
        </li>
      </ul>

      <h2>O que fazer em cada situação</h2>

      <h3>Status não mudou há muito tempo</h3>
      <p>
        Se seu status está parado há mais de 7 dias úteis sem explicação:
      </p>
      <ol>
        <li>Verifique se não há mensagens não lidas (e-mail, WhatsApp)</li>
        <li>Entre em contato com nosso suporte</li>
        <li>Informe CPF e data da última atualização</li>
        <li>Cobraremos a faculdade e daremos retorno</li>
      </ol>

      <h3>Status mudou mas não entendi</h3>
      <p>
        Se você não entendeu o que significa o novo status:
      </p>
      <ul>
        <li>Clique em &quot;Detalhes&quot; ou &quot;Mais informações&quot; no portal</li>
        <li>Consulte este artigo da Central de Ajuda</li>
        <li>Fale com nosso suporte para explicação personalizada</li>
      </ul>

      <h3>Recebi notificação de pendência</h3>
      <p>
        Aja rapidamente:
      </p>
      <ol>
        <li>Leia atentamente o que está sendo solicitado</li>
        <li>Providencie o documento ou correção necessária</li>
        <li>Envie o quanto antes (atenção ao prazo)</li>
        <li>Confirme recebimento com nosso suporte</li>
      </ol>

      <h2>Após a matrícula ser efetivada</h2>
      <p>
        Quando você estiver matriculado, o acompanhamento passa a ser:
      </p>
      <ul>
        <li>
          <strong>Acadêmico:</strong> Pelo portal da faculdade (notas, frequência, grade)
        </li>
        <li>
          <strong>Financeiro:</strong> Boletos e pagamentos direto com a instituição
        </li>
        <li>
          <strong>Bolsa:</strong> O Bolsa Click continua monitorando se o desconto está sendo aplicado
          corretamente
        </li>
      </ul>
      <p>
        Nosso suporte permanece disponível para questões relacionadas à bolsa mesmo após matrícula.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Como fazer matrícula',
            description: 'Entenda todo o processo e documentos necessários',
            href: '/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
          },
          {
            title: 'Problemas comuns',
            description: 'Soluções rápidas para dúvidas frequentes',
            href: '/central-de-ajuda/atendimento-suporte/problemas-comuns',
          },
          {
            title: 'Fale com o suporte',
            description: 'Tire dúvidas sobre seu status específico',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
