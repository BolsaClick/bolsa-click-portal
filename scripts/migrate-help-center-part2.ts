/**
 * Parte 2 da migração - Artigos das categorias restantes
 *
 * Para executar:
 * npx tsx scripts/migrate-help-center-part2.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ARTICLES_PART2: Record<string, Array<{
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  content: string
  order: number
}>> = {
  'bolsas-descontos-regras': [
    {
      slug: 'validade-bolsa',
      title: 'Por quanto tempo a bolsa é válida?',
      description: 'Saiba por quanto tempo sua bolsa permanece ativa e quais condições garantem o desconto.',
      metaTitle: 'Por quanto tempo a bolsa é válida? | Central de Ajuda',
      metaDescription: 'Descubra a validade da sua bolsa de estudos e as condições para manter o desconto durante todo o curso.',
      order: 1,
      content: `<p class="quick-answer">Sua bolsa é válida durante todo o curso, desde a matrícula até a formatura. O percentual de desconto é garantido em todas as mensalidades, sem prazo de expiração, desde que você mantenha a matrícula ativa e cumpra as condições básicas da instituição.</p>

<h2>Garantia durante todo o curso</h2>
<p>Quando você garante uma bolsa pelo Bolsa Click:</p>
<ul>
<li>O desconto vale da primeira à última mensalidade</li>
<li>Não há "prazo de validade" para o benefício</li>
<li>O percentual permanece o mesmo até sua formatura</li>
<li>A garantia é formalizada no contrato de matrícula</li>
</ul>

<h2>Condições para manter a bolsa</h2>
<p>Para manter seu desconto ativo, geralmente você precisa:</p>
<ul>
<li><strong>Manter matrícula ativa:</strong> Não trancar nem abandonar o curso</li>
<li><strong>Pagamentos em dia:</strong> Mensalidades pagas até o vencimento</li>
<li><strong>Frequência mínima:</strong> Comparecer às aulas (presencial) ou acessar a plataforma (EAD)</li>
</ul>
<p><strong>Importante:</strong> Cada faculdade pode ter regras específicas. Leia atentamente o contrato.</p>

<h2>E se eu trancar o curso?</h2>
<p>Ao trancar:</p>
<ul>
<li>Sua bolsa fica "pausada" junto com o curso</li>
<li>Ao retornar, verifique com a faculdade se o desconto será mantido</li>
<li>Em alguns casos, pode ser necessário garantir uma nova bolsa</li>
</ul>

<h2>A bolsa pode ser cancelada?</h2>
<p>Sua bolsa pode ser cancelada apenas em casos específicos:</p>
<ul>
<li>Abandono do curso sem comunicação</li>
<li>Inadimplência prolongada (vários meses)</li>
<li>Fraude ou informações falsas no cadastro</li>
</ul>`,
    },
    {
      slug: 'bolsa-pode-mudar',
      title: 'A bolsa pode mudar de valor?',
      description: 'Entenda se o percentual da sua bolsa pode ser alterado e como funcionam os reajustes.',
      metaTitle: 'A bolsa pode mudar de valor? | Central de Ajuda',
      metaDescription: 'Saiba se o percentual da sua bolsa de estudos pode ser alterado e entenda como funcionam os reajustes de mensalidade.',
      order: 2,
      content: `<p class="quick-answer">O percentual de desconto da sua bolsa não muda. Se você garantiu 70% de desconto, continuará com 70% durante todo o curso. O que pode mudar é o valor base da mensalidade (reajuste anual), mas seu percentual de desconto permanece o mesmo.</p>

<h2>O que permanece igual</h2>
<ul>
<li><strong>Percentual de desconto:</strong> Se garantiu 70%, terá 70% sempre</li>
<li><strong>Condições contratuais:</strong> O que foi acordado no contrato é mantido</li>
<li><strong>Benefícios da bolsa:</strong> Todos os direitos permanecem válidos</li>
</ul>

<h2>O que pode mudar</h2>
<ul>
<li><strong>Valor base da mensalidade:</strong> Faculdades podem reajustar anualmente (inflação, por exemplo)</li>
<li><strong>Seu valor final:</strong> Aumenta proporcionalmente ao reajuste, mas o desconto permanece</li>
</ul>

<h3>Exemplo prático:</h3>
<p>Bolsa de 60% em um curso de R$ 1.000:</p>
<ul>
<li><strong>Ano 1:</strong> Mensalidade R$ 1.000 → você paga R$ 400</li>
<li><strong>Ano 2:</strong> Reajuste de 10% → Mensalidade R$ 1.100 → você paga R$ 440</li>
</ul>
<p>Note: você continua com 60% de desconto, mas o valor base mudou.</p>

<h2>Posso perder o desconto?</h2>
<p>Seu desconto só é perdido em casos graves como:</p>
<ul>
<li>Abandono do curso</li>
<li>Fraude comprovada</li>
<li>Descumprimento grave do contrato</li>
</ul>
<p>Inadimplência temporária não cancela sua bolsa automaticamente - a faculdade primeiro tentará negociar.</p>`,
    },
    {
      slug: 'exigencias',
      title: 'Existe exigência de nota, presença ou desempenho?',
      description: 'Descubra se há requisitos acadêmicos para manter sua bolsa de estudo.',
      metaTitle: 'Exigências para manter a bolsa | Central de Ajuda',
      metaDescription: 'Saiba se existem exigências de nota, presença ou desempenho acadêmico para manter sua bolsa de estudos.',
      order: 3,
      content: `<p class="quick-answer">As bolsas do Bolsa Click geralmente não exigem nota mínima ou desempenho acadêmico específico para serem mantidas. Porém, você deve cumprir os requisitos básicos da faculdade como frequência mínima e manter a matrícula ativa. Cada instituição pode ter suas próprias regras.</p>

<h2>Requisitos comuns</h2>
<p>Na maioria dos casos, para manter sua bolsa você precisa:</p>
<ul>
<li><strong>Frequência mínima:</strong> Geralmente 75% das aulas (para presencial)</li>
<li><strong>Matrícula ativa:</strong> Não trancar nem abandonar o curso</li>
<li><strong>Pagamentos em dia:</strong> Manter as mensalidades em dia</li>
</ul>

<h2>Nota mínima é exigida?</h2>
<p>Na maioria das bolsas do Bolsa Click, <strong>não há exigência de nota mínima</strong> para manter o desconto. Porém:</p>
<ul>
<li>Você precisa ser aprovado nas disciplinas para avançar no curso</li>
<li>Reprovações não cancelam a bolsa, mas você pode precisar refazer matérias</li>
<li>Algumas bolsas específicas (mérito) podem ter requisitos diferentes</li>
</ul>

<h2>Diferença de bolsas por mérito</h2>
<p>Existem dois tipos principais:</p>
<ul>
<li><strong>Bolsa padrão:</strong> Sem exigência de nota - a maioria das bolsas do Bolsa Click</li>
<li><strong>Bolsa por mérito:</strong> Exige manutenção de média mínima - menos comum</li>
</ul>
<p>Na página da bolsa, sempre informamos se há alguma exigência especial.</p>

<h2>Dica importante</h2>
<p>Mesmo sem exigência de nota para a bolsa, seu objetivo é se formar. Foque nos estudos e aproveite a oportunidade!</p>`,
    },
    {
      slug: 'cumulativa',
      title: 'Bolsa é cumulativa com ENEM, PROUNI ou FIES?',
      description: 'Saiba se você pode combinar a bolsa do Bolsa Click com outros programas educacionais.',
      metaTitle: 'Bolsa é cumulativa com outros programas? | Central de Ajuda',
      metaDescription: 'Descubra se a bolsa do Bolsa Click pode ser combinada com ENEM, PROUNI, FIES e outros programas de financiamento estudantil.',
      order: 4,
      content: `<p class="quick-answer">Geralmente, as bolsas do Bolsa Click não são cumulativas com PROUNI ou FIES, pois são programas diferentes. No entanto, você pode usar sua nota do ENEM para ingressar em algumas faculdades parceiras. Cada instituição tem suas próprias regras de acumulação.</p>

<h2>Bolsa Click + ENEM</h2>
<p>Sua nota do ENEM pode ser útil de duas formas:</p>
<ul>
<li><strong>Ingresso direto:</strong> Algumas faculdades aceitam a nota do ENEM como processo seletivo</li>
<li><strong>Bolsa adicional:</strong> Notas altas podem dar descontos extras em algumas instituições</li>
</ul>
<p>Consulte a página do curso para ver se aceita ENEM.</p>

<h2>Bolsa Click + PROUNI</h2>
<p><strong>Não são cumulativas.</strong> O PROUNI é um programa governamental com regras próprias:</p>
<ul>
<li>PROUNI exige renda familiar específica</li>
<li>Tem processo seletivo próprio via Sisu</li>
<li>Se você tem PROUNI, não precisa do Bolsa Click (e vice-versa)</li>
</ul>

<h2>Bolsa Click + FIES</h2>
<p><strong>Pode ser possível em alguns casos:</strong></p>
<ul>
<li>FIES é financiamento (você paga depois), não bolsa</li>
<li>Algumas faculdades permitem usar FIES para a parte não coberta pela bolsa</li>
<li>Consulte diretamente com a instituição sobre essa possibilidade</li>
</ul>

<h2>Outras bolsas da própria faculdade</h2>
<p>Geralmente não são cumulativas:</p>
<ul>
<li>Você usa a bolsa do Bolsa Click OU a bolsa da faculdade</li>
<li>Normalmente se aplica o maior desconto disponível</li>
<li>Exceções existem - pergunte à faculdade</li>
</ul>`,
    },
    {
      slug: 'desconto-boleto',
      title: 'O desconto aparece em qual boleto?',
      description: 'Entenda a partir de quando o desconto é aplicado e como identificá-lo no boleto.',
      metaTitle: 'Quando o desconto aparece no boleto? | Central de Ajuda',
      metaDescription: 'Saiba quando o desconto da sua bolsa aparece no boleto e como identificar que o benefício está sendo aplicado corretamente.',
      order: 5,
      content: `<p class="quick-answer">O desconto aparece desde o primeiro boleto após a matrícula. Você verá o valor original e o valor com desconto claramente indicados. Se a primeira mensalidade for proporcional (entrada no meio do mês), o desconto já estará aplicado nela.</p>

<h2>Como identificar o desconto no boleto</h2>
<p>No boleto da faculdade, você encontra:</p>
<ul>
<li><strong>Valor bruto/original:</strong> Preço cheio da mensalidade</li>
<li><strong>Desconto/Bolsa:</strong> Valor do desconto aplicado</li>
<li><strong>Valor líquido/final:</strong> O que você realmente paga</li>
</ul>

<h2>Quando o desconto começa a valer?</h2>
<ul>
<li><strong>Primeira mensalidade:</strong> Já vem com desconto</li>
<li><strong>Mensalidade proporcional:</strong> Se você entrar no meio do mês, o desconto é aplicado proporcionalmente</li>
<li><strong>Demais mensalidades:</strong> Todas terão o mesmo percentual de desconto</li>
</ul>

<h2>E se o desconto não aparecer?</h2>
<p>Se você receber um boleto sem o desconto prometido:</p>
<ol>
<li>Não pague o boleto errado</li>
<li>Entre em contato imediato com a faculdade</li>
<li>Informe que você tem bolsa pelo Bolsa Click</li>
<li>Apresente o comprovante de garantia da bolsa</li>
<li>Se não resolver, acione nosso suporte</li>
</ol>

<h2>A pré-matrícula é descontada da primeira mensalidade?</h2>
<p>Depende da faculdade:</p>
<ul>
<li>Algumas abatem o valor da pré-matrícula da primeira mensalidade</li>
<li>Outras consideram como taxa separada</li>
<li>Essa informação consta no momento da garantia da bolsa</li>
</ul>`,
    },
  ],
  'pagamento-taxas-reembolso': [
    {
      slug: 'taxas',
      title: 'Preciso pagar alguma taxa ao Bolsa Click?',
      description: 'Saiba quais taxas são cobradas e o que está incluso no serviço do Bolsa Click.',
      metaTitle: 'Taxas do Bolsa Click | Central de Ajuda',
      metaDescription: 'Entenda quais taxas são cobradas pelo Bolsa Click e o que está incluso no serviço de bolsas de estudo.',
      order: 1,
      content: `<p class="quick-answer">Criar conta e buscar bolsas é 100% gratuito. Você só paga a taxa de pré-matrícula quando decide garantir uma bolsa específica. Esse valor é usado para reservar sua vaga e pode ser abatido da primeira mensalidade em algumas faculdades.</p>

<h2>O que é gratuito</h2>
<ul>
<li>Criar conta na plataforma</li>
<li>Buscar e comparar cursos</li>
<li>Visualizar detalhes das bolsas</li>
<li>Receber atendimento da nossa equipe</li>
<li>Criar alertas de novas vagas</li>
</ul>

<h2>Taxa de pré-matrícula</h2>
<p>Quando você decide garantir uma bolsa, paga uma taxa de pré-matrícula:</p>
<ul>
<li><strong>O que é:</strong> Uma taxa para reservar sua vaga com desconto</li>
<li><strong>Para onde vai:</strong> Parte fica com o Bolsa Click (intermediação) e parte com a faculdade</li>
<li><strong>Abatimento:</strong> Algumas faculdades descontam esse valor da primeira mensalidade</li>
</ul>

<h2>Valor da pré-matrícula</h2>
<p>O valor varia de acordo com:</p>
<ul>
<li>O curso escolhido</li>
<li>A faculdade parceira</li>
<li>O percentual de desconto da bolsa</li>
</ul>
<p>O valor exato é mostrado claramente antes de você confirmar a garantia da bolsa.</p>

<h2>Outras taxas</h2>
<p>Além da pré-matrícula do Bolsa Click, a faculdade pode cobrar:</p>
<ul>
<li>Taxa de matrícula (semestral ou anual)</li>
<li>Taxa de material didático</li>
<li>Outras taxas administrativas</li>
</ul>
<p>Essas taxas são da faculdade, não do Bolsa Click, e são informadas no momento da matrícula.</p>`,
    },
    {
      slug: 'pre-matricula',
      title: 'Como funciona o pagamento da pré-matrícula?',
      description: 'Entenda o que é a pré-matrícula, valor, formas de pagamento e para onde vai esse valor.',
      metaTitle: 'Pagamento da pré-matrícula | Central de Ajuda',
      metaDescription: 'Saiba como funciona o pagamento da pré-matrícula no Bolsa Click: valor, formas de pagamento e o que acontece depois.',
      order: 2,
      content: `<p class="quick-answer">A pré-matrícula é paga online no momento de garantir sua bolsa. Aceitamos Pix, cartão de crédito e boleto bancário. Após o pagamento, sua vaga está reservada e você recebe confirmação imediata por e-mail e WhatsApp.</p>

<h2>Formas de pagamento aceitas</h2>
<ul>
<li><strong>Pix:</strong> Pagamento instantâneo, confirmação imediata</li>
<li><strong>Cartão de crédito:</strong> Aprovação em minutos (parcelamento disponível em alguns casos)</li>
<li><strong>Boleto bancário:</strong> Prazo de 1-2 dias úteis para compensação</li>
</ul>

<h2>Passo a passo do pagamento</h2>
<ol>
<li>Escolha o curso e clique em "Garantir bolsa"</li>
<li>Faça login ou crie sua conta</li>
<li>Preencha seus dados pessoais</li>
<li>Escolha a forma de pagamento</li>
<li>Confirme a transação</li>
<li>Receba confirmação por e-mail e WhatsApp</li>
</ol>

<h2>O que acontece após o pagamento?</h2>
<ul>
<li>Sua vaga está oficialmente reservada</li>
<li>Você recebe comprovante por e-mail</li>
<li>Nossa equipe entra em contato pelo WhatsApp</li>
<li>A faculdade é notificada sobre seu interesse</li>
<li>Em até 2 dias úteis, a faculdade entra em contato</li>
</ul>

<h2>É seguro pagar online?</h2>
<p>Sim! Utilizamos:</p>
<ul>
<li>Certificado SSL (criptografia)</li>
<li>Gateway de pagamento confiável</li>
<li>Proteção contra fraudes</li>
<li>Comprovante de todas as transações</li>
</ul>`,
    },
    {
      slug: 'reembolso',
      title: 'Em quais casos tenho direito a reembolso?',
      description: 'Conheça as situações em que você pode solicitar reembolso da pré-matrícula.',
      metaTitle: 'Política de reembolso | Central de Ajuda',
      metaDescription: 'Saiba em quais casos você tem direito a reembolso da pré-matrícula no Bolsa Click.',
      order: 3,
      content: `<p class="quick-answer">Você tem direito a reembolso quando: a faculdade não oferece o curso/turno prometido, há erro no valor do desconto, a faculdade não entra em contato em tempo hábil, ou você desiste dentro do prazo de arrependimento (7 dias). Desistências após o prazo não têm reembolso garantido.</p>

<h2>Situações com direito a reembolso</h2>

<h3>1. Problemas da faculdade</h3>
<ul>
<li>Curso não disponível como anunciado</li>
<li>Turno ou modalidade diferentes do prometido</li>
<li>Desconto menor que o garantido</li>
<li>Faculdade não entra em contato</li>
</ul>

<h3>2. Direito de arrependimento</h3>
<ul>
<li>Desistência em até 7 dias da compra</li>
<li>Garantido pelo Código de Defesa do Consumidor</li>
<li>Não precisa justificar o motivo</li>
</ul>

<h3>3. Erro no processamento</h3>
<ul>
<li>Cobrança em duplicidade</li>
<li>Valor diferente do informado</li>
<li>Falha técnica no pagamento</li>
</ul>

<h2>Situações sem reembolso</h2>
<ul>
<li>Desistência após 7 dias sem motivo válido</li>
<li>Não comparecimento à matrícula</li>
<li>Documentação incompleta ou irregular</li>
<li>Reprovação em processo seletivo (quando exigido)</li>
</ul>

<h2>Como solicitar reembolso</h2>
<ol>
<li>Entre em contato com nosso suporte</li>
<li>Explique o motivo da solicitação</li>
<li>Envie documentos se necessário</li>
<li>Aguarde análise (até 5 dias úteis)</li>
<li>Se aprovado, receba o reembolso</li>
</ol>`,
    },
    {
      slug: 'prazos-devolucao',
      title: 'Prazos e forma de devolução',
      description: 'Saiba quanto tempo leva para receber seu reembolso e como é feita a devolução.',
      metaTitle: 'Prazos de reembolso | Central de Ajuda',
      metaDescription: 'Entenda os prazos e formas de devolução do reembolso no Bolsa Click.',
      order: 4,
      content: `<p class="quick-answer">Após aprovação do reembolso, o prazo de devolução é de 7 a 14 dias úteis. O valor é devolvido pela mesma forma de pagamento original: estorno no cartão, Pix para a conta informada ou transferência bancária.</p>

<h2>Prazos de reembolso</h2>
<ul>
<li><strong>Análise da solicitação:</strong> Até 5 dias úteis</li>
<li><strong>Processamento do reembolso:</strong> 2 a 3 dias úteis após aprovação</li>
<li><strong>Crédito na conta/cartão:</strong> 5 a 10 dias úteis adicionais</li>
</ul>
<p><strong>Prazo total estimado:</strong> 7 a 14 dias úteis</p>

<h2>Formas de devolução</h2>

<h3>Pagamento com cartão de crédito</h3>
<ul>
<li>Estorno feito na fatura do cartão</li>
<li>Pode aparecer na fatura atual ou próxima</li>
<li>Prazo depende da operadora do cartão</li>
</ul>

<h3>Pagamento com Pix</h3>
<ul>
<li>Transferência Pix para sua conta</li>
<li>Processamento mais rápido</li>
<li>Precisa informar chave Pix para devolução</li>
</ul>

<h3>Pagamento com boleto</h3>
<ul>
<li>Transferência bancária (TED)</li>
<li>Precisa informar dados bancários completos</li>
<li>Pode levar alguns dias a mais</li>
</ul>

<h2>Acompanhamento do reembolso</h2>
<p>Você pode acompanhar o status:</p>
<ul>
<li>Por e-mail (enviamos atualizações)</li>
<li>Pelo WhatsApp do suporte</li>
<li>Entrando em contato com nossa equipe</li>
</ul>`,
    },
    {
      slug: 'cancelamento',
      title: 'Cancelamento e desistência',
      description: 'Entenda como funciona o cancelamento antes e após a matrícula e a política de reembolso.',
      metaTitle: 'Cancelamento e desistência | Central de Ajuda',
      metaDescription: 'Saiba como funciona o cancelamento da bolsa e a política de desistência no Bolsa Click.',
      order: 5,
      content: `<p class="quick-answer">Você pode cancelar em até 7 dias após garantir a bolsa com reembolso integral. Após esse prazo ou após a matrícula na faculdade, o reembolso depende de análise e das políticas da instituição. Entre em contato conosco para avaliar seu caso.</p>

<h2>Cancelamento antes da matrícula</h2>

<h3>Até 7 dias (direito de arrependimento)</h3>
<ul>
<li>Reembolso integral garantido</li>
<li>Não precisa justificar</li>
<li>Basta solicitar pelo suporte</li>
</ul>

<h3>Após 7 dias</h3>
<ul>
<li>Reembolso sujeito a análise</li>
<li>Pode haver retenção de valores</li>
<li>Cada caso é avaliado individualmente</li>
</ul>

<h2>Cancelamento após a matrícula</h2>
<p>Se você já se matriculou na faculdade:</p>
<ul>
<li>A política de cancelamento é da faculdade</li>
<li>O Bolsa Click não pode garantir reembolso nessa fase</li>
<li>Entre em contato com a faculdade diretamente</li>
<li>Podemos ajudar a mediar o processo</li>
</ul>

<h2>Como solicitar cancelamento</h2>
<ol>
<li>Entre em contato pelo WhatsApp ou e-mail</li>
<li>Informe o motivo do cancelamento</li>
<li>Envie documentos se solicitado</li>
<li>Aguarde resposta da análise</li>
</ol>

<h2>Dica importante</h2>
<p>Antes de cancelar, converse conosco. Muitas vezes podemos ajudar a resolver o problema que está causando a desistência, seja trocando de curso, turno ou faculdade.</p>`,
    },
  ],
}

async function main() {
  console.log('🚀 Iniciando migração parte 2 da Central de Ajuda...\n')

  // Buscar IDs das categorias existentes
  const categories = await prisma.helpCategory.findMany()
  const categoryMap: Record<string, string> = {}
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id
  })

  console.log('📝 Criando artigos parte 2...')
  let articleCount = 0
  let skippedCount = 0

  for (const [categorySlug, articles] of Object.entries(ARTICLES_PART2)) {
    const categoryId = categoryMap[categorySlug]
    if (!categoryId) {
      console.log(`  ❌ Categoria não encontrada: ${categorySlug}`)
      continue
    }

    console.log(`\n  📂 ${categorySlug}:`)

    for (const article of articles) {
      const existing = await prisma.helpArticle.findUnique({
        where: {
          categoryId_slug: {
            categoryId,
            slug: article.slug,
          }
        }
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
}

main()
  .catch((error) => {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
