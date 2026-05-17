import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Award } from 'lucide-react'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Metodologia: RIASEC + Inteligências Múltiplas no Teste Vocacional',
  description:
    'Como combinamos RIASEC (Holland, 1959) e Inteligências Múltiplas (Gardner, 1983) no nosso teste vocacional com IA. História, base científica e como você é avaliado.',
  keywords: [
    'RIASEC',
    'Holland Code português',
    'inteligências múltiplas teste',
    'teste vocacional metodologia',
    'teoria Holland',
    'Gardner inteligências',
    'teste vocacional científico',
  ],
  alternates: { canonical: `${SITE_URL}/teste-vocacional/metodologia` },
  openGraph: {
    title: 'Metodologia do Teste Vocacional: RIASEC + Gardner',
    description: 'Como combinamos as duas teorias clássicas mais validadas de orientação vocacional e psicologia cognitiva.',
    url: `${SITE_URL}/teste-vocacional/metodologia`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'RIASEC é cientificamente válido?',
    answer: 'Sim. O modelo de Holland foi publicado em 1959 e validado em centenas de estudos posteriores. É usado oficialmente pelo Department of Labor dos EUA no O*NET (sistema federal de classificação ocupacional), em universidades, agências de emprego e plataformas de orientação vocacional no mundo todo. Continua sendo a referência mais aceita pra orientação vocacional baseada em interesses.',
  },
  {
    question: 'Inteligências Múltiplas é teoria aceita pela ciência?',
    answer: 'A teoria de Gardner (1983) é amplamente influente em educação e psicologia cognitiva, embora tenha recebido crítica em psicometria por dificuldade de validação empírica das 8 dimensões como construtos independentes. Apesar disso, é largamente usada em currículos escolares e ferramentas de autoconhecimento. No nosso teste, usamos como camada complementar ao RIASEC — não como diagnóstico isolado.',
  },
  {
    question: 'Posso confiar no resultado do teste de vocês?',
    answer: 'O Holland Code que calculamos é matematicamente determinístico (mesma resposta sempre dá o mesmo código), baseado em RIASEC validado. A AI só personaliza a redação do reasoning de cada curso — não escolhe os cursos. Então sim, é confiável como orientação inicial. Não substitui acompanhamento profissional com psicólogo ou orientador educacional pra decisões grandes.',
  },
  {
    question: 'Por que usar 2 teorias em vez de uma?',
    answer: 'RIASEC olha pra preferências profissionais (que tipo de trabalho te realiza). Gardner olha pra capacidades cognitivas (como você processa informação). Ambos juntos dão leitura mais completa: alguém Social + Investigativo (RIASEC) com inteligência Lógico-matemática alta vai se realizar em psicologia clínica baseada em dados; o mesmo perfil RIASEC com inteligência Interpessoal alta vai brilhar em terapia em grupo. As duas dimensões se complementam.',
  },
  {
    question: 'Quem desenvolveu o teste do Bolsa Click?',
    answer: 'A metodologia (RIASEC + Gardner) é pública e foi desenvolvida pelos pesquisadores citados. A implementação no Bolsa Click — escolha das perguntas Likert, mapeamento de cursos pra Holland Codes, integração com IA pra refinamento — foi feita pela equipe interna com base nessas teorias e em revisão da literatura vocacional brasileira.',
  },
  {
    question: 'O que diferencia esse teste dos outros gratuitos?',
    answer: 'A maioria dos testes "gratuitos" no Brasil ou cobra pra ver o resultado completo, ou usa metodologia opaca chamada de "análise preditiva" sem respaldo científico, ou exige login. O nosso é genuinamente gratuito, usa metodologia validada citável, e combina escala Likert (eficiente) com refinamento conversacional via IA (personalização). Acesse-o em /teste-vocacional.',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Teste Vocacional', item: `${SITE_URL}/teste-vocacional` },
    { '@type': 'ListItem', position: 3, name: 'Metodologia', item: `${SITE_URL}/teste-vocacional/metodologia` },
  ],
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Metodologia: RIASEC + Inteligências Múltiplas no Teste Vocacional',
  description:
    'Como combinamos RIASEC (Holland, 1959) e Inteligências Múltiplas (Gardner, 1983) no teste vocacional com IA do Bolsa Click.',
  author: { '@type': 'Organization', name: 'Bolsa Click', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'Bolsa Click',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png` },
  },
  datePublished: '2024-01-15',
  dateModified: new Date().toISOString().slice(0, 10),
  mainEntityOfPage: `${SITE_URL}/teste-vocacional/metodologia`,
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

export default function MetodologiaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]) }}
      />

      <header className="bg-paper border-b border-hairline py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav
            className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3 md:mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/teste-vocacional" className="hover:text-ink-900">Teste Vocacional</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">Metodologia</span>
          </nav>
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-bolsa-secondary mb-2 inline-flex items-center gap-1.5">
            <Award size={11} /> Base científica
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink-900 leading-tight mb-4">
            Metodologia: RIASEC + Inteligências Múltiplas
          </h1>
          <p className="text-base md:text-lg text-ink-700 max-w-3xl">
            Nosso teste vocacional combina duas das teorias mais influentes em orientação
            vocacional e psicologia cognitiva. Em vez de inventar uma &ldquo;análise preditiva&rdquo;
            obscura, ancoramos a recomendação em frameworks com 40+ anos de pesquisa e uso clínico no mundo todo.
          </p>
        </div>
      </header>

      <article className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Holland (RIASEC): a base da orientação vocacional moderna</h2>

          <h3>História: John L. Holland, 1959</h3>
          <p>
            O psicólogo americano John L. Holland publicou em 1959 sua teoria de escolha
            vocacional baseada em uma observação simples: <strong>pessoas e ambientes profissionais
            podem ser classificados nos mesmos seis tipos</strong>. Quando o tipo da pessoa
            combina com o tipo do ambiente em que trabalha, a satisfação aumenta, o desempenho
            cresce e a retenção na carreira melhora. Holland chamou isso de <em>princípio
            da congruência pessoa-ambiente</em>.
          </p>
          <p>
            A teoria evoluiu nas décadas seguintes em livros como <em>Making Vocational Choices</em>
            (1973, 1985, 1997) e foi validada em centenas de estudos empíricos. Hoje o
            RIASEC é o framework mais usado em orientação vocacional formal no mundo, e
            está embutido no <strong>O*NET</strong> — o sistema oficial de classificação
            ocupacional do Department of Labor dos Estados Unidos, que mapeia mais de
            1.000 profissões com seus respectivos Holland Codes.
          </p>

          <h3>Os 6 tipos RIASEC</h3>
          <p>Cada tipo representa um conjunto característico de interesses, preferências e estilo de trabalho:</p>
          <ul>
            <li><strong>Realista (R)</strong> — práticos, gostam de coisas concretas, ferramentas, ação física. Engenheiros de campo, técnicos, agrônomos, atletas profissionais.</li>
            <li><strong>Investigativo (I)</strong> — analíticos, curiosos, gostam de pesquisar e entender como as coisas funcionam. Cientistas, médicos, programadores, biomédicos.</li>
            <li><strong>Artístico (A)</strong> — criativos, valorizam expressão, originalidade e ambientes não-estruturados. Designers, escritores, arquitetos, músicos.</li>
            <li><strong>Social (S)</strong> — focados em pessoas, gostam de ajudar, ensinar, cuidar. Professores, psicólogos, enfermeiros, terapeutas.</li>
            <li><strong>Empreendedor (E)</strong> — líderes, persuasivos, gostam de risco calculado e resultado mensurável. Gestores, vendedores, advogados, empreendedores.</li>
            <li><strong>Convencional (C)</strong> — organizados, valorizam estrutura, processos e detalhes. Contadores, auditores, administradores, profissionais de compliance.</li>
          </ul>
          <p>
            Cada pessoa não é só uma letra — é um <strong>Holland Code de 3 letras</strong>
            representando os tipos dominantes em ordem (primário, secundário, terciário).
            Alguém com perfil <em>SIA</em> tem Social como dominante, seguido de Investigativo
            e Artístico. Quanto mais o trabalho exigir essas três dimensões, maior a chance
            de realização. Pra explorar cada tipo a fundo, veja as páginas em{' '}
            <Link href="/teste-vocacional/perfil/social">Social</Link>,{' '}
            <Link href="/teste-vocacional/perfil/investigativo">Investigativo</Link>,{' '}
            <Link href="/teste-vocacional/perfil/artistico">Artístico</Link>,{' '}
            <Link href="/teste-vocacional/perfil/realista">Realista</Link>,{' '}
            <Link href="/teste-vocacional/perfil/empreendedor">Empreendedor</Link> ou{' '}
            <Link href="/teste-vocacional/perfil/convencional">Convencional</Link>.
          </p>

          <h3>Por que RIASEC funciona depois de 60+ anos</h3>
          <p>
            A robustez do modelo vem de três fatores: <strong>simplicidade</strong> (6 tipos
            cobrem a maioria dos perfis sem inflação de categorias),{' '}
            <strong>validação empírica massiva</strong> (centenas de estudos correlacionam
            Holland Code com satisfação profissional e retenção em carreira), e{' '}
            <strong>princípio teórico claro</strong> (congruência pessoa-ambiente é
            intuitivamente correto e replicável).
          </p>
          <p>
            Críticas existem — alguns pesquisadores argumentam que 6 tipos é simplificação
            excessiva, ou que o modelo subestima fatores como inteligência, personalidade
            (Big Five) e contexto socioeconômico. São críticas válidas, mas o RIASEC continua
            sendo a referência mais sólida pra <em>interesses vocacionais</em>{' '}
            especificamente — que é o que um teste vocacional inicial precisa medir.
          </p>
        </div>
      </article>

      <article className="bg-paper py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Gardner (Inteligências Múltiplas): como você processa informação</h2>

          <h3>História: Howard Gardner, 1983</h3>
          <p>
            Howard Gardner, professor da Universidade de Harvard, publicou em 1983 o livro
            <em> Frames of Mind: The Theory of Multiple Intelligences</em>. Sua proposta
            revolucionária foi questionar a ideia de que inteligência é uma capacidade
            única medida por QI. Gardner argumentou que a mente humana opera em pelo menos
            <strong> 8 inteligências relativamente independentes</strong> — cada uma com seu
            próprio mecanismo cognitivo e contexto cultural de manifestação.
          </p>
          <p>
            A teoria teve impacto profundo na educação (vários sistemas escolares no mundo
            redesenharam currículos pra contemplar múltiplas inteligências) e na psicologia
            cognitiva, embora tenha recebido crítica em psicometria pela dificuldade de
            validar empiricamente as 8 dimensões como construtos psicológicos independentes.
            Apesar das críticas, segue largamente usada em autoconhecimento e orientação.
          </p>

          <h3>As 8 inteligências</h3>
          <ul>
            <li><strong>Linguística</strong> — facilidade com palavras, leitura, escrita, oratória, argumentação. Escritores, advogados, jornalistas, professores.</li>
            <li><strong>Lógico-matemática</strong> — raciocínio lógico, abstração, padrões, problemas matemáticos. Cientistas, engenheiros, programadores, contadores.</li>
            <li><strong>Espacial</strong> — visualização de objetos e relações tridimensionais. Arquitetos, designers, pilotos, cirurgiões.</li>
            <li><strong>Musical</strong> — sensibilidade a sons, ritmo, melodia. Músicos, compositores, produtores musicais, audiologistas.</li>
            <li><strong>Corporal-cinestésica</strong> — coordenação motora, expressão física. Atletas, dançarinos, cirurgiões, artesãos.</li>
            <li><strong>Interpessoal</strong> — leitura de pessoas, empatia, cooperação. Líderes, professores, vendedores, terapeutas.</li>
            <li><strong>Intrapessoal</strong> — autoconhecimento, consciência emocional, reflexão. Filósofos, psicoterapeutas, escritores autobiográficos.</li>
            <li><strong>Naturalista</strong> — sensibilidade ao mundo natural, ecossistemas. Biólogos, agrônomos, veterinários, ambientalistas.</li>
          </ul>

          <h3>Por que complementa o RIASEC</h3>
          <p>
            Holland responde &ldquo;que tipo de ambiente combina com você?&rdquo;. Gardner
            responde &ldquo;como você prospera nesse ambiente?&rdquo;. Combinar os dois
            traz uma leitura mais rica. Alguém com perfil RIASEC fortemente Social pode
            se realizar em psicologia clínica — mas quem complementa com inteligência
            Lógico-matemática alta tende a se dar melhor em vertentes baseadas em dados;
            quem complementa com Interpessoal mais alta tende a brilhar em terapia em
            grupo. Mesmo Holland Code, vertentes diferentes da mesma profissão.
          </p>
          <p>
            No nosso teste, as 8 inteligências aparecem ao final como tags que
            contextualizam o Holland Code — não como diagnóstico isolado.
          </p>
        </div>
      </article>

      <article className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como aplicamos as duas teorias no Bolsa Click</h2>

          <h3>20 perguntas Likert mapeadas pras 14 dimensões</h3>
          <p>
            As 20 afirmações do teste foram desenhadas pra cobrir sistematicamente as 6
            dimensões RIASEC e as 8 inteligências Gardner. Cada resposta na escala 1-5
            soma pesos pras dimensões relevantes daquela afirmação. As perguntas estão
            organizadas em 3 capítulos visualmente marcados (&ldquo;Sobre você&rdquo;,
            &ldquo;Seu jeito de trabalhar&rdquo;, &ldquo;O que te move&rdquo;) pra reduzir
            fadiga e manter o foco.
          </p>

          <h3>Holland Code calculado deterministicamente</h3>
          <p>
            Depois das 20 respostas, um algoritmo determinístico (publicado em
            <code> app/lib/teste-vocacional/matching.ts</code>) calcula seu Holland Code de
            3 letras e suas inteligências dominantes. Determinístico significa que mesma
            resposta sempre dá o mesmo código — não há &ldquo;achismo&rdquo; de IA aqui.
            Você pode auditar e reproduzir o cálculo.
          </p>

          <h3>AI entra só pra personalizar reasoning</h3>
          <p>
            Depois do cálculo do perfil, nossa IA (gpt-4o-mini da OpenAI) faz 2-3 perguntas
            abertas adaptativas pra capturar nuance que a escala Likert não pega. Por
            exemplo: se seu perfil é Empreendedor + Social, ela pode perguntar sobre
            situações reais em que você assumiu protagonismo numa equipe. As respostas
            entram na geração do <em>reasoning</em> personalizado de cada curso recomendado
            — mas <strong>a IA não escolhe os cursos</strong>, só personaliza a justificativa.
            Os cursos são pré-selecionados pelo matching determinístico com o catálogo.
          </p>
        </div>
      </article>

      <article className="bg-paper py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Limitações e ressalvas honestas</h2>
          <p>
            Importante deixar claro: <strong>nenhum teste vocacional online é
            diagnóstico</strong>. O nosso é uma ferramenta de orientação inicial, baseada
            em metodologia validada, mas com limitações reais que vale considerar:
          </p>
          <ul>
            <li><strong>Auto-relato</strong>: o teste reflete o que você acha de você
              hoje. Pode mudar com mais autoconhecimento.</li>
            <li><strong>Sem variáveis externas</strong>: não consideramos mercado de
              trabalho, retorno financeiro, mudanças tecnológicas, ou contexto familiar e
              socioeconômico — todos influenciam escolha de carreira.</li>
            <li><strong>Catálogo limitado</strong>: hoje mapeamos 22 cursos de graduação.
              Você pode ter perfil que combina perfeitamente com uma profissão fora da
              nossa lista.</li>
            <li><strong>Personalidade vs. interesse</strong>: RIASEC mede interesses, não
              traços de personalidade (Big Five seria complementar e não está coberto).</li>
          </ul>
          <p>
            Pra decisões grandes — escolha de primeira graduação, mudança de carreira na
            meia-idade, dúvidas que vêm com ansiedade — recomendamos buscar acompanhamento
            profissional com psicólogo ou orientador educacional. O teste é
            complementar, não substituto.
          </p>
        </div>
      </article>

      <VisibleFaq items={faqItems} heading="Perguntas frequentes sobre a metodologia" />

      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Sparkles className="mx-auto text-bolsa-secondary mb-3" size={28} />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
            Pronto pra descobrir seu Holland Code?
          </h2>
          <p className="text-ink-700 mb-6 text-sm md:text-base">
            5 minutos, sem CPF, totalmente baseado em RIASEC + Gardner.
          </p>
          <Link
            href="/teste-vocacional"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-medium rounded-md hover:opacity-90"
          >
            <Sparkles size={16} /> Fazer o teste agora
          </Link>
        </div>
      </section>
    </>
  )
}
