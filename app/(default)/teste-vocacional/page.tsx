import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Clock, Lock, Zap } from 'lucide-react'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import { AIChat } from './_components/AIChat'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Teste Vocacional Grátis com IA - Descubra Seu Curso',
  description:
    'Não sabe qual faculdade fazer? Faça nosso teste vocacional com IA em 3 minutos: uma conversa adaptativa que descobre os 3 cursos que mais combinam com seu perfil. Grátis e sem CPF.',
  keywords: [
    'teste vocacional',
    'teste vocacional grátis',
    'teste vocacional online',
    'qual curso fazer',
    'qual faculdade escolher',
    'descobrir profissão',
    'orientação vocacional',
    'bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/teste-vocacional` },
  openGraph: {
    title: 'Teste Vocacional Online Grátis com IA — Bolsa Click',
    description: 'Conversa adaptativa de 3 minutos que descobre os 3 cursos ideais pro seu perfil.',
    url: `${SITE_URL}/teste-vocacional`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Teste Vocacional Online Grátis com IA',
    description: '3 minutos pra descobrir seu curso ideal. Conversa adaptativa com IA.',
  },
}

const faqItems = [
  {
    question: 'Como funciona o teste vocacional do Bolsa Click?',
    answer: 'É uma conversa de uns 3 minutos com uma IA treinada pra entender seus interesses, motivações e estilo. Ela faz entre 7 e 9 perguntas adaptativas — ou seja, cada pergunta se baseia na sua resposta anterior, sem questionário engessado. No final, você recebe os 3 cursos de graduação que mais combinam com seu perfil.',
  },
  {
    question: 'O teste é grátis?',
    answer: 'Sim, 100% grátis. Não pedimos CPF nem cartão. Só nome, email e WhatsApp pra te enviar a trilha personalizada.',
  },
  {
    question: 'Quanto tempo leva?',
    answer: 'Em torno de 3 minutos. A conversa é curta e direta — sem dezenas de perguntas como em testes vocacionais tradicionais.',
  },
  {
    question: 'O resultado é confiável?',
    answer: 'O teste é uma orientação inicial baseada nos seus interesses. Não substitui acompanhamento profissional (psicólogo ou orientador educacional), mas ajuda a estreitar o leque de opções e descobrir áreas que você talvez não tinha considerado.',
  },
  {
    question: 'Posso refazer o teste?',
    answer: 'Sim, quantas vezes quiser. Cada conversa é independente — você pode explorar respostas diferentes pra ver outras recomendações.',
  },
  {
    question: 'Vou receber spam depois?',
    answer: 'Não. Usamos seu contato pra enviar sua trilha personalizada e avisar quando rolar bolsa nos cursos recomendados. Você pode descadastrar a qualquer momento.',
  },
  {
    question: 'Qual a diferença entre teste vocacional e teste de aptidão?',
    answer: 'Teste vocacional foca em interesses e perfil — o que combina com sua personalidade e estilo de vida. Teste de aptidão mede habilidades específicas (lógica, raciocínio espacial, verbal). Nosso teste é vocacional: foca no que você gosta e como pensa, não no que você já sabe.',
  },
  {
    question: 'Posso fazer o teste sem ter feito o ENEM?',
    answer: 'Claro. O teste é independente de qualquer prova. Ele serve pra qualquer pessoa que esteja em dúvida sobre qual curso fazer — quem ainda está no ensino médio, quem já terminou, quem quer trocar de área ou voltar a estudar.',
  },
  {
    question: 'O teste cobra ou pede CPF?',
    answer: 'Não cobra nada e não pede CPF. Coletamos apenas nome, email e WhatsApp ao final pra enviar a trilha personalizada. CPF só é pedido se você decidir se inscrever em algum curso depois.',
  },
  {
    question: 'Como a IA decide quais cursos recomendar?',
    answer: 'A IA analisa toda a conversa — seus interesses, valores, rotina ideal, áreas que você não gosta — e cruza com o perfil de cada um dos cursos disponíveis no nosso catálogo. Ela retorna os 3 cursos com maior afinidade e explica por que cada um faz sentido pra você, citando coisas que você mencionou.',
  },
  {
    question: 'Posso usar o resultado pra mudar de curso na faculdade?',
    answer: 'Sim. O teste é útil principalmente pra quem está em dúvida ou pensando em mudar de área. O resultado mostra cursos alternativos que combinam com seu perfil atual — pode te ajudar a confirmar uma intuição ou abrir possibilidades que você não tinha considerado.',
  },
  {
    question: 'O teste funciona pra quem já tem mais de 30 anos?',
    answer: 'Sim. A IA adapta as perguntas ao seu contexto. Se você menciona experiência profissional anterior, trajetória de carreira ou que está pensando em mudança de área, ela considera tudo isso na recomendação. Funciona bem pra primeira graduação, segunda graduação ou transição de carreira.',
  },
  {
    question: 'Quais cursos podem aparecer no resultado?',
    answer: 'Hoje a IA escolhe entre 22 cursos de graduação ativos no Bolsa Click — incluindo Administração, Direito, Enfermagem, Psicologia, ADS, Pedagogia, Engenharia Civil, Medicina, e mais. O catálogo cresce com o tempo. Veja a lista completa em /cursos.',
  },
]

const pageUrl = `${SITE_URL}/teste-vocacional`

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Teste Vocacional Bolsa Click',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: pageUrl,
  description:
    'Teste vocacional online gratuito com IA. Conversa adaptativa de 3 minutos que recomenda 3 cursos de graduação com base no seu perfil.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  inLanguage: 'pt-BR',
  isBasedOn: [
    {
      '@type': 'CreativeWork',
      name: 'Holland Occupational Themes (RIASEC)',
      author: { '@type': 'Person', name: 'John L. Holland' },
      datePublished: '1959',
    },
    {
      '@type': 'Book',
      name: 'Frames of Mind: The Theory of Multiple Intelligences',
      author: { '@type': 'Person', name: 'Howard Gardner' },
      datePublished: '1983',
    },
  ],
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Teste Vocacional Online Grátis com IA — Descubra Seu Curso Ideal',
  description:
    'Teste vocacional online gratuito que combina escala Likert (20 perguntas) com refinamento conversacional por IA, baseado em RIASEC (Holland, 1959) e Inteligências Múltiplas (Gardner, 1983).',
  author: { '@type': 'Organization', name: 'Bolsa Click', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'Bolsa Click',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png` },
  },
  datePublished: '2024-01-15',
  dateModified: new Date().toISOString().slice(0, 10),
  mainEntityOfPage: pageUrl,
  inLanguage: 'pt-BR',
  about: [
    { '@type': 'Thing', name: 'RIASEC', sameAs: 'https://en.wikipedia.org/wiki/Holland_Codes' },
    {
      '@type': 'Thing',
      name: 'Inteligências Múltiplas',
      sameAs: 'https://pt.wikipedia.org/wiki/Teoria_das_intelig%C3%AAncias_m%C3%BAltiplas',
    },
    { '@type': 'Thing', name: 'Orientação vocacional' },
  ],
  citation: [
    {
      '@type': 'CreativeWork',
      name: 'Holland Occupational Themes',
      author: 'John L. Holland',
      datePublished: '1959',
    },
    {
      '@type': 'Book',
      name: 'Frames of Mind',
      author: 'Howard Gardner',
      datePublished: '1983',
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Teste Vocacional', item: pageUrl },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function TesteVocacionalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([webAppSchema, articleSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      <header className="bg-paper border-b border-hairline py-8 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav
            className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3 md:mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">Teste Vocacional</span>
          </nav>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-6xl font-semibold text-ink-900 leading-[1.05] mb-3 md:mb-4">
            Teste Vocacional com IA
          </h1>
          <p className="text-base md:text-xl text-ink-700 max-w-2xl mb-5 md:mb-6 leading-relaxed">
            Teste vocacional online gratuito que combina escala Likert (20 perguntas) com
            refinamento conversacional por IA, baseado em metodologia <strong>RIASEC
            (Holland, 1959) + Inteligências Múltiplas (Gardner, 1983)</strong>. Resultado em 5
            minutos: Holland Code de 3 letras e 3 cursos com maior afinidade ao seu perfil.
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[10px] md:text-[12px] tracking-[0.14em] uppercase text-ink-500">
            <li className="inline-flex items-center gap-1.5">
              <Clock size={12} className="md:w-3.5 md:h-3.5" /> 3 minutos
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> Conversa adaptativa
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Zap size={12} className="md:w-3.5 md:h-3.5" /> Grátis
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Lock size={12} className="md:w-3.5 md:h-3.5" /> Sem CPF
            </li>
          </ul>
        </div>
      </header>

      <section className="bg-white py-8 md:py-10 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <aside
            className="bg-paper border-l-4 border-bolsa-secondary rounded-r-md p-5 md:p-6"
            aria-label="Resumo do teste"
          >
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary mb-3">
              O que você vai descobrir
            </p>
            <ul className="space-y-1.5 text-ink-900 text-sm md:text-base leading-relaxed">
              <li>
                <strong>Seu Holland Code</strong>: 3 letras de 6 tipos vocacionais (R, I, A, S, E, C).
              </li>
              <li>
                <strong>2-3 inteligências dominantes</strong> segundo o modelo de Howard Gardner (1983).
              </li>
              <li>
                <strong>3 cursos de graduação</strong> com maior afinidade ao seu perfil, com
                justificativa personalizada por IA.
              </li>
            </ul>
            <p className="font-mono text-[11px] text-ink-500 mt-4">
              5 minutos · Grátis · Sem CPF · Algoritmo determinístico + IA personalização (gpt-4o-mini)
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-white py-10 md:py-12 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <AIChat />
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como funciona o teste vocacional do Bolsa Click</h2>
          <p>
            Testes vocacionais tradicionais costumam ter dezenas de perguntas fixas e
            resultados genéricos. Aqui é diferente: nossa IA conduz uma conversa adaptativa
            — cada pergunta se baseia na sua resposta anterior, igual um conselheiro
            vocacional faria pessoalmente.
          </p>
          <p>
            Em 7 a 9 perguntas a IA captura o que importa: seus interesses, sua rotina
            ideal, o tipo de problema que te motiva a resolver, o que você definitivamente
            não quer fazer profissionalmente. No final, ela cruza essas pistas com nosso{' '}
            <Link href="/cursos">catálogo de cursos de graduação</Link> e devolve os 3 que
            mais fazem sentido pra você, com uma justificativa pessoal pra cada um.
          </p>
          <p>
            O teste é gratuito e leva uns 3 minutos. Você só precisa preencher nome, email
            e WhatsApp ao final pra ver o resultado — usamos esses dados pra enviar sua
            trilha personalizada e te avisar quando aparecer{' '}
            <Link href="/bolsas-de-estudo">bolsa exclusiva</Link> nos cursos recomendados.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Áreas de conhecimento que o teste cobre</h2>
          <p>
            Nosso catálogo cobre as cinco grandes áreas da graduação no Brasil. O teste
            consegue te direcionar pra qualquer uma delas dependendo do que aparece na
            conversa. Aqui vai uma referência rápida pra você se situar antes de começar.
          </p>

          <h3>Ciências Humanas e Sociais</h3>
          <p>
            Pra quem se interessa por gente, comportamento, sociedade, ética e
            comunicação. Cursos típicos:{' '}
            <Link href="/cursos/direito">Direito</Link>,{' '}
            <Link href="/cursos/psicologia">Psicologia</Link>,{' '}
            <Link href="/cursos/pedagogia">Pedagogia</Link>. Costumam combinar com perfis
            que gostam de ler, argumentar e entender motivações alheias.
          </p>

          <h3>Ciências Biológicas e da Saúde</h3>
          <p>
            Pra quem quer trabalhar com pessoas em contextos de cuidado, biologia ou
            tecnologia médica. Cursos típicos:{' '}
            <Link href="/cursos/enfermagem">Enfermagem</Link>,{' '}
            <Link href="/cursos/fisioterapia">Fisioterapia</Link>,{' '}
            <Link href="/cursos/nutricao">Nutrição</Link>,{' '}
            <Link href="/cursos/biomedicina">Biomedicina</Link>,{' '}
            <Link href="/cursos/odontologia">Odontologia</Link>,{' '}
            <Link href="/cursos/farmacia">Farmácia</Link>. Combinam com quem tolera bem
            rotina técnica e tem empatia genuína.
          </p>

          <h3>Engenharias e Exatas</h3>
          <p>
            Pra quem curte resolver problemas concretos, matemática aplicada e construir
            coisas. Cursos típicos:{' '}
            <Link href="/cursos/engenharia-civil">Engenharia Civil</Link>,{' '}
            <Link href="/cursos/engenharia-de-producao">Engenharia de Produção</Link>,{' '}
            <Link href="/cursos/arquitetura-e-urbanismo">Arquitetura e Urbanismo</Link>.
            Perfil analítico e visual-espacial costuma se dar bem.
          </p>

          <h3>Tecnologia e Computação</h3>
          <p>
            Pra quem gosta de lógica, programação, dados e automação. Cursos típicos:{' '}
            <Link href="/cursos/analise-e-desenvolvimento-de-sistemas">
              Análise e Desenvolvimento de Sistemas
            </Link>{' '}
            e tecnólogos da área. Combina com quem aprende sozinho, mexe em coisas no
            tempo livre e gosta de raciocínio abstrato.
          </p>

          <h3>Negócios e Sociais Aplicadas</h3>
          <p>
            Pra quem gosta de estratégia, gente, gestão e impacto comercial. Cursos
            típicos: <Link href="/cursos/administracao">Administração</Link>,{' '}
            <Link href="/cursos/marketing">Marketing</Link>,{' '}
            <Link href="/cursos/ciencias-contabeis">Ciências Contábeis</Link>,{' '}
            <Link href="/cursos/gestao-de-recursos-humanos">Gestão de Recursos Humanos</Link>,{' '}
            <Link href="/cursos/gestao-comercial">Gestão Comercial</Link>. Perfil mais
            generalista, comunicativo e orientado a resultado.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Metodologia: RIASEC + Inteligências Múltiplas</h2>
          <p>
            Nosso teste combina duas teorias clássicas de orientação vocacional e psicologia
            cognitiva. Em vez de inventar um algoritmo opaco de &ldquo;análise preditiva&rdquo;,
            apoiamos a recomendação em frameworks com 40+ anos de pesquisa e uso clínico no
            mundo todo.
          </p>

          <h3>RIASEC (Holland, 1959): o gold standard vocacional</h3>
          <p>
            John L. Holland propôs em 1959 que pessoas e ambientes profissionais podem ser
            classificados em 6 tipos: <strong>Realista (R)</strong>, <strong>Investigativo
            (I)</strong>, <strong>Artístico (A)</strong>, <strong>Social (S)</strong>,{' '}
            <strong>Empreendedor (E)</strong> e <strong>Convencional (C)</strong>. Quando o
            tipo da pessoa combina com o tipo do ambiente, a satisfação e o desempenho
            profissional aumentam significativamente.
          </p>
          <p>
            Cada pessoa não é só uma letra — é um <em>Holland Code</em> de 3 letras
            representando os tipos dominantes em ordem. Alguém com perfil &ldquo;SIA&rdquo; combina
            Social (foco em pessoas), Investigativo (curiosidade analítica) e Artístico
            (expressividade) — provavelmente se realiza em áreas como psicologia, ensino ou
            arquitetura social. O RIASEC é a base da maioria dos testes vocacionais sérios
            no mundo, usado por universidades, agências de emprego e plataformas como o
            ONet do Departamento do Trabalho dos EUA.
          </p>

          <h3>Inteligências Múltiplas (Gardner, 1983): como você processa</h3>
          <p>
            Howard Gardner, em <em>Frames of Mind</em>, propôs que a inteligência humana não
            é uma capacidade única medida por QI, mas um conjunto de pelo menos 8 inteligências
            relativamente independentes: <strong>Linguística</strong>, <strong>Lógico-matemática</strong>,{' '}
            <strong>Espacial</strong>, <strong>Musical</strong>, <strong>Corporal-cinestésica</strong>,{' '}
            <strong>Interpessoal</strong>, <strong>Intrapessoal</strong> e <strong>Naturalista</strong>.
          </p>
          <p>
            Diferente do RIASEC (que olha pra <em>preferências</em>), Gardner foca em <em>como
            você aprende e processa informação</em>. Combinar os dois traz uma leitura mais
            rica: o RIASEC diz que tipo de ambiente combina com você; Gardner diz como você
            vai prosperar nele. Alguém com perfil RIASEC dominantemente Social mas com forte
            inteligência Lógico-matemática pode brilhar em psicologia clínica baseada em
            dados, por exemplo.
          </p>

          <h3>Como a IA aplica essas teorias</h3>
          <p>
            As 20 perguntas Likert no início do teste cobrem sistematicamente as 6 dimensões
            RIASEC e as 8 inteligências Gardner. Cada resposta soma pontos pras dimensões
            correspondentes, e um algoritmo determinístico calcula seu Holland Code (3 letras
            em ordem) e suas inteligências dominantes. Isso garante que o resultado é
            <strong> reprodutível e auditável</strong> — não depende de &ldquo;achismo&rdquo;
            de qualquer IA.
          </p>
          <p>
            A IA entra depois pra refinar: faz 2-3 perguntas abertas adaptativas baseadas
            no seu perfil emergente, captura nuance que a escala Likert não pega, e
            personaliza a justificativa de cada curso recomendado citando coisas que você
            disse. Você ganha estrutura científica + adaptação personalizada — não precisa
            escolher entre as duas coisas.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Por que IA adaptativa funciona melhor que questionário fixo</h2>
          <p>
            Os testes vocacionais clássicos seguem um padrão: você responde 30 a 50
            perguntas pré-definidas, a plataforma soma pontos por área e devolve um
            ranking. Funciona razoavelmente bem pra perfis típicos, mas tropeça quando
            sua história não cabe nas caixinhas que o questionário criou.
          </p>
          <p>
            IA adaptativa muda a lógica. Cada pergunta é gerada com base no que você
            acabou de responder — então a conversa investiga de verdade o que faz sentido
            pra você, no seu contexto. Três ganhos práticos:
          </p>
          <ul>
            <li>
              <strong>Contexto preservado.</strong> Se você menciona que cuida de pessoas
              idosas em casa, a próxima pergunta pode explorar afinidade com cuidado e
              saúde — sem perder essa pista.
            </li>
            <li>
              <strong>Sem viés de ordenação.</strong> Em questionário fixo, a sequência
              das perguntas influencia o resultado. Aqui não tem ordem fixa pra burlar.
            </li>
            <li>
              <strong>Menos friction.</strong> 7-9 perguntas em vez de 30+, com tempo
              ativo de ~3 minutos. Você termina o teste em vez de abandonar no meio.
            </li>
            <li>
              <strong>Justificativa pessoal.</strong> Cada um dos 3 cursos recomendados
              vem com uma explicação citando coisas que você disse — não é um match
              percentual seco.
            </li>
          </ul>
          <p>
            O lado prático: o resultado se conecta diretamente com nosso{' '}
            <Link href="/bolsas-de-estudo">catálogo de bolsas</Link>, então depois de
            descobrir os cursos ideais você já consegue ver as ofertas reais com até 80%
            de desconto.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como usar o resultado com responsabilidade</h2>
          <p>
            Importante: o teste é uma <strong>ferramenta de orientação inicial</strong>,
            não um diagnóstico definitivo. Ele te ajuda a estreitar o leque de
            possibilidades e a descobrir áreas que talvez não tinha considerado — mas a
            escolha final é sua, e idealmente com apoio.
          </p>
          <p>O que recomendamos fazer depois do resultado:</p>
          <ul>
            <li>
              <strong>Pesquise os cursos sugeridos a fundo.</strong> Veja a grade
              curricular, áreas de atuação, mercado de trabalho e expectativa salarial.
              Cada página de curso no Bolsa Click traz esses dados.
            </li>
            <li>
              <strong>Converse com profissionais da área.</strong> Procure no LinkedIn ou
              em comunidades pra entender o dia a dia de quem já trabalha nessa
              profissão. A realidade costuma ser diferente do imaginário.
            </li>
            <li>
              <strong>Visite faculdades quando possível.</strong> Conhecer o ambiente, os
              professores e a infraestrutura ajuda a decidir. Veja nossas{' '}
              <Link href="/faculdades">faculdades parceiras</Link> e procure visitas
              abertas ou semanas de portas abertas.
            </li>
            <li>
              <strong>Considere apoio profissional.</strong> Se a dúvida é grande ou tem
              ansiedade envolvida, conversar com um psicólogo ou orientador educacional
              vale o investimento. O teste é complementar, não substituto.
            </li>
          </ul>
          <p>
            E lembre: ninguém escolhe profissão pra vida inteira hoje em dia. Trocar de
            área, fazer segunda graduação ou especialização depois é normal e cada vez
            mais comum. A primeira escolha não é definitiva.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Depois do teste: próximos passos</h2>
          <p>
            Com os 3 cursos recomendados em mãos, você tem caminhos práticos pra
            transformar a recomendação em matrícula. Aqui vai um roteiro do que dá pra
            fazer agora.
          </p>

          <h3>Comparar bolsas direto no Bolsa Click</h3>
          <p>
            Cada curso recomendado tem uma página com{' '}
            <Link href="/bolsas-de-estudo">ofertas de bolsa</Link> em mais de 100
            cidades. Você compara mensalidade, modalidade (EAD, presencial,
            semipresencial) e desconto antes de decidir. Tudo grátis, sem precisar do
            CPF pra olhar.
          </p>

          <h3>Conhecer as faculdades parceiras</h3>
          <p>
            Trabalhamos com instituições de presença nacional como Anhanguera, Unopar,
            Unime, Estácio e IBMEC. Veja a lista completa em{' '}
            <Link href="/faculdades">faculdades parceiras</Link> — cada uma tem página
            com nota MEC, modalidades, cursos ofertados e polos por região.
          </p>

          <h3>Aproveitar programas do governo</h3>
          <p>
            Se você fez o ENEM, abre uma série de portas. Vale entender como cada
            programa funciona pra escolher o que combina com sua situação:
          </p>
          <ul>
            <li>
              <Link href="/enem">ENEM</Link>: a nota abre portas pra PROUNI, SISU,
              FIES e direto em muitas faculdades particulares.
            </li>
            <li>
              <Link href="/prouni">PROUNI</Link>: bolsa integral ou parcial em
              faculdades privadas, com critério de renda + nota mínima 450.
            </li>
            <li>
              <Link href="/sisu">SISU</Link>: vagas em universidades públicas usando
              só a nota do ENEM.
            </li>
            <li>
              <Link href="/fies">FIES</Link>: financiamento estudantil — paga durante
              o curso só simbólico, amortização começa depois de formado.
            </li>
          </ul>

          <h3>Refazer o teste com outro foco</h3>
          <p>
            Se ficou em dúvida ou quer ver outras possibilidades, dá pra refazer
            quantas vezes quiser. Cada conversa é independente. Tente responder de
            forma um pouco diferente — às vezes uma nuance muda os 3 cursos
            recomendados.
          </p>
        </div>
      </section>

      <VisibleFaq items={faqItems} heading="Perguntas frequentes sobre o teste" />
    </>
  )
}
