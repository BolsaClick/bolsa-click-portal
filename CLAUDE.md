# CLAUDE.md — diretrizes editoriais e técnicas do Bolsa Click

## Conteúdo público (blog, landing, FAQ, sitemap, meta tags)

**NUNCA citar, linkar ou mencionar pelo nome** os agregadores concorrentes:

- Quero Bolsa
- EducaMais Brasil (ou Educa Mais)
- Vai de Bolsa
- Bolsa Universitária
- Qualquer outro agregador concorrente de bolsas

Comparações são permitidas em termos genéricos ("plataformas agregadoras", "outros sites de bolsa") sem nomes.

### Fontes externas permitidas (whitelist editorial)

- **.gov.br**: MEC, INEP, e-MEC, IBGE, CAGED, CBO, Ministério da Saúde, etc.
- **Conselhos profissionais**: CFA, CRP, CFM, CREA, OAB, CFO, CFM, COREN
- **Parceiros**: Anhanguera, Unopar, Pitágoras (sites institucionais)
- **Mídia generalista**: G1, UOL, Folha de S.Paulo, Estadão, Valor Econômico

Citar por nome, contextualmente. URLs externas só quando agregam informação não disponível em fontes oficiais.

### Conteúdo gerado por IA

Scripts que geram conteúdo (ex: `scripts/seed-blog-posts.ts`) devem ter:

1. Regra de proibição dos concorrentes **no system prompt** da chamada de API
2. **Validador pós-geração** (regex) que rejeita resposta se mencionar qualquer concorrente proibido
3. **Anti-hallucination**: preços, % de bolsa e nota MEC devem vir do `DATA_BLOCK` literal do catálogo — `prisma.institution.findMany` e tartarus API. Nunca aceitar valor inventado pelo modelo

### Plágio e cópia

Conteúdo público deve ser **100% original**. Proibido reproduzir ou parafrasear texto de Guia da Carreira, EAD.com.br, ou qualquer outro site educacional. Conteúdo deve derivar de:

- Dados first-party do catálogo (FeaturedCourse, FaculdadeCurso, Institution, Unidade)
- Fontes oficiais da whitelist acima
- Conhecimento factual sintetizado com voz própria

### Padrão de abertura editorial (AI search / GEO)

Posts de blog e landing pages devem **responder a query principal nos primeiros 40-60 palavras**. ChatGPT, Perplexity e AI Overviews extraem o primeiro bloco semântico relevante como snippet — contextualização antes da resposta faz o conteúdo perder citações.

**Padrão errado** (contextualiza primeiro):
> "Antes de sair se inscrevendo em qualquer bolsa, é importante entender..."

**Padrão correto** (resposta direta + contexto depois):
> "Pra conseguir bolsa de 50% ou mais, o caminho mais rápido é candidatar-se ao Prouni via ENEM ou buscar bolsas próprias de faculdades EAD parceiras, onde os descontos chegam a 85% sem nota de corte. Veja como cada opção funciona..."

Aplicar tanto em posts novos quanto na revisão de posts existentes. O script `scripts/seed-blog-posts.ts` deve incluir essa regra no system prompt.
