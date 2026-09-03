# DNA do Blog: Bolsa Click

Fonte de verdade estratégica de conteúdo pra qualquer post gerado pela skill
`/blog-post`. Leitura obrigatória e integral antes de escrever qualquer
artigo (Passo 1 do `SKILL.md`).

**Escopo desta skill**: uso pontual/situacional. Newsjacking, resposta a
mudança regulatória (ex: nova regra do Prouni/FIES), post de urgência
decidido no dia. NÃO é o pipeline de cadência regular do blog (isso é o
Hermes, agente externo que publica via `app/api/agents/blog/posts` e não
depende deste DNA.md). As duas fontes escrevem na mesma tabela
(`BlogPost`): um blog só, sem sistema paralelo.

## Quem somos

Bolsa Click é uma plataforma brasileira de bolsas de estudo. Conecta
estudantes a bolsas de até [teto atual, ver `DISCOUNT_CEILING_PCT` em
`app/lib/copy/claims.ts`] de desconto em 6 redes de ensino parceiras
(Anhanguera, Unopar, Pitágoras, Estácio, Unime e Wyden), graduação,
pós-graduação e cursos técnicos, presencial e EAD. Cadastro grátis, sem
taxa de adesão. Comparação de preços real (dado first-party do catálogo).

**Lock de claims (não republicar):** o teto de desconto nunca é hardcodeado
em prosa nem em prompt — sempre conferir `DISCOUNT_CEILING_PCT` em
`app/lib/copy/claims.ts` antes de publicar (esse arquivo já documenta a
âncora real por trás do número) e é proibido citar qualquer percentual
acima dele; valores maiores já foram usados por engano no passado. Não
citar Ampli. Não prometer "matrícula em 5 min" nem "bolsa vale o curso
inteiro" como absoluto. UNIC/UNIDERP/Ibmec podem aparecer no catálogo, mas
não são a 7ª rede do hero.

## Público-alvo

Estudante brasileiro (18-35 anos majoritariamente, mas cobre também quem
retoma os estudos mais tarde) buscando entrar ou voltar pra faculdade sem
condição de pagar mensalidade cheia. Preocupações reais: "cabe no meu
orçamento", "é uma faculdade séria (MEC)", "dá pra conciliar com trabalho",
"como funciona ProUni/FIES/bolsa direta". Pesquisa muito no Google antes de
decidir. Conteúdo tem que responder a pergunta real, não vender de cara.

## Tom de voz

- Direto, claro, sem jargão desnecessário. Português do Brasil natural.
- **Proibido travessão** (— ou –) em qualquer lugar do texto. Usar
  vírgula, ponto ou dois-pontos no lugar.
- **Sem emojis**, exceto reproduzindo uma mensagem real (ex.: citação de
  WhatsApp/depoimento). Nunca emoji decorativo do redator.
- Confiante mas honesto: nunca promete o que a instituição não garante,
  nunca infla número.

## Palavras-chave SEO

**Primárias** (cluster "bolsas de estudo", cada artigo cobre 1): bolsa de
estudo, bolsa de estudos, desconto em faculdade, faculdade com bolsa, bolsa
faculdade, ProUni, FIES, financiamento estudantil, mensalidade faculdade.

**Secundárias / cauda longa**: bolsa de estudo [curso], bolsa de estudo EAD,
bolsa de estudo presencial, como conseguir bolsa de estudo, nota de corte
[programa], bolsa para quem trabalha, faculdade em [cidade].

**Intenção GEO** (título/pergunta que IA de busca cita direto): "como
funciona X", "quanto custa X", "X vale a pena", "diferença entre X e Y",
"quem pode participar de X".

## Pilares de conteúdo

Baseado nas categorias já ativas no blog (`BlogCategory`, ver contagem via
`GET /api/agents/blog/categories`). A skill escolhe dentro desses pilares,
não inventa categoria nova sem necessidade real:

1. **Bolsas de Estudo** (maior pilar, 59+ posts): ProUni, FIES, bolsa
   direta, comparativos, como concorrer.
2. **EAD e Ensino a Distância** (25+ posts): custo, rotina, vale a pena,
   plataforma, reconhecimento MEC.
3. **MEC, Reconhecimento e Avaliação** (18+ posts): nota MEC, portaria,
   credenciamento, o que verificar antes de matricular.
4. **Cursos de Graduação / Carreiras / Carreira e Mercado**: mercado de
   trabalho por curso, salário, o que o profissional faz.
5. **Dicas de Estudo / Educação**: produtividade, ENEM, vestibular,
   organização (menos amarrado a conversão direta, mas alimenta topo de
   funil e GEO).

Antes de escolher tema: checar `GET /api/agents/blog/posts` (lista +
filtro por slug) pra não repetir um tema já coberto recentemente.
Newsjacking e urgência regulatória (motivo de uso desta skill) tendem a já
ser únicos por natureza, mas confira mesmo assim.

## Regras de SEO por artigo

- 1 keyword primária, presente em: título, meta description, primeiro
  parágrafo, pelo menos 1 H2.
- Título até 65 caracteres, formato pergunta ou "como fazer X".
- Meta description 140-160 caracteres, resume a resposta.
- Slug curto, minúsculo, sem acento, sem stopword desnecessária.
- 900-1500 palavras.
- Estrutura: intro (responde a pergunta principal nos primeiros 40-60
  palavras, ver padrão GEO abaixo) + 3-6 H2 + conclusão.
- Sempre incluir pelo menos 1 lista numerada ou passo a passo prático.
- Internal linking: pelo menos 2 links pra páginas reais do site (outro
  post do blog, `/curso/resultado`, `/bolsas-de-estudo`, página de curso
  específica). Nunca link quebrado, nunca link inventado.
- Termina levando ao produto (CTA pra buscar bolsa/se cadastrar) sem virar
  anúncio: a resposta editorial vem primeiro, o CTA é a última peça.

### Padrão de abertura editorial (GEO)

Responder a query principal nos primeiros 40-60 palavras: IA de busca
extrai o primeiro bloco semântico como citação. Contextualizar antes da
resposta faz o conteúdo perder citação.

**Errado** (contextualiza primeiro): "Antes de se inscrever em qualquer
bolsa, é importante entender..."

**Certo** (resposta direta, contexto depois): "Pra conseguir bolsa de 50%
ou mais, o caminho mais rápido é o ProUni via ENEM ou bolsas próprias de
faculdades EAD parceiras, com desconto de até [teto atual, ver
`app/lib/copy/claims.ts`] sem nota de corte. Veja como funciona cada
opção..."

## Guardrails obrigatórios (embutidos aqui, não herdados do Hermes)

Este DNA.md e a skill `/blog-post` são um pipeline separado do Hermes.
Os guardrails abaixo (espelhados do `CLAUDE.md` do repo) têm que estar
explícitos aqui porque não há herança automática entre pipelines.

### Proibido citar concorrentes

**Nunca citar, linkar ou mencionar pelo nome**, em nenhum artigo:

- Quero Bolsa
- EducaMais Brasil (ou Educa Mais)
- Vai de Bolsa
- Bolsa Universitária
- Qualquer outro agregador concorrente de bolsas

Comparação em termos genéricos é permitida ("outras plataformas de bolsa",
"outros sites de comparação"), sem nome próprio.

### Anti-alucinação: dado first-party obrigatório

**Preço, percentual de bolsa e nota MEC nunca são inventados pelo
modelo.** Se o artigo cita um valor de mensalidade, desconto ou nota MEC
de uma instituição específica, o valor tem que vir de um DATA_BLOCK
literal buscado do catálogo first-party (`prisma.institution`,
`FaculdadeCurso`, `FeaturedCourse` ou a API tartarus). Nunca de
"conhecimento geral" do modelo sobre preços de faculdade. Se não houver
dado real disponível pra citar, o artigo fala em termos genéricos
("bolsas chegam a X%", já confirmado por outros posts do cluster) em vez
de inventar um número novo.

Claims numéricos genéricos (não específicos de 1 instituição) só os já
validados no site: 6 redes parceiras, 280+ cidades com polos, desconto até
o teto de `DISCOUNT_CEILING_PCT` (`app/lib/copy/claims.ts`), +1.000
estudantes atendidos. Nunca inventar número tipo "30 mil faculdades" ou
"maior do Brasil".

### Fontes externas permitidas (whitelist editorial)

- `.gov.br`: MEC, INEP, e-MEC, IBGE, CAGED, CBO, Ministério da Saúde etc.
- Conselhos profissionais: CFA, CRP, CFM, CREA, OAB, CFO, COREN.
- Parceiros: Anhanguera, Unopar, Pitágoras (sites institucionais).
- Mídia generalista: G1, UOL, Folha de S.Paulo, Estadão, Valor Econômico.

Citar por nome, contextualmente. URL externa só quando agrega informação
que não está em fonte oficial.

### Originalidade

Conteúdo 100% original. Proibido reproduzir ou parafrasear texto de Guia
da Carreira, EAD.com.br, ou qualquer outro site educacional. Deriva de:
dado first-party do catálogo, fontes da whitelist acima, ou conhecimento
factual sintetizado com voz própria.

## Autoria (EEAT)

O campo `author` do post **tem que bater exatamente** com uma persona
existente em `app/lib/blog/editorial-team.ts` (JSON-LD Person consistente
com a página `/sobre/equipe-editorial`). Personas disponíveis hoje:

- Mariana Fonseca: Editora de Conteúdo Educacional (ProUni, FIES, mercado
  de trabalho, programas federais)
- Luis Fernando Costa
- Rafael Mendes
- Camila Rocha
- Thiago Oliveira

**Nunca inventar um nome novo de autor.** Se nenhuma persona existente
fizer sentido temático, usar `"Equipe Bolsa Click"` (cai no fallback de
Organization em `EDITORIAL_TEAM_ORG`, ainda válido, só não tem Person
dedicada).

> Nota (achado da investigação, não deste DNA): posts recentes do Hermes
> já usam `"Mariana Santos"`, que não bate com nenhuma persona (a mais
> próxima é "Mariana Fonseca") e cai no fallback de Organization
> silenciosamente. Não é bug desta skill, é drift do pipeline do Hermes,
> fora do escopo corrigir aqui. Só não repetir o mesmo erro nesta skill.
