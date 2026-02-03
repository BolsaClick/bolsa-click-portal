import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como o Bolsa Click protege meus dados? | Central de Ajuda',
  description:
    'Conheça as tecnologias e práticas de segurança que utilizamos para proteger suas informações pessoais, criptografia e certificações.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/protecao-dados',
  },
}

export default function ProtecaoDadosPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Como o Bolsa Click protege meus dados?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Seus dados são protegidos por criptografia SSL/TLS em todas as transações, armazenamento em
          servidores seguros com backups diários, conformidade total com a LGPD, auditorias
          periódicas de segurança e acesso restrito apenas a funcionários autorizados. Utilizamos as
          mesmas tecnologias de bancos e instituições financeiras.
        </p>
      </QuickAnswer>

      <h2>Criptografia em todas as transações</h2>
      <p>
        Sempre que você acessa nosso site ou portal, suas informações trafegam criptografadas:
      </p>
      <ul>
        <li>
          <strong>Protocolo SSL/TLS:</strong> Padrão internacional de segurança (o cadeado verde na
          barra de endereço)
        </li>
        <li>
          <strong>Certificado digital válido:</strong> Renovado regularmente para garantir autenticidade
        </li>
        <li>
          <strong>Criptografia de ponta a ponta:</strong> Seus dados são embaralhados durante o envio
          e só descriptografados em nossos servidores seguros
        </li>
        <li>
          <strong>Proteção contra interceptação:</strong> Mesmo que alguém tente capturar os dados em
          trânsito, não conseguirá lê-los
        </li>
      </ul>

      <h2>Armazenamento seguro</h2>
      <p>
        Quando seus dados chegam até nós, são armazenados com máxima segurança:
      </p>
      <ul>
        <li>
          <strong>Servidores certificados:</strong> Infraestrutura em nuvem com certificações
          internacionais de segurança
        </li>
        <li>
          <strong>Backup diário automatizado:</strong> Cópias de segurança em diferentes localizações
          geográficas
        </li>
        <li>
          <strong>Banco de dados criptografado:</strong> Informações sensíveis armazenadas com
          criptografia adicional
        </li>
        <li>
          <strong>Firewall e antivírus:</strong> Proteção contra ataques externos e malware
        </li>
        <li>
          <strong>Monitoramento 24/7:</strong> Sistemas automatizados detectam e bloqueiam atividades
          suspeitas
        </li>
      </ul>

      <h2>Acesso restrito e controlado</h2>
      <p>
        Nem todos os funcionários do Bolsa Click têm acesso aos seus dados:
      </p>
      <ul>
        <li>
          <strong>Princípio do menor privilégio:</strong> Cada colaborador acessa apenas o necessário
          para sua função
        </li>
        <li>
          <strong>Autenticação em duas etapas:</strong> Funcionários precisam de senha + código para
          acessar sistemas internos
        </li>
        <li>
          <strong>Registro de acessos (logs):</strong> Tudo que é consultado fica registrado para
          auditoria
        </li>
        <li>
          <strong>Treinamento obrigatório:</strong> Equipe é capacitada regularmente sobre segurança e
          privacidade
        </li>
        <li>
          <strong>Termo de confidencialidade:</strong> Todos assinam compromisso de sigilo
        </li>
      </ul>

      <h2>Conformidade com leis e regulamentações</h2>
      <p>
        Seguimos rigorosamente as normas de proteção de dados:
      </p>
      <ul>
        <li>
          <strong>LGPD (Lei Geral de Proteção de Dados):</strong> Compliance total com a legislação
          brasileira
        </li>
        <li>
          <strong>Encarregado de Dados (DPO):</strong> Profissional dedicado à gestão de privacidade
        </li>
        <li>
          <strong>Política de Privacidade atualizada:</strong> Documento público e transparente sobre
          uso de dados
        </li>
        <li>
          <strong>Termos de Uso claros:</strong> Sem letras miúdas ou pegadinhas
        </li>
        <li>
          <strong>Relatórios de conformidade:</strong> Auditorias internas e externas periódicas
        </li>
      </ul>

      <h2>Proteção de dados de pagamento</h2>
      <p>
        Informações financeiras recebem camada extra de segurança:
      </p>
      <ul>
        <li>
          <strong>Gateways certificados:</strong> Usamos processadores de pagamento com certificação
          PCI-DSS
        </li>
        <li>
          <strong>Não armazenamos dados de cartão:</strong> Informações bancárias ficam apenas nos
          sistemas das operadoras
        </li>
        <li>
          <strong>Tokenização:</strong> Números sensíveis são substituídos por códigos temporários
        </li>
        <li>
          <strong>Confirmação em duas etapas:</strong> Pagamentos exigem múltiplas validações
        </li>
      </ul>

      <h2>Segurança em múltiplas camadas</h2>
      <p>
        Nossa abordagem de segurança é multidimensional:
      </p>
      <ol>
        <li>
          <strong>Camada de rede:</strong> Firewall, anti-DDoS, filtros de tráfego
        </li>
        <li>
          <strong>Camada de aplicação:</strong> Código seguro, testes de vulnerabilidade, atualizações
          constantes
        </li>
        <li>
          <strong>Camada de dados:</strong> Criptografia, backups, segregação de ambientes
        </li>
        <li>
          <strong>Camada humana:</strong> Treinamentos, políticas, controle de acesso
        </li>
        <li>
          <strong>Camada física:</strong> Datacenters com segurança 24h, controle biométrico
        </li>
      </ol>

      <h2>Testes e auditorias regulares</h2>
      <p>
        Não confiamos apenas em processos, testamos continuamente:
      </p>
      <ul>
        <li>
          <strong>Testes de penetração:</strong> Hackers éticos tentam invadir nossos sistemas para
          identificar falhas
        </li>
        <li>
          <strong>Varredura de vulnerabilidades:</strong> Ferramentas automatizadas verificam brechas
          semanalmente
        </li>
        <li>
          <strong>Auditorias externas:</strong> Empresas especializadas avaliam nossa segurança
          anualmente
        </li>
        <li>
          <strong>Simulações de incidentes:</strong> Treinamos a equipe para responder a crises
        </li>
      </ul>

      <h2>Resposta a incidentes</h2>
      <p>
        Caso ocorra qualquer problema de segurança (algo extremamente raro):
      </p>
      <ul>
        <li>
          <strong>Detecção imediata:</strong> Sistemas automatizados alertam nossa equipe
        </li>
        <li>
          <strong>Contenção rápida:</strong> Protocolo de resposta ativa em minutos
        </li>
        <li>
          <strong>Investigação completa:</strong> Apuramos causa raiz e extensão do problema
        </li>
        <li>
          <strong>Comunicação transparente:</strong> Usuários afetados são notificados conforme exige a
          LGPD
        </li>
        <li>
          <strong>Correção e prevenção:</strong> Falha é corrigida e medidas são tomadas para não
          repetir
        </li>
      </ul>

      <h2>Tecnologias de ponta</h2>
      <p>
        Investimos continuamente em tecnologia de segurança:
      </p>
      <ul>
        <li>
          <strong>Inteligência artificial:</strong> Detecta padrões anormais de acesso
        </li>
        <li>
          <strong>Machine learning:</strong> Aprende com tentativas de fraude e bloqueia
          automaticamente
        </li>
        <li>
          <strong>Autenticação biométrica:</strong> Disponível em apps mobile (impressão digital,
          reconhecimento facial)
        </li>
        <li>
          <strong>Verificação comportamental:</strong> Identifica se o acesso parece legítimo com base
          em padrões
        </li>
      </ul>

      <h2>Segurança também depende de você</h2>
      <p>
        Fazemos nossa parte, mas você também pode ajudar:
      </p>
      <ul>
        <li>
          <strong>Use senhas fortes:</strong> Misture letras, números e símbolos
        </li>
        <li>
          <strong>Não compartilhe credenciais:</strong> Sua senha é pessoal e intransferível
        </li>
        <li>
          <strong>Desconfie de e-mails suspeitos:</strong> Nunca pedimos senha por e-mail
        </li>
        <li>
          <strong>Acesse sempre pelo site oficial:</strong> bolsaclick.com.br (verifique URL)
        </li>
        <li>
          <strong>Mantenha dispositivos seguros:</strong> Antivírus atualizado, sistema operacional em
          dia
        </li>
        <li>
          <strong>Não use redes Wi-Fi públicas para transações:</strong> Prefira sua rede doméstica ou
          dados móveis
        </li>
      </ul>

      <h2>Transparência total</h2>
      <p>
        Você tem direito de saber exatamente como protegemos suas informações:
      </p>
      <ul>
        <li>Nossa Política de Privacidade é pública e detalhada</li>
        <li>Relatórios de conformidade estão disponíveis mediante solicitação</li>
        <li>Certificações de segurança podem ser verificadas</li>
        <li>Tiramos dúvidas sobre segurança a qualquer momento</li>
      </ul>

      <h2>Compromisso contínuo</h2>
      <p>
        Segurança não é projeto com começo e fim, mas um processo contínuo. Nos comprometemos a:
      </p>
      <ul>
        <li>Investir constantemente em novas tecnologias de proteção</li>
        <li>Treinar equipe regularmente sobre melhores práticas</li>
        <li>Acompanhar evolução de ameaças e nos adaptar rapidamente</li>
        <li>Ser transparentes sobre nossos processos e eventuais incidentes</li>
        <li>Colocar a privacidade do usuário sempre em primeiro lugar</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Uso de informações pessoais',
            description: 'Entenda como e por que utilizamos seus dados',
            href: '/central-de-ajuda/seguranca-dados-privacidade/uso-informacoes',
          },
          {
            title: 'LGPD e transparência',
            description: 'Conheça seus direitos sob a Lei Geral de Proteção de Dados',
            href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
          },
          {
            title: 'Comunicação oficial',
            description: 'Saiba identificar mensagens legítimas do Bolsa Click',
            href: '/central-de-ajuda/seguranca-dados-privacidade/comunicacao-oficial',
          },
        ]}
      />
    </ArticleLayout>
  )
}
