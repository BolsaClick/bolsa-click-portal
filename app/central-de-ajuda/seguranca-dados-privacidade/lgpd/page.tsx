import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'LGPD e transparência | Central de Ajuda',
  description:
    'Entenda seus direitos sob a Lei Geral de Proteção de Dados, como exercê-los e nosso compromisso com a privacidade total.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/lgpd',
  },
}

export default function LGPDPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="LGPD e transparência"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          A LGPD (Lei Geral de Proteção de Dados) garante seus direitos sobre informações pessoais.
          Você pode acessar, corrigir, excluir ou solicitar portabilidade dos seus dados a qualquer
          momento. Entre em contato com nosso DPO em dpo@bolsaclick.com.br ou pelo suporte. Somos
          100% conformes com a legislação e transparentes em todos os processos.
        </p>
      </QuickAnswer>

      <h2>O que é a LGPD</h2>
      <p>
        A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) é a legislação brasileira que regula
        como empresas e organizações podem coletar, armazenar, tratar e compartilhar dados pessoais.
      </p>
      <p>
        <strong>Objetivo principal:</strong> Proteger sua privacidade e dar a você controle sobre suas
        informações pessoais.
      </p>
      <p>
        <strong>Vigência:</strong> Em vigor desde setembro de 2020, com fiscalização ativa pela ANPD
        (Agência Nacional de Proteção de Dados).
      </p>

      <h2>Seus direitos como titular de dados</h2>
      <p>
        A LGPD garante uma série de direitos. Veja cada um deles e como exercê-los no Bolsa Click:
      </p>

      <h3>1. Direito de acesso</h3>
      <p>
        <strong>O que é:</strong> Saber quais dados temos sobre você.
      </p>
      <p>
        <strong>Como exercer:</strong> Solicite via e-mail (dpo@bolsaclick.com.br) ou pelo suporte.
        Enviaremos relatório completo em até 15 dias.
      </p>

      <h3>2. Direito de correção</h3>
      <p>
        <strong>O que é:</strong> Corrigir dados incompletos, inexatos ou desatualizados.
      </p>
      <p>
        <strong>Como exercer:</strong> Acesse seu perfil no portal do estudante e edite diretamente, ou
        entre em contato com nosso suporte informando as correções necessárias.
      </p>

      <h3>3. Direito de exclusão</h3>
      <p>
        <strong>O que é:</strong> Solicitar apagamento de dados pessoais (direito ao esquecimento).
      </p>
      <p>
        <strong>Como exercer:</strong> Envie solicitação formal para dpo@bolsaclick.com.br. Excluiremos
        seus dados em até 30 dias, exceto aqueles que precisamos manter por obrigação legal (como
        registros fiscais).
      </p>
      <p>
        <strong>Limitações:</strong> Dados necessários para cumprimento de obrigação legal, exercício
        de direitos em processo judicial ou uso exclusivamente interno e anonimizado podem ser
        mantidos.
      </p>

      <h3>4. Direito de portabilidade</h3>
      <p>
        <strong>O que é:</strong> Receber seus dados em formato estruturado para transferir a outro
        fornecedor de serviço.
      </p>
      <p>
        <strong>Como exercer:</strong> Solicite via dpo@bolsaclick.com.br. Forneceremos arquivo em
        formato padrão (CSV, JSON ou PDF) em até 15 dias.
      </p>

      <h3>5. Direito de anonimização, bloqueio ou eliminação</h3>
      <p>
        <strong>O que é:</strong> Tornar seus dados anônimos (sem identificação pessoal), bloqueá-los
        temporariamente ou eliminá-los.
      </p>
      <p>
        <strong>Como exercer:</strong> Especifique qual ação deseja ao entrar em contato. Anonimização
        é útil se você quer que dados estatísticos sejam mantidos sem sua identificação.
      </p>

      <h3>6. Direito de informação sobre compartilhamento</h3>
      <p>
        <strong>O que é:</strong> Saber com quais entidades públicas e privadas compartilhamos seus
        dados.
      </p>
      <p>
        <strong>Como exercer:</strong> Solicite relatório detalhado via dpo@bolsaclick.com.br.
        Informaremos todas as faculdades e processadores de pagamento com quem compartilhamos.
      </p>

      <h3>7. Direito de revogar consentimento</h3>
      <p>
        <strong>O que é:</strong> Retirar autorização que você deu anteriormente para determinado uso
        de dados.
      </p>
      <p>
        <strong>Como exercer:</strong> Envie comunicado formal. Cessaremos imediatamente o uso para
        aquela finalidade (exceto se houver outra base legal que permita o tratamento).
      </p>

      <h3>8. Direito de oposição</h3>
      <p>
        <strong>O que é:</strong> Opor-se a tratamento de dados realizado sem seu consentimento (quando
        baseado em legítimo interesse, por exemplo).
      </p>
      <p>
        <strong>Como exercer:</strong> Manifeste oposição via DPO. Avaliaremos o caso e, se procedente,
        cessaremos o tratamento.
      </p>

      <h3>9. Direito de revisão de decisões automatizadas</h3>
      <p>
        <strong>O que é:</strong> Contestar decisões tomadas unicamente por sistemas automatizados (sem
        intervenção humana).
      </p>
      <p>
        <strong>Como exercer:</strong> Se você acredita que foi prejudicado por decisão automatizada,
        solicite revisão humana. Reanalisaremos o caso manualmente.
      </p>

      <h2>Como exercer seus direitos</h2>

      <h3>Canais oficiais</h3>
      <ul>
        <li>
          <strong>E-mail do DPO:</strong> dpo@bolsaclick.com.br (canal prioritário para questões de
          privacidade)
        </li>
        <li>
          <strong>Suporte geral:</strong> contato@bolsaclick.com.br, WhatsApp, chat ou telefone
        </li>
        <li>
          <strong>Portal do estudante:</strong> Para alterações simples (correção de dados, preferências
          de comunicação)
        </li>
      </ul>

      <h3>Informações necessárias na solicitação</h3>
      <p>
        Para processar sua solicitação rapidamente, inclua:
      </p>
      <ul>
        <li>Nome completo</li>
        <li>CPF</li>
        <li>E-mail cadastrado</li>
        <li>Direito que deseja exercer (acesso, exclusão, correção, etc.)</li>
        <li>Descrição específica do que solicita</li>
      </ul>

      <h3>Prazos de resposta</h3>
      <ul>
        <li>
          <strong>Confirmação de recebimento:</strong> Até 2 dias úteis
        </li>
        <li>
          <strong>Resposta completa à solicitação:</strong> Até 15 dias (podendo ser prorrogado por
          mais 15 dias em casos complexos, com aviso prévio)
        </li>
      </ul>

      <h2>Bases legais para tratamento de dados</h2>
      <p>
        A LGPD permite tratamento de dados pessoais com base em:
      </p>
      <ul>
        <li>
          <strong>Consentimento:</strong> Quando você autoriza expressamente (ex: aceitar receber
          marketing)
        </li>
        <li>
          <strong>Execução de contrato:</strong> Para cumprir acordo firmado (ex: intermediar matrícula)
        </li>
        <li>
          <strong>Obrigação legal:</strong> Para cumprir lei (ex: emitir nota fiscal)
        </li>
        <li>
          <strong>Legítimo interesse:</strong> Para atividades legítimas do negócio (ex: prevenir
          fraudes)
        </li>
      </ul>
      <p>
        Nossa Política de Privacidade especifica qual base legal usamos para cada finalidade.
      </p>

      <h2>Nosso compromisso com a LGPD</h2>

      <h3>Conformidade total</h3>
      <p>
        O Bolsa Click está 100% conforme com a LGPD:
      </p>
      <ul>
        <li>DPO (Encarregado de Dados) designado e acessível</li>
        <li>Política de Privacidade clara, completa e atualizada</li>
        <li>Processos internos documentados de tratamento de dados</li>
        <li>Treinamento regular da equipe sobre privacidade</li>
        <li>Contratos com fornecedores incluem cláusulas de proteção de dados</li>
        <li>Registros de atividades de tratamento conforme exigência legal</li>
      </ul>

      <h3>Segurança por design</h3>
      <p>
        Incorporamos privacidade desde a concepção de produtos e processos:
      </p>
      <ul>
        <li>Coletamos apenas dados estritamente necessários (minimização)</li>
        <li>Dados são criptografados em trânsito e em repouso</li>
        <li>Acessos internos são controlados e auditados</li>
        <li>Avaliações de impacto à privacidade em novos projetos</li>
      </ul>

      <h3>Transparência total</h3>
      <p>
        Você sempre sabe o que fazemos com seus dados:
      </p>
      <ul>
        <li>Avisos claros de coleta em cada etapa</li>
        <li>Explicação das finalidades de forma simples</li>
        <li>Políticas públicas e acessíveis</li>
        <li>Comunicação proativa sobre mudanças relevantes</li>
      </ul>

      <h2>Incidentes de segurança e notificação</h2>
      <p>
        Caso ocorra algum incidente de segurança que afete seus dados:
      </p>
      <ul>
        <li>
          <strong>Notificação à ANPD:</strong> Em até 72 horas após tomada de ciência
        </li>
        <li>
          <strong>Notificação a você:</strong> Se houver risco relevante aos seus direitos, avisamos
          imediatamente
        </li>
        <li>
          <strong>Transparência:</strong> Informamos natureza do incidente, dados afetados e medidas
          tomadas
        </li>
        <li>
          <strong>Suporte:</strong> Oferecemos assistência para minimizar impactos
        </li>
      </ul>

      <h2>Menores de 18 anos</h2>
      <p>
        Nossos serviços são destinados a maiores de 18 anos ou menores emancipados. Se você é menor:
      </p>
      <ul>
        <li>Precisa de consentimento dos pais ou responsáveis</li>
        <li>Tratamento de dados segue regras ainda mais rígidas da LGPD</li>
        <li>Pais/responsáveis podem exercer todos os direitos em nome do menor</li>
      </ul>

      <h2>Transferência internacional de dados</h2>
      <p>
        Alguns de nossos fornecedores de tecnologia têm servidores no exterior. Quando há transferência
        internacional:
      </p>
      <ul>
        <li>Garantimos que o país de destino oferece grau adequado de proteção</li>
        <li>Firmamos cláusulas contratuais padrão aprovadas pela ANPD</li>
        <li>Mantemos mesmos níveis de segurança e privacidade</li>
      </ul>

      <h2>Atualizações nesta política</h2>
      <p>
        Podemos atualizar nossas práticas de privacidade para:
      </p>
      <ul>
        <li>Adequar a mudanças na legislação</li>
        <li>Implementar novos recursos ou serviços</li>
        <li>Melhorar proteção de dados</li>
      </ul>
      <p>
        Quando houver mudanças significativas, notificaremos você por e-mail e/ou aviso destacado no
        site antes da vigência.
      </p>

      <h2>Autoridade de fiscalização</h2>
      <p>
        Se você acredita que seus direitos foram violados, pode:
      </p>
      <ul>
        <li>
          <strong>Primeiro:</strong> Entre em contato conosco (dpo@bolsaclick.com.br) para resolver
          amigavelmente
        </li>
        <li>
          <strong>Se não resolver:</strong> Registre reclamação na ANPD (Agência Nacional de Proteção
          de Dados)
        </li>
        <li>
          <strong>Contato ANPD:</strong> anpd.gov.br ou 0800-940-4444
        </li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Uso de informações pessoais',
            description: 'Entenda como utilizamos seus dados no dia a dia',
            href: '/central-de-ajuda/seguranca-dados-privacidade/uso-informacoes',
          },
          {
            title: 'Proteção de dados',
            description: 'Veja tecnologias de segurança que utilizamos',
            href: '/central-de-ajuda/seguranca-dados-privacidade/protecao-dados',
          },
          {
            title: 'Comunicação oficial',
            description: 'Identifique mensagens legítimas do Bolsa Click',
            href: '/central-de-ajuda/seguranca-dados-privacidade/comunicacao-oficial',
          },
        ]}
      />
    </ArticleLayout>
  )
}
