import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Central de Ajuda - Bolsa Click',
  description:
    'Entenda como o Bolsa Click coleta, utiliza, armazena e protege seus dados pessoais. Transparência total sobre nossas práticas de privacidade.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade',
  },
}

export default function PoliticaDePrivacidadePage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Política de Privacidade"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Coletamos apenas dados necessários para conectar você a bolsas de estudo: nome, CPF,
          e-mail, telefone e dados acadêmicos. Compartilhamos com instituições parceiras apenas para
          processar sua candidatura. Você pode acessar, corrigir ou excluir seus dados a qualquer
          momento via dpo@bolsaclick.com.br.
        </p>
      </QuickAnswer>

      <h2>1. Informações que Coletamos</h2>

      <h3>Informações fornecidas por você</h3>
      <p>Ao se cadastrar na plataforma, podemos coletar:</p>
      <ul>
        <li>Nome completo</li>
        <li>CPF (Cadastro de Pessoa Física)</li>
        <li>E-mail</li>
        <li>Número de telefone</li>
        <li>Endereço</li>
        <li>Dados acadêmicos (curso de interesse, histórico educacional, preferências)</li>
        <li>Dados de pagamento (quando aplicável)</li>
      </ul>

      <h3>Informações coletadas automaticamente</h3>
      <p>Ao navegar pelo nosso site, coletamos automaticamente:</p>
      <ul>
        <li>Endereço de IP</li>
        <li>Tipo de dispositivo e sistema operacional</li>
        <li>Dados de navegação (páginas visitadas, tempo gasto, interações)</li>
        <li>Cookies e tecnologias semelhantes</li>
      </ul>

      <h2>2. Como Utilizamos Seus Dados</h2>
      <p>Utilizamos os dados coletados para:</p>
      <ul>
        <li>
          <strong>Prestar serviços:</strong> Permitir que você acesse oportunidades de bolsas de
          estudo
        </li>
        <li>
          <strong>Comunicação:</strong> Enviar e-mails, mensagens sobre o status da sua inscrição
        </li>
        <li>
          <strong>Personalização:</strong> Adaptar conteúdos e ofertas de acordo com seu perfil
        </li>
        <li>
          <strong>Suporte:</strong> Responder dúvidas e solicitações relacionadas aos serviços
        </li>
        <li>
          <strong>Melhoria contínua:</strong> Analisar como o site é utilizado para otimizar a
          experiência
        </li>
      </ul>

      <h2>3. Compartilhamento de Dados</h2>
      <p>Podemos compartilhar seus dados com:</p>
      <ul>
        <li>
          <strong>Instituições de ensino parceiras:</strong> Para que você seja considerado nas
          oportunidades de bolsas de estudo
        </li>
        <li>
          <strong>Prestadores de serviços:</strong> Empresas que prestam serviços essenciais
          (hospedagem, envio de e-mails, processamento de pagamentos)
        </li>
        <li>
          <strong>Exigência legal:</strong> Quando obrigados por lei ou autoridade competente
        </li>
      </ul>
      <p>
        <strong>Importante:</strong> Nunca vendemos seus dados pessoais para terceiros.
      </p>

      <h2>4. Segurança dos Dados</h2>
      <p>Adotamos medidas de segurança adequadas para proteger seus dados:</p>
      <ul>
        <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
        <li>Criptografia de dados sensíveis em repouso</li>
        <li>Firewalls e sistemas de monitoramento contínuo</li>
        <li>Controle de acesso restrito aos colaboradores</li>
        <li>Backups regulares e planos de recuperação</li>
      </ul>
      <p>
        Embora nos esforcemos para proteger seus dados, nenhum sistema é 100% seguro. Não podemos
        garantir segurança total das informações transmitidas pela internet.
      </p>

      <h2>5. Cookies e Tecnologias Similares</h2>
      <p>
        Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e realizar análises.
        Você pode configurar seu navegador para aceitar ou rejeitar cookies.
      </p>
      <p>
        Para mais detalhes, consulte nossa{' '}
        <a href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies">
          Política de Cookies
        </a>
        .
      </p>

      <h2>6. Seus Direitos (LGPD)</h2>
      <p>
        De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem os seguintes
        direitos:
      </p>
      <ul>
        <li>
          <strong>Acesso:</strong> Saber quais dados possuímos sobre você
        </li>
        <li>
          <strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados
        </li>
        <li>
          <strong>Exclusão:</strong> Solicitar apagamento de dados pessoais
        </li>
        <li>
          <strong>Portabilidade:</strong> Receber seus dados em formato estruturado
        </li>
        <li>
          <strong>Revogação:</strong> Retirar consentimento a qualquer momento
        </li>
        <li>
          <strong>Oposição:</strong> Opor-se ao tratamento em determinadas situações
        </li>
      </ul>
      <p>
        Para exercer esses direitos, entre em contato através do e-mail:{' '}
        <a href="mailto:dpo@bolsaclick.com.br">dpo@bolsaclick.com.br</a>
      </p>

      <h2>7. Retenção de Dados</h2>
      <p>Mantemos seus dados pessoais pelo tempo necessário para:</p>
      <ul>
        <li>Cumprir as finalidades para as quais foram coletados</li>
        <li>Atender obrigações legais e regulatórias</li>
        <li>Exercer direitos em processos judiciais ou administrativos</li>
      </ul>
      <p>
        Após esse período, os dados são excluídos ou anonimizados de forma segura.
      </p>

      <h2>8. Alterações nesta Política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade a qualquer momento para refletir mudanças em
        nossas práticas ou exigências legais. Alterações significativas serão comunicadas por e-mail
        ou aviso destacado no site.
      </p>

      <h2>Contato</h2>
      <p>
        Para dúvidas sobre privacidade ou exercer seus direitos, entre em contato:
      </p>
      <ul>
        <li>
          <strong>DPO (Encarregado de Dados):</strong>{' '}
          <a href="mailto:dpo@bolsaclick.com.br">dpo@bolsaclick.com.br</a>
        </li>
        <li>
          <strong>Suporte geral:</strong>{' '}
          <a href="mailto:contato@bolsaclick.com.br">contato@bolsaclick.com.br</a>
        </li>
      </ul>
      <p className="text-sm text-gray-500 mt-6">
        Inovit Digital Publicidade © {new Date().getFullYear()} - CNPJ 57.554.723/0001-50
      </p>

      <NextSteps
        steps={[
          {
            title: 'LGPD e seus direitos',
            description: 'Entenda em detalhes como exercer seus direitos',
            href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
          },
          {
            title: 'Política de Cookies',
            description: 'Saiba como usamos cookies em nosso site',
            href: '/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies',
          },
          {
            title: 'Termos de Uso',
            description: 'Confira as condições de uso da plataforma',
            href: '/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso',
          },
        ]}
      />
    </ArticleLayout>
  )
}
