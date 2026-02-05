/**
 * Parte 4 da migração - Artigos de Segurança, Dados e Privacidade
 *
 * Para executar:
 * npx tsx scripts/migrate-help-center-part4.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ARTICLES_PART4 = {
  'seguranca-dados-privacidade': [
    {
      slug: 'politica-de-privacidade',
      title: 'Política de Privacidade',
      description: 'Entenda como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais.',
      metaTitle: 'Política de Privacidade | Central de Ajuda - Bolsa Click',
      metaDescription: 'Conheça a política de privacidade do Bolsa Click e entenda como seus dados são tratados.',
      order: 1,
      content: `<p class="quick-answer">O Bolsa Click está comprometido com a privacidade e proteção dos seus dados pessoais. Coletamos apenas informações necessárias para conectar você às bolsas de estudo, compartilhamos dados apenas com as faculdades escolhidas e seguimos rigorosamente a LGPD.</p>

<h2>1. Dados que coletamos</h2>
<p>Coletamos os seguintes tipos de dados:</p>
<ul>
<li><strong>Dados de cadastro:</strong> Nome, e-mail, telefone, CPF</li>
<li><strong>Dados acadêmicos:</strong> Escolaridade, interesses de curso</li>
<li><strong>Dados de navegação:</strong> Páginas visitadas, buscas realizadas</li>
<li><strong>Dados de transação:</strong> Informações de pagamento (processadas por gateway seguro)</li>
</ul>

<h2>2. Como usamos seus dados</h2>
<p>Utilizamos seus dados para:</p>
<ul>
<li>Conectar você às faculdades parceiras</li>
<li>Processar garantia de bolsas</li>
<li>Enviar comunicações relevantes</li>
<li>Melhorar nossos serviços</li>
<li>Cumprir obrigações legais</li>
</ul>

<h2>3. Compartilhamento de dados</h2>
<p>Compartilhamos seus dados apenas com:</p>
<ul>
<li><strong>Faculdades parceiras:</strong> Quando você garante uma bolsa</li>
<li><strong>Processadores de pagamento:</strong> Para transações financeiras</li>
<li><strong>Autoridades:</strong> Quando exigido por lei</li>
</ul>
<p>Nunca vendemos seus dados para terceiros.</p>

<h2>4. Seus direitos (LGPD)</h2>
<p>Você tem direito a:</p>
<ul>
<li>Acessar seus dados</li>
<li>Corrigir informações incorretas</li>
<li>Solicitar exclusão dos dados</li>
<li>Revogar consentimentos</li>
<li>Portabilidade dos dados</li>
</ul>

<h2>5. Contato</h2>
<p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelo e-mail: contato@bolsaclick.com.br</p>`,
    },
    {
      slug: 'termos-de-uso',
      title: 'Termos de Uso',
      description: 'Confira os termos e condições para utilização da plataforma Bolsa Click.',
      metaTitle: 'Termos de Uso | Central de Ajuda - Bolsa Click',
      metaDescription: 'Confira os termos e condições para utilização da plataforma Bolsa Click.',
      order: 2,
      content: `<p class="quick-answer">Ao usar o Bolsa Click, você concorda com nossos termos: somos uma plataforma que conecta estudantes a bolsas de estudo em instituições parceiras. Você é responsável por manter seus dados atualizados e usar a plataforma de forma ética. Não garantimos aprovação em bolsas, pois isso depende das instituições parceiras.</p>

<h2>1. Objeto</h2>
<p>O Bolsa Click é uma plataforma digital criada pela Inovit Digital Publicidade (CNPJ 57.554.723/0001-50) para conectar estudantes a oportunidades de bolsas de estudo em diversas modalidades educacionais.</p>

<h2>2. Usuários e Conta de Acesso</h2>
<p>Para utilizar o Bolsa Click, você deve realizar um cadastro com informações precisas e atualizadas.</p>
<p><strong>Suas responsabilidades:</strong></p>
<ul>
<li>Manter a confidencialidade de sua conta e senha</li>
<li>Notificar imediatamente sobre uso não autorizado</li>
<li>Fornecer informações verídicas e atualizadas</li>
<li>Utilizar os serviços de forma responsável</li>
</ul>

<h2>3. Direitos e Obrigações do Bolsa Click</h2>
<p><strong>Nossos compromissos:</strong></p>
<ul>
<li>Disponibilizar acesso a oportunidades de bolsas</li>
<li>Facilitar o contato entre candidatos e instituições</li>
<li>Manter a plataforma funcionando de forma segura</li>
</ul>
<p><strong>Limitações:</strong></p>
<ul>
<li>Não garantimos a obtenção de bolsas</li>
<li>Podemos modificar ou descontinuar serviços</li>
</ul>

<h2>4. Propriedade Intelectual</h2>
<p>Todos os direitos de propriedade intelectual sobre a plataforma são de titularidade exclusiva da Inovit ou seus licenciadores.</p>

<h2>5. Disposições Gerais</h2>
<p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Disputas serão resolvidas pelos tribunais de São Paulo.</p>

<p class="text-sm text-gray-500 mt-6">Inovit Digital Publicidade © - CNPJ 57.554.723/0001-50</p>`,
    },
    {
      slug: 'politica-de-cookies',
      title: 'Política de Cookies',
      description: 'Saiba como utilizamos cookies e tecnologias semelhantes em nosso site.',
      metaTitle: 'Política de Cookies | Central de Ajuda - Bolsa Click',
      metaDescription: 'Saiba como o Bolsa Click utiliza cookies e tecnologias semelhantes.',
      order: 3,
      content: `<p class="quick-answer">Usamos cookies para melhorar sua experiência no site, lembrar suas preferências, analisar o tráfego e personalizar conteúdo. Você pode gerenciar cookies nas configurações do seu navegador. Cookies essenciais são necessários para o funcionamento do site.</p>

<h2>O que são cookies?</h2>
<p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles permitem que o site lembre suas ações e preferências.</p>

<h2>Tipos de cookies que usamos</h2>

<h3>Cookies essenciais</h3>
<ul>
<li>Necessários para o funcionamento do site</li>
<li>Não podem ser desativados</li>
<li>Incluem autenticação e segurança</li>
</ul>

<h3>Cookies de desempenho</h3>
<ul>
<li>Coletam informações sobre uso do site</li>
<li>Ajudam a melhorar a experiência</li>
<li>Dados são anônimos e agregados</li>
</ul>

<h3>Cookies de funcionalidade</h3>
<ul>
<li>Lembram suas preferências</li>
<li>Personalizam o conteúdo</li>
<li>Facilitam o uso em visitas futuras</li>
</ul>

<h3>Cookies de publicidade</h3>
<ul>
<li>Mostram anúncios relevantes</li>
<li>Medem eficácia de campanhas</li>
<li>Podem ser desativados</li>
</ul>

<h2>Como gerenciar cookies</h2>
<p>Você pode controlar cookies através das configurações do seu navegador:</p>
<ul>
<li>Chrome: Configurações → Privacidade e segurança</li>
<li>Firefox: Opções → Privacidade e Segurança</li>
<li>Safari: Preferências → Privacidade</li>
<li>Edge: Configurações → Cookies e permissões</li>
</ul>

<h2>Consequências de desativar cookies</h2>
<p>Desativar certos cookies pode afetar:</p>
<ul>
<li>Funcionamento do login</li>
<li>Lembrança de preferências</li>
<li>Experiência personalizada</li>
</ul>`,
    },
    {
      slug: 'lgpd',
      title: 'LGPD e transparência',
      description: 'Seus direitos sob a LGPD e nosso compromisso com a transparência total.',
      metaTitle: 'LGPD e transparência | Central de Ajuda - Bolsa Click',
      metaDescription: 'Conheça seus direitos sob a LGPD e o compromisso do Bolsa Click com a transparência.',
      order: 4,
      content: `<p class="quick-answer">A LGPD (Lei Geral de Proteção de Dados) garante seus direitos sobre dados pessoais. Você pode acessar, corrigir, excluir ou portar seus dados a qualquer momento. O Bolsa Click está em total conformidade com a lei e trata seus dados com transparência.</p>

<h2>O que é a LGPD?</h2>
<p>A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) regula o tratamento de dados pessoais no Brasil, garantindo direitos aos titulares e obrigações às empresas.</p>

<h2>Seus direitos garantidos</h2>
<ul>
<li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
<li><strong>Acesso:</strong> Ver quais dados temos sobre você</li>
<li><strong>Correção:</strong> Atualizar dados incorretos</li>
<li><strong>Anonimização:</strong> Tornar dados não identificáveis</li>
<li><strong>Portabilidade:</strong> Transferir dados para outro serviço</li>
<li><strong>Eliminação:</strong> Solicitar exclusão dos dados</li>
<li><strong>Informação:</strong> Saber com quem compartilhamos</li>
<li><strong>Revogação:</strong> Retirar consentimento dado</li>
</ul>

<h2>Como exercer seus direitos</h2>
<p>Para exercer qualquer direito:</p>
<ol>
<li>Envie e-mail para contato@bolsaclick.com.br</li>
<li>Identifique-se com nome e CPF</li>
<li>Especifique o direito que deseja exercer</li>
<li>Aguarde resposta em até 15 dias</li>
</ol>

<h2>Bases legais que usamos</h2>
<ul>
<li><strong>Consentimento:</strong> Quando você aceita termos</li>
<li><strong>Execução de contrato:</strong> Para garantir bolsas</li>
<li><strong>Legítimo interesse:</strong> Para melhorar serviços</li>
<li><strong>Cumprimento legal:</strong> Obrigações fiscais e regulatórias</li>
</ul>

<h2>Encarregado de Dados (DPO)</h2>
<p>Para questões sobre proteção de dados, entre em contato através do e-mail: contato@bolsaclick.com.br</p>`,
    },
    {
      slug: 'protecao-dados',
      title: 'Como o Bolsa Click protege meus dados?',
      description: 'Conheça as tecnologias e práticas de segurança que usamos para proteger suas informações.',
      metaTitle: 'Proteção de dados | Central de Ajuda - Bolsa Click',
      metaDescription: 'Saiba como o Bolsa Click protege seus dados pessoais com tecnologias de segurança avançadas.',
      order: 5,
      content: `<p class="quick-answer">Protegemos seus dados com criptografia SSL em todas as conexões, armazenamento seguro em servidores protegidos, controle de acesso restrito e monitoramento constante. Seguimos as melhores práticas de segurança da informação.</p>

<h2>Medidas de segurança técnica</h2>

<h3>Criptografia</h3>
<ul>
<li>SSL/TLS em todas as conexões (HTTPS)</li>
<li>Dados sensíveis criptografados em repouso</li>
<li>Senhas armazenadas com hash seguro</li>
</ul>

<h3>Infraestrutura</h3>
<ul>
<li>Servidores em data centers certificados</li>
<li>Firewalls e proteção contra ataques</li>
<li>Backups regulares e redundância</li>
</ul>

<h3>Controle de acesso</h3>
<ul>
<li>Acesso restrito por função</li>
<li>Autenticação em múltiplos fatores para equipe</li>
<li>Logs de acesso monitorados</li>
</ul>

<h2>Medidas organizacionais</h2>
<ul>
<li>Treinamento de equipe em segurança</li>
<li>Políticas internas de proteção de dados</li>
<li>Processo de resposta a incidentes</li>
<li>Avaliações periódicas de segurança</li>
</ul>

<h2>O que você pode fazer</h2>
<p>Sua segurança também depende de você:</p>
<ul>
<li>Use senha forte e única</li>
<li>Não compartilhe suas credenciais</li>
<li>Mantenha seu dispositivo seguro</li>
<li>Desconfie de e-mails suspeitos</li>
</ul>`,
    },
    {
      slug: 'uso-informacoes',
      title: 'Uso de informações pessoais',
      description: 'Entenda como e por que utilizamos seus dados e com quem compartilhamos.',
      metaTitle: 'Uso de informações pessoais | Central de Ajuda - Bolsa Click',
      metaDescription: 'Entenda como o Bolsa Click utiliza suas informações pessoais.',
      order: 6,
      content: `<p class="quick-answer">Usamos seus dados para conectar você às bolsas de estudo, processar pagamentos, enviar comunicações importantes e melhorar nossos serviços. Compartilhamos apenas com faculdades que você escolhe e parceiros essenciais. Nunca vendemos seus dados.</p>

<h2>Finalidades do uso de dados</h2>

<h3>Prestação do serviço</h3>
<ul>
<li>Criar e gerenciar sua conta</li>
<li>Processar garantia de bolsas</li>
<li>Conectar com faculdades parceiras</li>
<li>Processar pagamentos</li>
</ul>

<h3>Comunicação</h3>
<ul>
<li>Enviar confirmações e atualizações</li>
<li>Notificar sobre status da bolsa</li>
<li>Informar sobre novidades e ofertas (opcional)</li>
</ul>

<h3>Melhoria contínua</h3>
<ul>
<li>Entender como você usa a plataforma</li>
<li>Identificar problemas técnicos</li>
<li>Desenvolver novos recursos</li>
</ul>

<h2>Com quem compartilhamos</h2>
<ul>
<li><strong>Faculdades:</strong> Quando você garante uma bolsa</li>
<li><strong>Gateway de pagamento:</strong> Para processar transações</li>
<li><strong>Serviços de análise:</strong> Dados agregados e anônimos</li>
<li><strong>Autoridades:</strong> Quando legalmente exigido</li>
</ul>

<h2>O que NÃO fazemos</h2>
<ul>
<li>Vender seus dados para terceiros</li>
<li>Compartilhar sem sua autorização</li>
<li>Usar para fins não informados</li>
<li>Manter dados além do necessário</li>
</ul>

<h2>Controle das comunicações</h2>
<p>Você pode gerenciar preferências de comunicação:</p>
<ul>
<li>Acessando configurações da conta</li>
<li>Clicando em "descadastrar" nos e-mails</li>
<li>Solicitando pelo suporte</li>
</ul>`,
    },
    {
      slug: 'comunicacao-oficial',
      title: 'Comunicação oficial do Bolsa Click',
      description: 'Aprenda a identificar mensagens legítimas e se proteger contra golpes.',
      metaTitle: 'Comunicação oficial | Central de Ajuda - Bolsa Click',
      metaDescription: 'Aprenda a identificar comunicações oficiais do Bolsa Click e se proteger contra golpes.',
      order: 7,
      content: `<p class="quick-answer">Nossa comunicação oficial sempre vem de e-mails @bolsaclick.com.br, nosso WhatsApp verificado ou pelo próprio site. Nunca pedimos senha, dados bancários por e-mail ou pagamentos em contas pessoais. Em caso de dúvida, entre em contato pelos canais oficiais.</p>

<h2>Canais oficiais</h2>
<ul>
<li><strong>Site:</strong> www.bolsaclick.com.br (sempre com HTTPS)</li>
<li><strong>E-mail:</strong> Domínio @bolsaclick.com.br</li>
<li><strong>WhatsApp:</strong> Número oficial verificado</li>
<li><strong>Redes sociais:</strong> Perfis verificados</li>
</ul>

<h2>O que NUNCA pedimos</h2>
<ul>
<li>Sua senha por e-mail, WhatsApp ou telefone</li>
<li>Dados completos do cartão de crédito por e-mail</li>
<li>Pagamento em contas pessoais (PF)</li>
<li>Depósito em contas que não sejam da empresa</li>
<li>Códigos de verificação do WhatsApp</li>
</ul>

<h2>Como identificar golpes</h2>
<p>Desconfie se:</p>
<ul>
<li>E-mail vem de domínio diferente</li>
<li>Pedem dados sensíveis por mensagem</li>
<li>Links levam para sites suspeitos</li>
<li>Oferecem condições muito diferentes do site</li>
<li>Pressionam para decisão urgente</li>
<li>Pedem pagamento por meios não oficiais</li>
</ul>

<h2>O que fazer se suspeitar de golpe</h2>
<ol>
<li>Não clique em links suspeitos</li>
<li>Não forneça dados pessoais</li>
<li>Acesse o site diretamente digitando o endereço</li>
<li>Entre em contato pelos canais oficiais</li>
<li>Denuncie tentativas de golpe</li>
</ol>

<h2>Em caso de dúvida</h2>
<p>Se receber qualquer comunicação suspeita:</p>
<ul>
<li>Não responda a mensagem</li>
<li>Acesse o site oficial diretamente</li>
<li>Fale com nosso suporte para confirmar</li>
</ul>`,
    },
  ],
}

async function main() {
  console.log('🚀 Iniciando migração parte 4 da Central de Ajuda...\n')

  const categories = await prisma.helpCategory.findMany()
  const categoryMap: Record<string, string> = {}
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id
  })

  console.log('📝 Criando artigos parte 4 (Segurança e Privacidade)...')
  let articleCount = 0
  let skippedCount = 0

  for (const [categorySlug, articles] of Object.entries(ARTICLES_PART4)) {
    const categoryId = categoryMap[categorySlug]
    if (!categoryId) {
      console.log(`  ❌ Categoria não encontrada: ${categorySlug}`)
      continue
    }

    console.log(`\n  📂 ${categorySlug}:`)

    for (const article of articles) {
      const existing = await prisma.helpArticle.findUnique({
        where: { categoryId_slug: { categoryId, slug: article.slug } }
      })

      if (existing) {
        console.log(`    ⏭️  ${article.title} (já existe)`)
        skippedCount++
      } else {
        await prisma.helpArticle.create({
          data: {
            categoryId,
            slug: article.slug,
            title: article.title,
            description: article.description,
            content: article.content,
            metaTitle: article.metaTitle,
            metaDescription: article.metaDescription,
            order: article.order,
            isActive: true,
            publishedAt: new Date(),
          }
        })
        console.log(`    ✅ ${article.title}`)
        articleCount++
      }
    }
  }

  console.log('\n========================================')
  console.log(`✅ ${articleCount} artigos criados`)
  if (skippedCount > 0) {
    console.log(`⏭️  ${skippedCount} artigos já existiam`)
  }
  console.log('========================================\n')
  console.log('🎉 Migração completa da Central de Ajuda!')
}

main()
  .catch((error) => {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
