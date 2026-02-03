import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Uso de informações pessoais | Central de Ajuda',
  description:
    'Entenda como e por que utilizamos seus dados pessoais, com quem compartilhamos e nosso compromisso de não vender informações.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/uso-informacoes',
  },
}

export default function UsoInformacoesPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Uso de informações pessoais"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Usamos seus dados exclusivamente para intermediar sua matrícula nas faculdades parceiras,
          processar pagamentos, enviar comunicações relacionadas ao serviço e melhorar sua
          experiência. Compartilhamos informações apenas com a instituição de ensino escolhida. Nunca
          vendemos seus dados para terceiros.
        </p>
      </QuickAnswer>

      <h2>Quais dados coletamos</h2>

      <h3>Dados pessoais básicos</h3>
      <ul>
        <li>Nome completo</li>
        <li>CPF</li>
        <li>Data de nascimento</li>
        <li>RG</li>
        <li>Endereço completo</li>
        <li>Telefone e e-mail</li>
      </ul>

      <h3>Dados acadêmicos</h3>
      <ul>
        <li>Histórico escolar</li>
        <li>Certificado de conclusão (ensino médio ou superior)</li>
        <li>Curso de interesse</li>
        <li>Modalidade preferida (EAD, presencial, semipresencial)</li>
      </ul>

      <h3>Dados de navegação</h3>
      <ul>
        <li>Páginas visitadas no site</li>
        <li>Cursos pesquisados</li>
        <li>Tempo de permanência</li>
        <li>Dispositivo utilizado</li>
        <li>Endereço IP (para segurança)</li>
      </ul>

      <h3>Dados de pagamento</h3>
      <ul>
        <li>Método de pagamento escolhido</li>
        <li>Comprovantes de transação</li>
        <li>Histórico de pagamentos</li>
      </ul>
      <p>
        <strong>Importante:</strong> Não armazenamos números completos de cartão de crédito ou dados
        bancários completos. Isso fica apenas nos sistemas das operadoras de pagamento.
      </p>

      <h2>Para que usamos seus dados</h2>

      <h3>1. Intermediar sua matrícula</h3>
      <p>
        A principal finalidade: conectar você à faculdade escolhida. Para isso, precisamos:
      </p>
      <ul>
        <li>Enviar seus documentos para a instituição</li>
        <li>Informar a faculdade sobre seu interesse</li>
        <li>Acompanhar o processo de validação de documentos</li>
        <li>Confirmar efetivação da matrícula</li>
      </ul>

      <h3>2. Processar pagamentos</h3>
      <p>
        Para garantir sua vaga, precisamos processar a pré-matrícula:
      </p>
      <ul>
        <li>Gerar boletos, links de pagamento ou QR Code Pix</li>
        <li>Confirmar recebimento de pagamentos</li>
        <li>Emitir comprovantes e notas fiscais</li>
        <li>Processar eventuais reembolsos</li>
      </ul>

      <h3>3. Comunicação sobre o serviço</h3>
      <p>
        Mantemos você informado sobre:
      </p>
      <ul>
        <li>Status da sua solicitação de bolsa</li>
        <li>Pendências de documentação</li>
        <li>Confirmação de matrícula</li>
        <li>Prazos importantes</li>
        <li>Respostas às suas dúvidas</li>
      </ul>

      <h3>4. Melhorar nossos serviços</h3>
      <p>
        Analisamos dados agregados (sem identificação pessoal) para:
      </p>
      <ul>
        <li>Entender quais cursos são mais buscados</li>
        <li>Melhorar navegação do site</li>
        <li>Identificar problemas técnicos</li>
        <li>Personalizar recomendações de cursos</li>
      </ul>

      <h3>5. Cumprir obrigações legais</h3>
      <p>
        Alguns dados são mantidos por exigência legal:
      </p>
      <ul>
        <li>Emissão de notas fiscais (obrigação tributária)</li>
        <li>Registro de transações financeiras (Banco Central)</li>
        <li>Armazenamento de contratos (Código Civil)</li>
        <li>Atendimento a requisições judiciais</li>
      </ul>

      <h2>Com quem compartilhamos seus dados</h2>

      <h3>Faculdades parceiras</h3>
      <p>
        Compartilhamos suas informações com a instituição que você escolheu:
      </p>
      <ul>
        <li>Dados pessoais necessários para matrícula</li>
        <li>Documentos acadêmicos</li>
        <li>Informações de contato</li>
      </ul>
      <p>
        <strong>Importante:</strong> Só enviamos para a faculdade específica que você selecionou, não
        para todas as parceiras.
      </p>

      <h3>Processadores de pagamento</h3>
      <p>
        Para processar transações, compartilhamos dados mínimos com:
      </p>
      <ul>
        <li>Gateways de pagamento (Mercado Pago, PagSeguro, etc.)</li>
        <li>Instituições financeiras (para Pix e boletos)</li>
        <li>Operadoras de cartão de crédito</li>
      </ul>
      <p>Essas empresas seguem padrões rígidos de segurança (PCI-DSS).</p>

      <h3>Fornecedores de tecnologia</h3>
      <p>
        Alguns serviços técnicos acessam dados de forma limitada:
      </p>
      <ul>
        <li>Servidores de hospedagem (AWS, Google Cloud, etc.)</li>
        <li>Serviços de e-mail (para envio de notificações)</li>
        <li>Ferramentas de analytics (Google Analytics, em modo anônimo)</li>
      </ul>
      <p>
        Todos assinam acordos de confidencialidade e só acessam o mínimo necessário para operar.
      </p>

      <h3>Órgãos reguladores (quando exigido por lei)</h3>
      <p>
        Em situações específicas, podemos compartilhar dados com:
      </p>
      <ul>
        <li>Receita Federal (obrigações fiscais)</li>
        <li>Autoridades judiciais (ordens judiciais)</li>
        <li>ANPD (Agência Nacional de Proteção de Dados, se solicitado)</li>
      </ul>

      <h2>Com quem NÃO compartilhamos</h2>
      <p>
        Para deixar absolutamente claro:
      </p>
      <ul>
        <li>
          <strong>Não vendemos seus dados:</strong> Jamais comercializamos informações pessoais
        </li>
        <li>
          <strong>Não compartilhamos com empresas de marketing:</strong> Seu e-mail não vai para listas
          de spam
        </li>
        <li>
          <strong>Não enviamos para faculdades não solicitadas:</strong> Apenas para a que você
          escolheu
        </li>
        <li>
          <strong>Não compartilhamos com outras plataformas educacionais:</strong> Seus dados ficam
          conosco
        </li>
        <li>
          <strong>Não usamos para fins políticos ou religiosos:</strong> Respeitamos sua privacidade
          total
        </li>
      </ul>

      <h2>Marketing e comunicações promocionais</h2>

      <h3>O que enviamos</h3>
      <p>
        Com seu consentimento, podemos enviar:
      </p>
      <ul>
        <li>Novidades sobre bolsas e descontos</li>
        <li>Alertas de cursos que podem te interessar</li>
        <li>Dicas sobre educação e carreira</li>
        <li>Promoções especiais</li>
      </ul>

      <h3>Como controlar</h3>
      <p>
        Você tem controle total:
      </p>
      <ul>
        <li>
          <strong>Opt-out a qualquer momento:</strong> Link de descadastro em todos os e-mails
        </li>
        <li>
          <strong>Gerenciar preferências:</strong> Escolha o que quer receber e o que não quer
        </li>
        <li>
          <strong>Bloquear WhatsApp:</strong> Pode sair da lista de transmissão a qualquer hora
        </li>
      </ul>
      <p>
        <strong>Importante:</strong> Mesmo se você optar por não receber marketing, continuará
        recebendo comunicações essenciais sobre sua matrícula e serviço contratado.
      </p>

      <h2>Retenção de dados (por quanto tempo guardamos)</h2>

      <h3>Durante o uso do serviço</h3>
      <p>
        Enquanto você estiver usando o Bolsa Click, mantemos seus dados atualizados e acessíveis.
      </p>

      <h3>Após conclusão da matrícula</h3>
      <p>
        Mantemos registros históricos por:
      </p>
      <ul>
        <li>
          <strong>5 anos:</strong> Obrigações fiscais e contratuais (conforme Código Civil)
        </li>
        <li>
          <strong>Indefinidamente (anonimizados):</strong> Dados estatísticos sem identificação pessoal
        </li>
      </ul>

      <h3>Se você solicitar exclusão</h3>
      <p>
        Você pode pedir exclusão de dados a qualquer momento (veja nosso artigo sobre LGPD). Porém:
      </p>
      <ul>
        <li>Dados necessários por lei (fiscais) devem ser mantidos pelo prazo legal</li>
        <li>Dados já compartilhados com faculdades ficam sob responsabilidade delas</li>
        <li>Dados anonimizados (sem identificação) podem ser mantidos para estatísticas</li>
      </ul>

      <h2>Cookies e tecnologias similares</h2>
      <p>
        Usamos cookies para:
      </p>
      <ul>
        <li>
          <strong>Cookies essenciais:</strong> Manter sessão ativa, lembrar idioma escolhido
        </li>
        <li>
          <strong>Cookies de desempenho:</strong> Entender como você usa o site (Google Analytics)
        </li>
        <li>
          <strong>Cookies de funcionalidade:</strong> Lembrar suas preferências
        </li>
        <li>
          <strong>Cookies de marketing:</strong> Mostrar anúncios relevantes (com seu consentimento)
        </li>
      </ul>
      <p>
        Você pode gerenciar cookies nas configurações do navegador ou através do banner de cookies no
        site.
      </p>

      <h2>Transparência total</h2>
      <p>
        Nossa Política de Privacidade completa está disponível em bolsaclick.com.br/privacidade. Lá
        você encontra:
      </p>
      <ul>
        <li>Detalhamento completo de cada tipo de dado coletado</li>
        <li>Finalidades específicas de cada uso</li>
        <li>Base legal para cada tratamento</li>
        <li>Seus direitos como titular de dados</li>
        <li>Como exercer esses direitos</li>
      </ul>

      <h2>Dúvidas sobre uso de dados</h2>
      <p>
        Se você tem dúvidas sobre como usamos suas informações:
      </p>
      <ul>
        <li>
          <strong>Contate nosso DPO (Encarregado de Dados):</strong> dpo@bolsaclick.com.br
        </li>
        <li>
          <strong>Fale com o suporte:</strong> Pelo WhatsApp, chat ou e-mail
        </li>
        <li>
          <strong>Leia nossa Política de Privacidade:</strong> Documento completo e transparente
        </li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'LGPD e transparência',
            description: 'Conheça seus direitos sob a Lei Geral de Proteção de Dados',
            href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
          },
          {
            title: 'Como protegemos seus dados',
            description: 'Tecnologias de segurança que utilizamos',
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
