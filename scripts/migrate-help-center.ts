/**
 * Script para migrar os dados da Central de Ajuda para o banco de dados
 *
 * Para executar:
 * npx tsx scripts/migrate-help-center.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Categorias da Central de Ajuda
export const CATEGORIES = [
  {
    slug: 'sobre-o-bolsa-click',
    title: 'Sobre o Bolsa Click',
    description: 'Entenda como funciona nossa plataforma e como conseguimos os melhores descontos',
    icon: 'Info',
    order: 1,
  },
  {
    slug: 'primeiros-passos',
    title: 'Primeiros Passos',
    description: 'Aprenda a criar sua conta, buscar e garantir a bolsa ideal para você',
    icon: 'BookOpen',
    order: 2,
  },
  {
    slug: 'bolsas-descontos-regras',
    title: 'Bolsas, Descontos e Regras',
    description: 'Saiba tudo sobre validade, requisitos e como seu desconto é aplicado',
    icon: 'Percent',
    order: 3,
  },
  {
    slug: 'pagamento-taxas-reembolso',
    title: 'Pagamento, Taxas e Reembolso',
    description: 'Entenda custos, formas de pagamento e políticas de cancelamento',
    icon: 'CreditCard',
    order: 4,
  },
  {
    slug: 'matricula-faculdade',
    title: 'Matrícula e Faculdade',
    description: 'Processo de matrícula, documentos necessários e início das aulas',
    icon: 'GraduationCap',
    order: 5,
  },
  {
    slug: 'atendimento-suporte',
    title: 'Atendimento e Suporte',
    description: 'Canais de contato, horários e como acompanhar sua solicitação',
    icon: 'Headphones',
    order: 6,
  },
  {
    slug: 'seguranca-dados-privacidade',
    title: 'Segurança, Dados e Privacidade',
    description: 'Como protegemos suas informações e nossa política de privacidade',
    icon: 'Shield',
    order: 7,
  },
]

// Artigos organizados por categoria
export const ARTICLES: Record<string, Array<{
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  content: string
  order: number
}>> = {
  'sobre-o-bolsa-click': [
    {
      slug: 'o-que-e',
      title: 'O que é o Bolsa Click?',
      description: 'Descubra o que é o Bolsa Click e como nossa plataforma conecta você às melhores oportunidades educacionais.',
      metaTitle: 'O que é o Bolsa Click? | Central de Ajuda',
      metaDescription: 'Descubra o que é o Bolsa Click e como nossa plataforma conecta estudantes a oportunidades educacionais com descontos de até 100%.',
      order: 1,
      content: `<p class="quick-answer">O Bolsa Click é um marketplace educacional que conecta você a milhares de bolsas de estudo e descontos em cursos de graduação, pós-graduação e técnicos. Temos parcerias diretas com faculdades reconhecidas pelo MEC e oferecemos descontos de até 100% com processo simplificado e atendimento humanizado.</p>

<h2>Como o Bolsa Click nasceu</h2>
<p>O Bolsa Click foi criado com um propósito claro: democratizar o acesso ao ensino superior no Brasil. Percebemos que muitas faculdades tinham vagas disponíveis, mas estudantes não conseguiam encontrá-las com facilidade. Ao mesmo tempo, famílias enfrentavam dificuldades para pagar mensalidades integrais.</p>
<p>Nossa solução foi simples: criar uma plataforma digital que conecta esses dois mundos, beneficiando tanto estudantes quanto instituições de ensino.</p>

<h2>O que fazemos</h2>
<p>O Bolsa Click funciona como uma ponte entre você e as faculdades:</p>
<ul>
<li><strong>Negociamos descontos diretos:</strong> Trabalhamos com instituições de ensino para garantir condições especiais que você não encontra sozinho</li>
<li><strong>Simplificamos a busca:</strong> Reunimos milhares de cursos em um só lugar, com filtros por cidade, modalidade, preço e área de interesse</li>
<li><strong>Acompanhamos sua jornada:</strong> Do momento da busca até o início das aulas, nossa equipe está disponível para ajudar</li>
<li><strong>Garantimos transparência:</strong> Sem letras miúdas, sem pegadinhas. Tudo fica claro desde o primeiro contato</li>
</ul>

<h2>Por que somos diferentes</h2>
<p>Diferente de outros intermediários, o Bolsa Click não é apenas um buscador. Somos parceiros oficiais das faculdades, o que significa:</p>
<ul>
<li>Descontos reais e garantidos durante todo o curso</li>
<li>Processo de matrícula simplificado e sem burocracia</li>
<li>Atendimento próximo via WhatsApp, chat e telefone</li>
<li>Acompanhamento personalizado da sua solicitação</li>
</ul>

<h2>Para quem é o Bolsa Click</h2>
<p>Nossa plataforma é para você que:</p>
<ul>
<li>Quer começar ou retomar os estudos com economia</li>
<li>Busca uma graduação, pós-graduação ou curso técnico</li>
<li>Precisa de flexibilidade (oferecemos cursos EAD, presenciais e semipresenciais)</li>
<li>Valoriza atendimento humanizado e processo transparente</li>
</ul>

<h2>Nossa missão</h2>
<p>Acreditamos que educação é a base para transformar vidas e construir um futuro melhor. Nossa missão é tornar o ensino superior acessível para todos os brasileiros, independentemente da sua condição financeira.</p>
<p>Cada bolsa garantida é um sonho realizado, uma família que investe no futuro, um profissional que se qualifica para o mercado.</p>`,
    },
    {
      slug: 'como-funciona',
      title: 'Como o Bolsa Click funciona?',
      description: 'Passo a passo de como nossa plataforma funciona, desde a busca até o início das aulas.',
      metaTitle: 'Como o Bolsa Click funciona? | Central de Ajuda',
      metaDescription: 'Entenda o passo a passo de como funciona o Bolsa Click, desde a busca pela bolsa ideal até o início das aulas na faculdade.',
      order: 2,
      content: `<p class="quick-answer">O processo é simples: você busca cursos na nossa plataforma, escolhe a melhor opção, garante sua bolsa com pagamento online, recebe orientações da faculdade e finaliza a matrícula diretamente na instituição. Acompanhamos você em cada etapa até o início das aulas.</p>

<h2>Passo a passo completo</h2>

<h3>1. Busque cursos na plataforma</h3>
<p>Na página inicial do Bolsa Click, você pode:</p>
<ul>
<li>Pesquisar por nome do curso (exemplo: "Administração", "Enfermagem")</li>
<li>Filtrar por cidade, modalidade (EAD, presencial, semipresencial) e área de interesse</li>
<li>Comparar preços, descontos e faculdades lado a lado</li>
<li>Ver informações detalhadas de cada curso: duração, grade curricular e diferenciais</li>
</ul>
<p><strong>Dica:</strong> Use nossos filtros para encontrar exatamente o que você precisa. Quer estudar à noite? Prefere EAD? Tudo isso pode ser personalizado.</p>

<h3>2. Escolha a bolsa ideal</h3>
<p>Ao clicar em um curso, você encontra:</p>
<ul>
<li><strong>Valor original vs. valor com desconto:</strong> Transparência total sobre economia</li>
<li><strong>Detalhes da faculdade:</strong> Reconhecimento MEC, estrutura, diferenciais</li>
<li><strong>Informações do curso:</strong> Duração, turnos disponíveis, formato das aulas</li>
<li><strong>Condições da bolsa:</strong> Percentual de desconto e validade</li>
</ul>

<h3>3. Garanta sua bolsa</h3>
<p>Para garantir a bolsa, você precisa:</p>
<ul>
<li>Criar uma conta no Bolsa Click (rápido e gratuito)</li>
<li>Preencher seus dados pessoais básicos</li>
<li>Realizar o pagamento da pré-matrícula (valor simbólico que reserva sua vaga)</li>
<li>Aguardar confirmação por e-mail e WhatsApp</li>
</ul>
<p><strong>Importante:</strong> A pré-matrícula garante sua bolsa e seu lugar no curso. Esse valor pode ser abatido da primeira mensalidade ou devolvido em casos específicos de desistência.</p>

<h3>4. Receba orientações da faculdade</h3>
<p>Após garantir sua bolsa:</p>
<ul>
<li>A faculdade entra em contato em até 2 dias úteis</li>
<li>Você recebe a lista de documentos necessários para matrícula</li>
<li>Agendamos a melhor data para você finalizar o processo</li>
<li>Nossa equipe fica disponível para esclarecer qualquer dúvida</li>
</ul>

<h3>5. Finalize a matrícula</h3>
<p>A matrícula pode ser feita:</p>
<ul>
<li><strong>Online:</strong> Envio de documentos digitalizados (RG, CPF, comprovante de residência, histórico escolar)</li>
<li><strong>Presencial:</strong> Visita à unidade da faculdade para entrega de documentos</li>
</ul>
<p>Após a matrícula, você está oficialmente matriculado com seu desconto garantido!</p>

<h3>6. Comece a estudar</h3>
<p>Com a matrícula finalizada:</p>
<ul>
<li>Você recebe login e senha para acessar o sistema da faculdade</li>
<li>Conhece o calendário de aulas e cronograma do semestre</li>
<li>Participa de aulas de integração (se disponível)</li>
<li>Inicia suas aulas com desconto aplicado em todas as mensalidades</li>
</ul>

<h2>Quanto tempo leva todo o processo?</h2>
<p>O tempo médio varia, mas em geral:</p>
<ul>
<li><strong>Garantir a bolsa:</strong> Alguns minutos (pagamento online instantâneo)</li>
<li><strong>Contato da faculdade:</strong> Até 2 dias úteis</li>
<li><strong>Finalização da matrícula:</strong> 3 a 7 dias (depende da documentação)</li>
<li><strong>Início das aulas:</strong> Conforme calendário acadêmico da instituição</li>
</ul>

<h2>E se eu tiver dúvidas durante o processo?</h2>
<p>Estamos sempre disponíveis! Você pode:</p>
<ul>
<li>Falar com nossa equipe pelo WhatsApp (resposta rápida)</li>
<li>Enviar mensagem pelo chat do site</li>
<li>Entrar em contato pelo formulário de atendimento</li>
<li>Consultar esta Central de Ajuda a qualquer momento</li>
</ul>`,
    },
    {
      slug: 'como-conseguimos-descontos',
      title: 'Como conseguimos descontos de até 100%?',
      description: 'Entenda nossa parceria com instituições de ensino e como garantimos os melhores descontos para você.',
      metaTitle: 'Como conseguimos descontos de até 100%? | Central de Ajuda',
      metaDescription: 'Descubra como o Bolsa Click consegue oferecer descontos de até 100% através de parcerias diretas com instituições de ensino.',
      order: 3,
      content: `<p class="quick-answer">Conseguimos esses descontos através de parcerias oficiais e diretas com faculdades reconhecidas pelo MEC. As instituições têm interesse em preencher vagas ociosas e preferem ter alunos com desconto do que deixar turmas vazias. Negociamos condições especiais em grande escala, garantindo benefícios reais e sustentáveis para você.</p>

<h2>O modelo de negócio que beneficia todos</h2>
<p>O segredo está em entender que educação funciona melhor quando há ganho mútuo. Veja como funciona:</p>
<ul>
<li><strong>Faculdades têm vagas disponíveis:</strong> Muitas instituições possuem turmas com lugares não preenchidos, especialmente em determinados turnos ou modalidades</li>
<li><strong>Custos fixos existem independentemente:</strong> Professores, estrutura e material didático são custos que a faculdade já tem, com ou sem você na sala</li>
<li><strong>É melhor ter aluno com desconto do que vaga vazia:</strong> Financeiramente, faz mais sentido oferecer condições especiais do que deixar a vaga ociosa</li>
</ul>
<p>Ao negociar em grande escala, conseguimos descontos que você não teria acesso negociando sozinho com a faculdade.</p>

<h2>Como funcionam as parcerias</h2>
<p>Nossas parcerias são oficiais e transparentes:</p>
<ul>
<li><strong>Contratos formais:</strong> Temos acordos diretos com cada instituição de ensino</li>
<li><strong>Condições pré-negociadas:</strong> Valores e descontos são definidos previamente</li>
<li><strong>Vagas exclusivas:</strong> Muitas ofertas estão disponíveis apenas pelo Bolsa Click</li>
<li><strong>Garantia de validade:</strong> O desconto é mantido durante todo o curso, conforme contrato</li>
</ul>

<h2>Por que as faculdades aceitam esse modelo</h2>
<p>As instituições de ensino se beneficiam porque:</p>
<ul>
<li><strong>Reduzem custo de marketing:</strong> Em vez de investir em propaganda, usam esse valor para oferecer descontos</li>
<li><strong>Preenchem turmas mais rápido:</strong> Nossa plataforma conecta estudantes às vagas com agilidade</li>
<li><strong>Mantêm qualidade:</strong> Estudantes motivados e engajados contribuem para o ambiente acadêmico</li>
<li><strong>Fidelizam alunos:</strong> Descontos justos criam relações duradouras</li>
</ul>

<h2>Descontos de 100% são reais?</h2>
<p>Sim, mas existem algumas nuances importantes de entender:</p>
<ul>
<li><strong>100% de desconto na mensalidade:</strong> Significa que você não paga mensalidade do curso, mas pode haver taxas administrativas ou de material</li>
<li><strong>Condições específicas:</strong> Geralmente aplicam-se a cursos EAD ou semipresenciais, onde o custo operacional é menor</li>
<li><strong>Vagas limitadas:</strong> Descontos maiores costumam ter número restrito de vagas</li>
<li><strong>Transparência total:</strong> Sempre deixamos claro o que está incluso e o que não está</li>
</ul>

<h2>Como sabemos que o desconto é real?</h2>
<p>Você pode ter certeza porque:</p>
<ul>
<li>Mostramos o valor integral do curso e o valor com desconto lado a lado</li>
<li>O contrato de matrícula da faculdade confirma o valor final que você vai pagar</li>
<li>O desconto aparece aplicado em todas as mensalidades, não apenas na primeira</li>
<li>Temos milhares de alunos estudando com descontos garantidos pelo Bolsa Click</li>
</ul>`,
    },
    {
      slug: 'e-confiavel',
      title: 'O Bolsa Click é confiável?',
      description: 'Saiba por que milhares de estudantes confiam no Bolsa Click para realizar o sonho de estudar.',
      metaTitle: 'O Bolsa Click é confiável? | Central de Ajuda',
      metaDescription: 'Descubra por que milhares de estudantes confiam no Bolsa Click para garantir bolsas de estudo com segurança e transparência.',
      order: 4,
      content: `<p class="quick-answer">Sim, o Bolsa Click é uma plataforma 100% confiável. Somos parceiros oficiais de faculdades reconhecidas pelo MEC, temos milhares de alunos matriculados com sucesso, operamos com transparência total e seguimos todas as normas de proteção de dados (LGPD). Seu investimento e suas informações estão seguros conosco.</p>

<h2>Por que você pode confiar no Bolsa Click</h2>

<h3>1. Parcerias oficiais com faculdades reconhecidas</h3>
<p>Todas as instituições que aparecem em nossa plataforma são oficialmente reconhecidas pelo MEC (Ministério da Educação). Não trabalhamos com faculdades sem credenciamento ou com reputação duvidosa.</p>
<ul>
<li>Contratos formais com cada instituição de ensino</li>
<li>Validação do reconhecimento MEC de todos os cursos</li>
<li>Garantia de que seu diploma terá validade nacional</li>
</ul>

<h3>2. Milhares de alunos matriculados com sucesso</h3>
<p>Não somos novos no mercado. Já ajudamos milhares de estudantes a realizarem o sonho de estudar, com histórias reais de transformação através da educação.</p>
<p><strong>Dados concretos:</strong></p>
<ul>
<li>Mais de 30.000 faculdades parceiras em todo o Brasil</li>
<li>100.000+ cursos disponíveis</li>
<li>Milhares de alunos estudando com bolsas garantidas</li>
<li>Taxa de satisfação superior a 95%</li>
</ul>

<h3>3. Transparência em todo o processo</h3>
<p>Não temos nada a esconder. Tudo fica claro desde o primeiro contato:</p>
<ul>
<li><strong>Valores transparentes:</strong> Mostramos preço original e com desconto</li>
<li><strong>Sem taxas ocultas:</strong> Todos os custos são apresentados antecipadamente</li>
<li><strong>Condições da bolsa:</strong> Percentual, validade e regras explicadas claramente</li>
<li><strong>Política de reembolso:</strong> Situações e prazos definidos no contrato</li>
</ul>

<h3>4. Proteção dos seus dados pessoais</h3>
<p>Levamos segurança a sério. Seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados) e adotamos as melhores práticas de mercado:</p>
<ul>
<li>Criptografia em todas as transações</li>
<li>Armazenamento seguro de informações pessoais</li>
<li>Compartilhamento de dados apenas com as faculdades escolhidas por você</li>
<li>Você pode solicitar exclusão dos seus dados a qualquer momento</li>
</ul>

<h3>5. Pagamento seguro e protegido</h3>
<p>Processamos pagamentos através de gateways confiáveis e reconhecidos:</p>
<ul>
<li>Certificado SSL para proteção de dados bancários</li>
<li>Integração com meios de pagamento seguros (cartão, Pix, boleto)</li>
<li>Comprovante de transação enviado por e-mail</li>
<li>Garantia de reembolso em casos específicos</li>
</ul>`,
    },
    {
      slug: 'faculdades-parceiras',
      title: 'Faculdades parceiras e reconhecimento MEC',
      description: 'Conheça nossas faculdades parceiras e a importância do reconhecimento do MEC para seu diploma.',
      metaTitle: 'Faculdades parceiras e reconhecimento MEC | Central de Ajuda',
      metaDescription: 'Conheça as faculdades parceiras do Bolsa Click e entenda a importância do reconhecimento do MEC para a validade do seu diploma.',
      order: 5,
      content: `<p class="quick-answer">O Bolsa Click tem parceria com mais de 30.000 faculdades reconhecidas pelo MEC em todo o Brasil. Todas as instituições disponíveis na plataforma são credenciadas e oferecem cursos autorizados pelo Ministério da Educação, garantindo a validade nacional do seu diploma.</p>

<h2>Quem são nossas faculdades parceiras</h2>
<p>Trabalhamos com instituições de ensino de todos os portes, desde grandes universidades até faculdades regionais, mas todas têm algo em comum: credenciamento oficial do MEC.</p>
<p>Entre nossas parceiras, você encontra:</p>
<ul>
<li><strong>Universidades privadas de grande porte:</strong> Reconhecidas nacionalmente com estrutura completa</li>
<li><strong>Faculdades especializadas:</strong> Focadas em áreas específicas como saúde, tecnologia ou gestão</li>
<li><strong>Centros universitários:</strong> Com autonomia acadêmica e diversidade de cursos</li>
<li><strong>Instituições regionais:</strong> Presença forte em determinadas cidades e estados</li>
</ul>

<h2>O que é reconhecimento do MEC e por que importa</h2>
<p>O MEC (Ministério da Educação) é o órgão responsável por regular e fiscalizar a educação superior no Brasil. O reconhecimento garante que:</p>
<ul>
<li><strong>Seu diploma tem validade nacional:</strong> Será aceito em concursos públicos, empresas e pós-graduações</li>
<li><strong>A instituição atende padrões de qualidade:</strong> Infraestrutura, corpo docente e projeto pedagógico foram avaliados</li>
<li><strong>O curso oferece formação adequada:</strong> Grade curricular alinhada às diretrizes nacionais</li>
<li><strong>Você está protegido legalmente:</strong> A instituição segue as normas educacionais brasileiras</li>
</ul>

<h2>Como verificar se uma faculdade é reconhecida</h2>
<p>Você pode consultar diretamente no site do MEC:</p>
<ol>
<li>Acesse o portal <strong>e-MEC</strong> (emec.mec.gov.br)</li>
<li>Pesquise pelo nome da instituição ou do curso</li>
<li>Verifique o status: "Em atividade" e "Credenciada"</li>
<li>Confira a situação do curso específico: "Autorizado" ou "Reconhecido"</li>
</ol>
<p><strong>Atenção:</strong> Cursos muito novos podem estar "Autorizados" (podem funcionar) e ainda não "Reconhecidos" (passaram pela avaliação completa). Ambos os status são válidos, mas "Reconhecido" indica avaliação finalizada.</p>

<h2>Todas as faculdades do Bolsa Click são reconhecidas?</h2>
<p><strong>Sim, sem exceção.</strong> Antes de fechar parceria com qualquer instituição, nossa equipe:</p>
<ul>
<li>Verifica o credenciamento no portal e-MEC</li>
<li>Confirma a situação regular dos cursos oferecidos</li>
<li>Valida a reputação da instituição no mercado</li>
<li>Assegura que não há pendências legais ou regulatórias</li>
</ul>
<p>Se uma faculdade aparecer na nossa plataforma, você pode ter certeza de que ela é legalmente autorizada a funcionar.</p>`,
    },
  ],
  'primeiros-passos': [
    {
      slug: 'criar-conta',
      title: 'Como criar uma conta no Bolsa Click?',
      description: 'Passo a passo simples para criar sua conta e começar a buscar bolsas de estudo.',
      metaTitle: 'Como criar uma conta no Bolsa Click? | Central de Ajuda',
      metaDescription: 'Aprenda como criar sua conta no Bolsa Click de forma rápida e gratuita para começar a buscar bolsas de estudo.',
      order: 1,
      content: `<p class="quick-answer">Criar sua conta é rápido, gratuito e leva menos de 2 minutos. Você pode se cadastrar usando seu e-mail ou fazer login direto com sua conta Google. Não cobramos nada para criar conta ou buscar bolsas.</p>

<h2>Passo a passo para criar sua conta</h2>

<h3>Opção 1: Cadastro com e-mail</h3>
<ol>
<li>Acesse o site do Bolsa Click</li>
<li>Clique em "Entrar" no canto superior direito</li>
<li>Selecione "Criar conta"</li>
<li>Preencha seu nome completo</li>
<li>Digite seu melhor e-mail</li>
<li>Crie uma senha segura (mínimo 6 caracteres)</li>
<li>Clique em "Criar conta"</li>
<li>Verifique seu e-mail e clique no link de confirmação</li>
</ol>

<h3>Opção 2: Login com Google</h3>
<ol>
<li>Acesse o site do Bolsa Click</li>
<li>Clique em "Entrar"</li>
<li>Selecione "Continuar com Google"</li>
<li>Escolha sua conta Google</li>
<li>Pronto! Sua conta está criada automaticamente</li>
</ol>

<h2>Dicas de segurança</h2>
<ul>
<li>Use uma senha única que você não usa em outros sites</li>
<li>Combine letras, números e caracteres especiais</li>
<li>Nunca compartilhe sua senha com terceiros</li>
<li>Se esquecer a senha, use a opção "Esqueci minha senha"</li>
</ul>

<h2>Preciso pagar para criar conta?</h2>
<p><strong>Não!</strong> Criar conta e buscar bolsas é 100% gratuito. Você só paga quando decide garantir uma bolsa específica, através da taxa de pré-matrícula.</p>

<h2>Posso usar minha conta em qualquer dispositivo?</h2>
<p>Sim! Sua conta funciona em computadores, tablets e celulares. Basta fazer login com os mesmos dados.</p>`,
    },
    {
      slug: 'encontrar-bolsa',
      title: 'Como encontrar a bolsa ideal?',
      description: 'Dicas e filtros para você encontrar o curso perfeito com o melhor desconto.',
      metaTitle: 'Como encontrar a bolsa ideal? | Central de Ajuda',
      metaDescription: 'Aprenda a usar os filtros e recursos do Bolsa Click para encontrar a bolsa de estudos perfeita para você.',
      order: 2,
      content: `<p class="quick-answer">Use nossos filtros de busca para encontrar cursos por nome, cidade, modalidade (EAD, presencial, semipresencial), turno e faixa de preço. Compare opções, veja detalhes das faculdades e escolha a que melhor se encaixa no seu perfil e orçamento.</p>

<h2>Como fazer uma busca eficiente</h2>

<h3>1. Comece pela página de cursos</h3>
<p>Na home do Bolsa Click, você pode:</p>
<ul>
<li>Digitar o nome do curso desejado</li>
<li>Selecionar sua cidade</li>
<li>Clicar em "Buscar"</li>
</ul>

<h3>2. Use os filtros avançados</h3>
<p>Após a busca inicial, refine os resultados:</p>
<ul>
<li><strong>Modalidade:</strong> EAD (totalmente online), Presencial ou Semipresencial</li>
<li><strong>Turno:</strong> Manhã, Tarde, Noite ou Integral</li>
<li><strong>Faixa de preço:</strong> Defina seu orçamento máximo</li>
<li><strong>Tipo de curso:</strong> Graduação, Pós-graduação, Técnico</li>
</ul>

<h3>3. Compare as opções</h3>
<p>Para cada resultado, você vê:</p>
<ul>
<li>Nome do curso e da faculdade</li>
<li>Valor original e valor com desconto</li>
<li>Percentual de desconto</li>
<li>Modalidade e turno</li>
<li>Nota do curso no MEC (quando disponível)</li>
</ul>

<h2>Dicas para escolher a melhor bolsa</h2>
<ul>
<li><strong>Considere seu perfil:</strong> Se trabalha, EAD ou noturno pode ser melhor</li>
<li><strong>Verifique a localização:</strong> Para presencial, escolha uma unidade próxima</li>
<li><strong>Compare o custo-benefício:</strong> Nem sempre o maior desconto é a melhor escolha</li>
<li><strong>Leia sobre a faculdade:</strong> Pesquise a reputação da instituição</li>
</ul>`,
    },
    {
      slug: 'bolsa-parcial-integral',
      title: 'Diferença entre bolsa parcial e integral',
      description: 'Entenda o que significa cada tipo de bolsa e qual faz mais sentido para você.',
      metaTitle: 'Diferença entre bolsa parcial e integral | Central de Ajuda',
      metaDescription: 'Entenda a diferença entre bolsa parcial e integral e descubra qual tipo de bolsa de estudos é melhor para seu perfil.',
      order: 3,
      content: `<p class="quick-answer">Bolsa integral significa 100% de desconto na mensalidade (você não paga mensalidade). Bolsa parcial oferece um percentual de desconto (ex: 50%, 70%) - você paga apenas a diferença. Ambas são válidas durante todo o curso.</p>

<h2>O que é bolsa integral?</h2>
<p>Com bolsa integral (100%), você não paga mensalidade do curso. No entanto, podem existir:</p>
<ul>
<li>Taxa de matrícula (uma vez por semestre)</li>
<li>Taxas administrativas</li>
<li>Material didático (em alguns casos)</li>
</ul>
<p><strong>Importante:</strong> Bolsas integrais são mais raras e geralmente disponíveis para cursos EAD ou em horários específicos.</p>

<h2>O que é bolsa parcial?</h2>
<p>Com bolsa parcial, você recebe um desconto percentual. Por exemplo:</p>
<ul>
<li><strong>Bolsa de 70%:</strong> Curso de R$ 1.000 → você paga R$ 300</li>
<li><strong>Bolsa de 50%:</strong> Curso de R$ 1.000 → você paga R$ 500</li>
<li><strong>Bolsa de 30%:</strong> Curso de R$ 1.000 → você paga R$ 700</li>
</ul>

<h2>Qual escolher?</h2>
<p>Depende do seu orçamento e objetivos:</p>
<ul>
<li><strong>Bolsa integral:</strong> Ideal se você tem orçamento muito limitado e flexibilidade de horário/modalidade</li>
<li><strong>Bolsa parcial alta (60-90%):</strong> Bom equilíbrio entre economia e opções de escolha</li>
<li><strong>Bolsa parcial moderada (30-60%):</strong> Mais opções de cursos e faculdades</li>
</ul>

<h2>O desconto é garantido durante todo o curso?</h2>
<p><strong>Sim!</strong> Seja parcial ou integral, o percentual de desconto é mantido durante toda a graduação, desde que você cumpra os requisitos básicos (frequência mínima, pagamento em dia).</p>`,
    },
    {
      slug: 'depois-de-garantir',
      title: 'O que acontece depois de garantir a bolsa?',
      description: 'Saiba quais são os próximos passos após garantir sua bolsa de estudo.',
      metaTitle: 'O que acontece depois de garantir a bolsa? | Central de Ajuda',
      metaDescription: 'Descubra os próximos passos após garantir sua bolsa de estudos pelo Bolsa Click: contato da faculdade, matrícula e início das aulas.',
      order: 4,
      content: `<p class="quick-answer">Após garantir sua bolsa, você recebe confirmação por e-mail e WhatsApp. Em até 2 dias úteis, a faculdade entra em contato com as instruções de matrícula. Você envia seus documentos, finaliza a matrícula e está pronto para começar as aulas!</p>

<h2>Linha do tempo após garantir a bolsa</h2>

<h3>Imediatamente</h3>
<ul>
<li>Você recebe e-mail de confirmação da pré-matrícula</li>
<li>Recebe comprovante de pagamento</li>
<li>Nossa equipe envia mensagem pelo WhatsApp</li>
</ul>

<h3>Em até 2 dias úteis</h3>
<ul>
<li>A faculdade entra em contato diretamente com você</li>
<li>Você recebe a lista de documentos necessários</li>
<li>São apresentadas as opções de data para matrícula</li>
</ul>

<h3>Durante o processo de matrícula</h3>
<ul>
<li>Você prepara e envia os documentos solicitados</li>
<li>A faculdade valida sua documentação</li>
<li>Você assina o contrato de matrícula</li>
</ul>

<h3>Após a matrícula</h3>
<ul>
<li>Você recebe seus dados de acesso ao portal do aluno</li>
<li>Conhece o calendário acadêmico</li>
<li>Inicia as aulas conforme a data de início do semestre</li>
</ul>

<h2>E se a faculdade não entrar em contato?</h2>
<p>Se passar dos 2 dias úteis sem contato:</p>
<ol>
<li>Verifique sua caixa de spam no e-mail</li>
<li>Confira se o WhatsApp está correto no cadastro</li>
<li>Entre em contato com nossa equipe de suporte</li>
</ol>
<p>Nós intermediamos o contato com a faculdade e garantimos que você seja atendido.</p>`,
    },
    {
      slug: 'nao-encontrei-bolsa',
      title: 'Não encontrei a bolsa que quero — o que fazer?',
      description: 'Descubra outras formas de encontrar o curso ideal ou receber alertas de novas vagas.',
      metaTitle: 'Não encontrei a bolsa que quero | Central de Ajuda',
      metaDescription: 'Saiba o que fazer quando não encontrar a bolsa desejada no Bolsa Click: alertas, contato com especialistas e alternativas.',
      order: 5,
      content: `<p class="quick-answer">Se não encontrou exatamente o que procurava, você pode: criar um alerta para ser notificado quando surgir a bolsa desejada, falar com nossa equipe para ajuda personalizada, ou explorar cursos similares que podem atender suas necessidades.</p>

<h2>Opções quando não encontra a bolsa ideal</h2>

<h3>1. Crie um alerta de bolsa</h3>
<p>Nosso sistema pode avisar quando surgir uma vaga do seu interesse:</p>
<ul>
<li>Cadastre o curso desejado</li>
<li>Selecione cidade e modalidade preferidas</li>
<li>Receba notificação por e-mail ou WhatsApp quando houver disponibilidade</li>
</ul>

<h3>2. Fale com um especialista</h3>
<p>Nossa equipe pode ajudar a encontrar alternativas:</p>
<ul>
<li>Entre em contato pelo WhatsApp</li>
<li>Explique o que você está procurando</li>
<li>Receba sugestões personalizadas</li>
</ul>

<h3>3. Explore cursos similares</h3>
<p>Às vezes, um curso com nome diferente oferece a formação desejada:</p>
<ul>
<li>Pesquise por área de atuação</li>
<li>Veja cursos relacionados ao seu interesse</li>
<li>Compare grades curriculares</li>
</ul>

<h2>Por que algumas bolsas não estão disponíveis?</h2>
<p>Isso pode acontecer por alguns motivos:</p>
<ul>
<li><strong>Vagas esgotadas:</strong> A demanda pode ter sido alta naquele período</li>
<li><strong>Sem parceria na região:</strong> Ainda não temos parceiros naquela cidade</li>
<li><strong>Curso não oferecido:</strong> A faculdade pode não ter aquele curso específico</li>
<li><strong>Período de renovação:</strong> Algumas bolsas são sazonais</li>
</ul>

<h2>Novas bolsas são adicionadas frequentemente?</h2>
<p>Sim! Estamos constantemente fechando novas parcerias e adicionando opções. Por isso, vale a pena criar alertas e verificar periodicamente.</p>`,
    },
  ],
}

async function main() {
  console.log('🚀 Iniciando migração da Central de Ajuda...\n')

  // 1. Criar categorias
  console.log('📁 Criando categorias...')
  const categoryMap: Record<string, string> = {}

  for (const cat of CATEGORIES) {
    const existing = await prisma.helpCategory.findUnique({
      where: { slug: cat.slug }
    })

    if (existing) {
      console.log(`  ⏭️  ${cat.title} (já existe)`)
      categoryMap[cat.slug] = existing.id
    } else {
      const created = await prisma.helpCategory.create({
        data: {
          slug: cat.slug,
          title: cat.title,
          description: cat.description,
          icon: cat.icon,
          order: cat.order,
          isActive: true,
        }
      })
      console.log(`  ✅ ${cat.title}`)
      categoryMap[cat.slug] = created.id
    }
  }

  // 2. Criar artigos
  console.log('\n📝 Criando artigos...')
  let articleCount = 0
  let skippedCount = 0

  for (const [categorySlug, articles] of Object.entries(ARTICLES)) {
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
  console.log(`✅ ${CATEGORIES.length} categorias processadas`)
  console.log(`✅ ${articleCount} artigos criados`)
  if (skippedCount > 0) {
    console.log(`⏭️  ${skippedCount} artigos já existiam`)
  }
  console.log('========================================\n')
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('❌ Erro na migração:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
