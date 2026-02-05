/**
 * Parte 3 da migração - Artigos das categorias restantes
 *
 * Para executar:
 * npx tsx scripts/migrate-help-center-part3.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ARTICLES_PART3: Record<string, Array<{
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  content: string
  order: number
}>> = {
  'matricula-faculdade': [
    {
      slug: 'como-fazer-matricula',
      title: 'Como faço minha matrícula na faculdade?',
      description: 'Passo a passo completo do processo de matrícula após garantir sua bolsa.',
      metaTitle: 'Como fazer matrícula na faculdade | Central de Ajuda',
      metaDescription: 'Aprenda o passo a passo completo para fazer sua matrícula na faculdade após garantir a bolsa pelo Bolsa Click.',
      order: 1,
      content: `<p class="quick-answer">Após garantir sua bolsa, a faculdade entra em contato em até 2 dias úteis com as instruções de matrícula. Você prepara os documentos solicitados, envia de forma online ou presencial, assina o contrato e está oficialmente matriculado!</p>

<h2>Passo a passo da matrícula</h2>

<h3>1. Aguarde o contato da faculdade</h3>
<p>Após garantir sua bolsa:</p>
<ul>
<li>A faculdade recebe seus dados</li>
<li>Em até 2 dias úteis, entram em contato</li>
<li>Você recebe instruções detalhadas</li>
</ul>

<h3>2. Prepare seus documentos</h3>
<p>Geralmente são necessários:</p>
<ul>
<li>RG e CPF</li>
<li>Comprovante de residência</li>
<li>Certificado de conclusão do Ensino Médio</li>
<li>Histórico escolar</li>
<li>Foto 3x4</li>
</ul>

<h3>3. Envie a documentação</h3>
<ul>
<li><strong>Online:</strong> Upload no portal da faculdade</li>
<li><strong>Presencial:</strong> Entrega na secretaria</li>
</ul>

<h3>4. Assine o contrato</h3>
<ul>
<li>Leia atentamente todas as cláusulas</li>
<li>Verifique se o desconto está correto</li>
<li>Assine digitalmente ou presencialmente</li>
</ul>

<h3>5. Pronto!</h3>
<p>Você está oficialmente matriculado e receberá:</p>
<ul>
<li>Confirmação de matrícula</li>
<li>Dados de acesso ao portal do aluno</li>
<li>Calendário acadêmico</li>
</ul>`,
    },
    {
      slug: 'documentos',
      title: 'Documentos necessários',
      description: 'Lista completa de documentos para matrícula e como enviá-los de forma segura.',
      metaTitle: 'Documentos para matrícula | Central de Ajuda',
      metaDescription: 'Confira a lista completa de documentos necessários para fazer sua matrícula na faculdade.',
      order: 2,
      content: `<p class="quick-answer">Os documentos básicos são: RG, CPF, comprovante de residência, certificado de conclusão do Ensino Médio, histórico escolar e foto 3x4. Algumas faculdades podem pedir documentos adicionais. A lista exata é enviada pela instituição após você garantir a bolsa.</p>

<h2>Documentos obrigatórios</h2>
<ul>
<li><strong>RG (Identidade):</strong> Cópia simples, legível</li>
<li><strong>CPF:</strong> Pode ser o que consta no RG</li>
<li><strong>Comprovante de residência:</strong> Últimos 3 meses (água, luz, telefone)</li>
<li><strong>Certificado de Ensino Médio:</strong> Original ou cópia autenticada</li>
<li><strong>Histórico escolar:</strong> Do Ensino Médio completo</li>
<li><strong>Foto 3x4:</strong> Recente, fundo branco</li>
</ul>

<h2>Documentos que podem ser solicitados</h2>
<ul>
<li>Título de eleitor (maiores de 18)</li>
<li>Certificado de reservista (homens)</li>
<li>Certidão de nascimento ou casamento</li>
<li>Comprovante de quitação eleitoral</li>
</ul>

<h2>Formato para envio online</h2>
<ul>
<li>Arquivos em PDF ou imagem (JPG, PNG)</li>
<li>Documentos legíveis e sem cortes</li>
<li>Tamanho máximo por arquivo varia por faculdade</li>
</ul>

<h2>Dicas importantes</h2>
<ul>
<li>Digitalize ou fotografe com boa iluminação</li>
<li>Confira se todos os dados estão legíveis</li>
<li>Guarde os originais em local seguro</li>
<li>Se tiver dúvidas, pergunte à faculdade</li>
</ul>`,
    },
    {
      slug: 'online-presencial',
      title: 'Matrícula online vs presencial',
      description: 'Entenda as diferenças entre os dois formatos e qual escolher para sua situação.',
      metaTitle: 'Matrícula online ou presencial | Central de Ajuda',
      metaDescription: 'Entenda a diferença entre matrícula online e presencial e escolha a melhor opção para você.',
      order: 3,
      content: `<p class="quick-answer">A matrícula online é feita 100% pela internet: você envia documentos digitalizados e assina contrato digitalmente. A presencial exige visita à faculdade para entrega de documentos e assinatura. Ambas têm a mesma validade - escolha a mais conveniente para você.</p>

<h2>Matrícula Online</h2>
<h3>Vantagens:</h3>
<ul>
<li>Faz de casa, sem deslocamento</li>
<li>Disponível 24 horas</li>
<li>Processo mais rápido</li>
<li>Ideal para quem mora longe da faculdade</li>
</ul>

<h3>Como funciona:</h3>
<ol>
<li>Acesse o portal da faculdade</li>
<li>Faça upload dos documentos digitalizados</li>
<li>Preencha formulários online</li>
<li>Assine o contrato digitalmente</li>
<li>Receba confirmação por e-mail</li>
</ol>

<h2>Matrícula Presencial</h2>
<h3>Vantagens:</h3>
<ul>
<li>Tire dúvidas pessoalmente</li>
<li>Conheça a estrutura da faculdade</li>
<li>Resolução imediata de pendências</li>
<li>Ideal para quem prefere atendimento pessoal</li>
</ul>

<h3>Como funciona:</h3>
<ol>
<li>Agende horário com a secretaria</li>
<li>Leve todos os documentos originais</li>
<li>Entregue cópias necessárias</li>
<li>Assine o contrato no local</li>
<li>Receba comprovante imediato</li>
</ol>

<h2>Qual escolher?</h2>
<ul>
<li><strong>Online:</strong> Se você tem facilidade com tecnologia e quer praticidade</li>
<li><strong>Presencial:</strong> Se prefere atendimento pessoal ou quer conhecer a faculdade</li>
</ul>`,
    },
    {
      slug: 'quando-comeco',
      title: 'Quando começo a estudar?',
      description: 'Saiba quando começam as aulas e como funciona o calendário acadêmico.',
      metaTitle: 'Quando começo a estudar? | Central de Ajuda',
      metaDescription: 'Descubra quando começam as aulas após a matrícula e entenda o calendário acadêmico.',
      order: 4,
      content: `<p class="quick-answer">O início das aulas depende do calendário acadêmico da faculdade. Geralmente, os semestres começam em fevereiro/março e agosto. Se você se matricular após o início do semestre, pode entrar imediatamente ou aguardar o próximo período, dependendo da política da instituição.</p>

<h2>Calendário acadêmico</h2>
<p>A maioria das faculdades segue:</p>
<ul>
<li><strong>1º semestre:</strong> Fevereiro a Junho</li>
<li><strong>2º semestre:</strong> Agosto a Dezembro</li>
</ul>

<h2>Entrada durante o semestre</h2>
<p>Algumas faculdades permitem:</p>
<ul>
<li><strong>Entrada imediata:</strong> Você começa assim que a matrícula é confirmada</li>
<li><strong>Entrada no próximo módulo:</strong> Se o curso for modular</li>
<li><strong>Aguardar próximo semestre:</strong> Em cursos com turmas fechadas</li>
</ul>

<h2>Cursos EAD</h2>
<p>Geralmente têm mais flexibilidade:</p>
<ul>
<li>Entradas mais frequentes (mensais ou bimestrais)</li>
<li>Possibilidade de começar imediatamente</li>
<li>Calendário próprio de cada curso</li>
</ul>

<h2>Semana de integração</h2>
<p>Muitas faculdades oferecem:</p>
<ul>
<li>Apresentação da instituição</li>
<li>Conhecimento dos colegas</li>
<li>Orientações sobre o curso</li>
<li>Acesso às plataformas</li>
</ul>

<h2>Como saber a data exata?</h2>
<p>A faculdade informa:</p>
<ul>
<li>No momento da matrícula</li>
<li>Por e-mail após confirmação</li>
<li>No portal do aluno</li>
</ul>`,
    },
    {
      slug: 'trocar-curso',
      title: 'Posso trocar de curso, turno ou faculdade?',
      description: 'Descubra as possibilidades de mudança e impacto na sua bolsa de estudo.',
      metaTitle: 'Trocar de curso ou faculdade | Central de Ajuda',
      metaDescription: 'Saiba se é possível trocar de curso, turno ou faculdade e como isso afeta sua bolsa de estudos.',
      order: 5,
      content: `<p class="quick-answer">É possível trocar de curso, turno ou até faculdade após a matrícula, mas sua bolsa original pode não ser transferida. Em geral, você precisaria garantir uma nova bolsa para o novo curso. Antes de trocar, consulte a faculdade e nossa equipe para entender as opções.</p>

<h2>Trocar de turno (mesmo curso e faculdade)</h2>
<ul>
<li>Geralmente é possível</li>
<li>Bolsa costuma ser mantida</li>
<li>Depende de disponibilidade de vagas</li>
<li>Solicite na secretaria da faculdade</li>
</ul>

<h2>Trocar de curso (mesma faculdade)</h2>
<ul>
<li>Possível em muitos casos</li>
<li>Bolsa pode ou não ser transferida</li>
<li>Depende da política da instituição</li>
<li>Pode haver aproveitamento de disciplinas</li>
</ul>

<h2>Trocar de faculdade</h2>
<ul>
<li>Exige nova matrícula</li>
<li>Bolsa original não é transferida</li>
<li>Precisa garantir nova bolsa no Bolsa Click</li>
<li>Documentação de transferência pode ser necessária</li>
</ul>

<h2>Impacto na bolsa</h2>
<p>Mudanças podem afetar seu desconto:</p>
<ul>
<li><strong>Mudança de turno:</strong> Geralmente mantém</li>
<li><strong>Mudança de curso:</strong> Pode variar</li>
<li><strong>Mudança de faculdade:</strong> Nova bolsa necessária</li>
</ul>

<h2>Antes de decidir</h2>
<ol>
<li>Consulte a secretaria da faculdade atual</li>
<li>Pergunte sobre políticas de transferência</li>
<li>Verifique disponibilidade da nova opção</li>
<li>Entre em contato conosco para orientação</li>
</ol>`,
    },
  ],
  'atendimento-suporte': [
    {
      slug: 'como-falar',
      title: 'Como falar com o Bolsa Click?',
      description: 'Conheça todos os canais de atendimento e qual usar em cada situação.',
      metaTitle: 'Como falar com o Bolsa Click | Central de Ajuda',
      metaDescription: 'Conheça todos os canais de atendimento do Bolsa Click e descubra qual usar em cada situação.',
      order: 1,
      content: `<p class="quick-answer">Você pode falar conosco pelo WhatsApp (mais rápido), chat no site, e-mail ou redes sociais. O WhatsApp é o canal mais ágil para dúvidas urgentes. Para assuntos que precisam de documentação, prefira o e-mail.</p>

<h2>Canais de atendimento</h2>

<h3>WhatsApp (Recomendado)</h3>
<ul>
<li>Canal mais rápido</li>
<li>Atendimento humanizado</li>
<li>Ideal para dúvidas rápidas</li>
<li>Acompanhamento de solicitações</li>
</ul>

<h3>Chat no site</h3>
<ul>
<li>Disponível em todas as páginas</li>
<li>Resposta em tempo real</li>
<li>Bom para dúvidas durante a navegação</li>
</ul>

<h3>E-mail</h3>
<ul>
<li>Para assuntos que precisam de registro</li>
<li>Envio de documentos</li>
<li>Solicitações formais</li>
</ul>

<h3>Redes sociais</h3>
<ul>
<li>Instagram e Facebook</li>
<li>Mensagens diretas</li>
<li>Comentários em publicações</li>
</ul>

<h2>Qual canal usar?</h2>
<ul>
<li><strong>Dúvida rápida:</strong> WhatsApp ou Chat</li>
<li><strong>Acompanhar bolsa:</strong> WhatsApp</li>
<li><strong>Enviar documentos:</strong> E-mail</li>
<li><strong>Reclamação formal:</strong> E-mail</li>
<li><strong>Dúvidas gerais:</strong> Qualquer canal</li>
</ul>`,
    },
    {
      slug: 'whatsapp-chat-email',
      title: 'Atendimento via WhatsApp, chat e e-mail',
      description: 'Como usar cada canal de atendimento e tempo de resposta esperado.',
      metaTitle: 'Atendimento WhatsApp, chat e e-mail | Central de Ajuda',
      metaDescription: 'Saiba como usar cada canal de atendimento do Bolsa Click e os tempos de resposta esperados.',
      order: 2,
      content: `<p class="quick-answer">WhatsApp tem resposta em minutos durante o horário comercial. O chat no site também é instantâneo. E-mails são respondidos em até 24 horas úteis. Todos os canais contam com atendimento humanizado.</p>

<h2>WhatsApp</h2>
<ul>
<li><strong>Tempo de resposta:</strong> Minutos (horário comercial)</li>
<li><strong>Vantagens:</strong> Rápido, prático, histórico de conversas</li>
<li><strong>Dica:</strong> Salve o contato para facilitar</li>
</ul>

<h2>Chat no site</h2>
<ul>
<li><strong>Tempo de resposta:</strong> Instantâneo a poucos minutos</li>
<li><strong>Vantagens:</strong> Não sai do site, conveniente</li>
<li><strong>Dica:</strong> Disponível em todas as páginas</li>
</ul>

<h2>E-mail</h2>
<ul>
<li><strong>Tempo de resposta:</strong> Até 24 horas úteis</li>
<li><strong>Vantagens:</strong> Registro formal, anexos</li>
<li><strong>Dica:</strong> Seja detalhado na mensagem</li>
</ul>

<h2>Dicas para um atendimento mais rápido</h2>
<ul>
<li>Informe seu nome completo</li>
<li>Mencione o curso/faculdade de interesse</li>
<li>Descreva sua dúvida claramente</li>
<li>Se já garantiu bolsa, informe o e-mail cadastrado</li>
</ul>`,
    },
    {
      slug: 'horarios',
      title: 'Horário de atendimento',
      description: 'Horários de funcionamento de cada canal e atendimento em feriados.',
      metaTitle: 'Horário de atendimento | Central de Ajuda',
      metaDescription: 'Confira os horários de atendimento do Bolsa Click em todos os canais.',
      order: 3,
      content: `<p class="quick-answer">Nosso atendimento funciona de segunda a sexta, das 9h às 18h. WhatsApp e chat têm respostas mais rápidas. Fora do horário, você pode enviar mensagem e respondemos no próximo dia útil. Em feriados nacionais não há atendimento.</p>

<h2>Horários por canal</h2>

<h3>WhatsApp e Chat</h3>
<ul>
<li>Segunda a sexta: 9h às 18h</li>
<li>Fora do horário: deixe mensagem</li>
</ul>

<h3>E-mail</h3>
<ul>
<li>Recebemos 24 horas</li>
<li>Respondemos em horário comercial</li>
</ul>

<h2>Feriados</h2>
<ul>
<li>Feriados nacionais: sem atendimento</li>
<li>Feriados regionais: atendimento normal</li>
<li>Retorno no próximo dia útil</li>
</ul>

<h2>Mensagens fora do horário</h2>
<p>Você pode enviar mensagem a qualquer momento:</p>
<ul>
<li>Sua mensagem fica registrada</li>
<li>Respondemos assim que retornamos</li>
<li>Ordem de chegada é respeitada</li>
</ul>`,
    },
    {
      slug: 'acompanhamento',
      title: 'Acompanhamento do status da minha bolsa',
      description: 'Saiba como consultar o andamento da sua solicitação em tempo real.',
      metaTitle: 'Acompanhamento da bolsa | Central de Ajuda',
      metaDescription: 'Aprenda a acompanhar o status da sua bolsa de estudos no Bolsa Click.',
      order: 4,
      content: `<p class="quick-answer">Você pode acompanhar sua bolsa pelo portal do Bolsa Click (área do aluno), por e-mail (enviamos atualizações) ou pelo WhatsApp (pergunte a qualquer momento). Cada etapa do processo é comunicada para você saber exatamente onde está.</p>

<h2>Como acompanhar</h2>

<h3>Portal do Bolsa Click</h3>
<ul>
<li>Faça login na sua conta</li>
<li>Acesse "Minhas bolsas"</li>
<li>Veja o status atualizado</li>
</ul>

<h3>E-mail</h3>
<ul>
<li>Receba notificações automáticas</li>
<li>Cada mudança de status gera e-mail</li>
<li>Verifique também a caixa de spam</li>
</ul>

<h3>WhatsApp</h3>
<ul>
<li>Pergunte a qualquer momento</li>
<li>Informamos o status atual</li>
<li>Tire dúvidas sobre próximos passos</li>
</ul>

<h2>Etapas do processo</h2>
<ol>
<li><strong>Bolsa garantida:</strong> Pagamento confirmado</li>
<li><strong>Dados enviados:</strong> Faculdade recebeu seus dados</li>
<li><strong>Aguardando contato:</strong> Faculdade vai entrar em contato</li>
<li><strong>Em matrícula:</strong> Processo de matrícula iniciado</li>
<li><strong>Matriculado:</strong> Parabéns! Você é aluno</li>
</ol>`,
    },
    {
      slug: 'problemas-comuns',
      title: 'Problemas comuns e como resolver',
      description: 'Soluções rápidas para as dúvidas e problemas mais frequentes.',
      metaTitle: 'Problemas comuns | Central de Ajuda',
      metaDescription: 'Encontre soluções rápidas para os problemas mais comuns no Bolsa Click.',
      order: 5,
      content: `<p class="quick-answer">Os problemas mais comuns são: faculdade não entrou em contato, pagamento não confirmado, e-mail não recebido. A maioria tem solução simples - confira abaixo ou entre em contato conosco.</p>

<h2>Problemas e soluções</h2>

<h3>Faculdade não entrou em contato</h3>
<p><strong>Solução:</strong></p>
<ul>
<li>Verifique se já passaram 2 dias úteis</li>
<li>Confira sua caixa de spam</li>
<li>Verifique se o WhatsApp está correto</li>
<li>Entre em contato conosco para intermediar</li>
</ul>

<h3>Pagamento não confirmado</h3>
<p><strong>Solução:</strong></p>
<ul>
<li>Aguarde alguns minutos (Pix é instantâneo)</li>
<li>Boleto pode levar 1-2 dias úteis</li>
<li>Verifique se o pagamento foi concluído</li>
<li>Envie o comprovante para nosso suporte</li>
</ul>

<h3>Não recebi e-mail de confirmação</h3>
<p><strong>Solução:</strong></p>
<ul>
<li>Verifique a caixa de spam/lixo eletrônico</li>
<li>Confira se digitou o e-mail corretamente</li>
<li>Adicione nosso e-mail aos contatos</li>
<li>Solicite reenvio pelo WhatsApp</li>
</ul>

<h3>Desconto diferente do prometido</h3>
<p><strong>Solução:</strong></p>
<ul>
<li>Não pague boleto incorreto</li>
<li>Entre em contato imediatamente</li>
<li>Envie print da bolsa garantida</li>
<li>Intermediamos com a faculdade</li>
</ul>

<h2>Não encontrou seu problema?</h2>
<p>Fale conosco pelo WhatsApp ou chat - estamos aqui para ajudar!</p>`,
    },
  ],
}

async function main() {
  console.log('🚀 Iniciando migração parte 3 da Central de Ajuda...\n')

  const categories = await prisma.helpCategory.findMany()
  const categoryMap: Record<string, string> = {}
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id
  })

  console.log('📝 Criando artigos parte 3...')
  let articleCount = 0
  let skippedCount = 0

  for (const [categorySlug, articles] of Object.entries(ARTICLES_PART3)) {
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
}

main()
  .catch((error) => {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
