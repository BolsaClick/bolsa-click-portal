# Auditoria do cadastro de `Institution` — 10/10/2026

Levantada depois de o agente de CTR observar no site Anhanguera com 70 polos, Pitágoras sem nota MEC e sem polos, e Wyden quase sem campo nenhum. Reproduzível com:

```
npx tsx scripts/audit-institutions.ts        # relatório
npx tsx scripts/audit-institutions.ts --ci   # exit 1 se houver BLOQUEIO
```

Estado em 10/10/2026: **8 registros, 31 achados — 9 bloqueios, 17 atenções, 5 notas.**

Nada foi corrigido neste branch. Nota MEC e contagem de polo não são estimáveis, e o resto depende de decisão que não é minha.

---

## Veredito sobre os 70 polos

**A medição contradiz o cadastro, e o campo está mal rotulado — não só errado.**

| | Anhanguera |
|---|---|
| `campusCount` no cadastro | 70 |
| Municípios com oferta ativa no nosso próprio cache | **209**, de 284 varridos |
| Medição do Rodrigo (EAD, amostra de 600 ofertas de **um** curso) | **382 municípios distintos** |

O `highlights` do registro entrega o que o número é: *"Mais de 70 polos **presenciais** em todo o país"*. O valor 70 é plausível como contagem de campus presencial. O problema é o rótulo: `/comparar/[pair]` mostra isso como **"Polos / Unidades"** e `/bolsas-de-estudo` escreve **"70 polos"**, sem a palavra "presenciais" em lugar nenhum. Para EAD — que é a maior parte do catálogo — o número relevante é duas ordens de grandeza maior.

E os 382 do Rodrigo provam uma segunda coisa: **a nossa medição de 209 também é piso**. `BRAZILIAN_CITIES` tem 284 municípios, e o precompute só varre essa lista. 382 > 284 significa que o teto da nossa contagem é a lista, não a realidade. Nenhum dos dois números mede cobertura nacional.

O mesmo problema de rótulo aparece em Unopar (750) e Estácio (100): 750 são polos EAD, 100 são campi presenciais, e as duas saem na mesma coluna como se fossem a mesma métrica. A tabela de comparação chega a **recomendar instituição** com base nisso (`page.tsx:487` compara `campusCount` pra dizer quem atende melhor "cobertura presencial").

---

## 1. Campo a campo

Vazio = `null`. ⚠ = presente mas suspeito.

| | anhanguera | unopar | pitagoras | unime | estacio | wyden | ibmec | mackenzie |
|---|---|---|---|---|---|---|---|---|
| `founded` | 1994 | 1972 | 1966 | 2000 | 1970 | **vazio** | 1970 | 1870 |
| `mecRating` | 3 | 3 | **vazio** | 4 | 4 | **vazio** | 5 | 5 |
| `emecLink` | registro | registro | ⚠ home | registro | registro | ⚠ home | registro | registro |
| `campusCount` | ⚠ 70 | ⚠ 750 | **vazio** | ⚠ 5 | ⚠ 100 | **vazio** | 4 | **vazio** |
| `studentCount` | 500.000+ | 350.000+ | **vazio** | 30.000+ | 600.000+ | **vazio** | 15.000+ | **vazio** |
| `coursesOffered` | 450 | 300 | **vazio** | 80 | 500 | **vazio** | 40 | **vazio** |
| `headquartersCity` | Valinhos/SP | Londrina/PR | BH/MG | Lauro de Freitas/BA | RJ/RJ | **vazio** | RJ/RJ | SP/SP |
| `longDescription` | 1.410 | 1.427 | 1.680 | 1.510 | 1.492 | ⚠ 554 | 1.557 | 1.464 |
| Cidades medidas | 209 | 171 | ⚠ 3 | ⚠ 11 | 228 | **0** | **0** | 0 (ok: só pós) |
| `updatedAt` | 02/09 | 02/09 | 02/09 | 13/07 | 02/09 | 02/09 | 02/09 | 29/09 |

Wyden é o registro mais fraco: sete campos vazios e o texto institucional com um terço do tamanho dos outros. Pitágoras é o segundo: sem nota MEC, sem polos, sem cursos, sem alunos — e é uma das marcas grandes da Cogna.

---

## 2. Os seis problemas estruturais

### A. `campusCount` mistura duas métricas na mesma coluna
Descrito acima. Não é erro de digitação: é um campo sem definição. Enquanto não existir a definição, qualquer valor que alguém preencher vai estar certo ou errado dependendo de quem lê.

### B. Wyden e IBMEC são invisíveis para o precompute de cidade
`scripts/precompute-institution-city-offers.ts` agrupa por um mapa fixo de 5 marcas (`BRAND_NAME_TO_SLUG`: anhanguera, unopar, pitagoras, unime, estacio). Oferta de qualquer outra marca é descartada com `continue`.

Não é que não exista oferta: o script irmão (`precompute-institution-max-discount`) mediu **382 ofertas de graduação da Wyden** e 58 da IBMEC. O inventário existe e o site não enxerga.

Mackenzie não tem linha porque é só pós e o precompute é GRADUACAO-only — esperado. (Mas vale entender por que o precompute de desconto mediu 43 ofertas "de graduação" pra ela.)

### C. A contagem de cidade é limitada pela lista, não pelo catálogo
O precompute itera `BRAZILIAN_CITIES` (284 municípios) e pergunta "tem oferta aqui?". Nunca pode responder mais que 284, qualquer que seja a realidade. Toda leitura dessa contagem como "cidades cobertas" é um piso apresentado como total.

### D. Linha de cache nunca expira
O `upsert` só escreve quando a marca aparece na busca daquela cidade. Cidade que **perdeu** oferta mantém o `offerCount` antigo para sempre — não há caminho de código que zere uma linha.

Hoje: **82 de 622 linhas não são reprocessadas há mais de 21 dias**, com um cron semanal. A mais antiga da Anhanguera é de **14/07** — quase três meses. Isso infla a cobertura e, por `MIN_OFFERS_TO_INDEX_INSTITUTION`, pode manter indexada uma página de marca×cidade que já não tem oferta.

### E. Os números estão duplicados em texto livre
`highlights` e `longDescription` repetem o número à mão: *"Mais de 70 polos presenciais"*, *"750+ polos presenciais"*, *"Mais de 100 campus e polos"*. Corrigir `campusCount` não corrige a frase. São duas cópias do mesmo fato que divergem independentemente.

### F. `sameAs` do e-MEC é fabricado, e `emecLink` é ignorado
`app/bolsas-de-estudo/page.tsx:603` emite no JSON-LD:

```
sameAs: [`https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/${inst.slug}`]
```

Esse padrão de URL não existe — o e-MEC usa um hash de IES, não o nosso slug. A URL correta **já está no banco**, na coluna `emecLink`, e não é usada. Publicamos um identificador externo inventado em structured data para as 8 instituições.

Para Pitágoras e Wyden nem isso: `emecLink` é `https://emec.mec.gov.br/` — a home do portal, que não identifica instituição nenhuma. São exatamente as duas sem `mecRating`.

### G. `Unidade` e `FaculdadeCurso` estão vazios
Zero linhas nas duas tabelas. O `CLAUDE.md` lista as duas como fonte de dado first-party para conteúdo público. Hoje não são fonte de nada.

---

## 3. De onde cada número deveria vir

| Campo | Fonte correta | Derivável do catálogo? |
|---|---|---|
| `mecRating` | e-MEC (consulta de IES) | **Não.** Dado regulatório. Qualquer estimativa é invenção. |
| `emecLink` | e-MEC, URL de registro da IES | **Não.** Coleta manual, uma vez por instituição. |
| `founded` | Instituição / e-MEC | **Não.** |
| `campusCount` (campi presenciais) | Instituição | **Não.** |
| **Municípios com oferta ativa** | Nosso catálogo | **Sim** — é o que o precompute já faz, corrigidos B, C e D. |
| `coursesOffered` | Catálogo | **Sim** — cursos distintos por marca já saem do Tartarus/Athena. |
| `studentCount` | Instituição / Censo INEP | **Não.** Marketing das redes; se ficar, precisa de data e fonte. |
| `headquartersCity` | e-MEC | **Não.** |

A divisão é limpa: **o que mede o nosso inventário deve ser derivado e nunca digitado; o que é fato institucional ou regulatório deve ser digitado uma vez, com link de origem, e nunca estimado.** Hoje as duas categorias estão misturadas na mesma tabela, preenchidas do mesmo jeito.

---

## 4. Proposta de manutenção

Em ordem de retorno sobre esforço.

**1. Separar o campo medido do campo declarado** *(decisão de produto, depois código)*
Renomear `campusCount` para o que ele é (campi presenciais) e acrescentar uma métrica **derivada** de municípios com oferta ativa, lida do `InstitutionCityOfferCache`. Na tela, a derivada sai com "≥" enquanto a cobertura for limitada pela lista de cidades. Isso resolve A sem ninguém ter que adivinhar número.

**2. Acrescentar wyden e ibmec ao `BRAND_NAME_TO_SLUG`** *(uma linha cada, risco zero)*
`hasCityPages` é `false` nas duas, então nenhuma página nova é publicada — só passa a existir inventário. Fecha B.

**3. Medir cobertura pelo fluxo de oferta, não pela lista de cidades** *(job novo)*
Paginar as ofertas da marca e contar municípios distintos — que foi exatamente o que o Rodrigo fez à mão para chegar nos 382. Dá o número nacional honesto em vez de um piso de 284. Fecha C e substitui o número que hoje está errado na tela.

**4. Expirar linha de cache na leitura** *(barato e não destrutivo)*
Tratar linha com `fetchedAt` acima da janela como desconhecida, em vez de deletar. Fecha D sem risco de apagar dado bom num run parcial.

**5. Interpolar o número nos `highlights` ou tirá-lo de lá** *(editorial)*
Uma cópia só do fato. Fecha E.

**6. Usar `emecLink` no `sameAs`, e só quando for URL de registro** *(incluído neste branch — ver abaixo)*
Fecha F parcialmente; completar exige coletar o registro real de Pitágoras e Wyden no e-MEC.

**7. Rodar `audit-institutions --ci` no workflow semanal do precompute**
Transforma esta auditoria em alarme contínuo em vez de foto. Sem isso, estamos na mesma situação daqui a três meses.

**8. Decidir sobre `Unidade` / `FaculdadeCurso`**
Popular ou remover do schema — e, se remover, tirar do `CLAUDE.md` a afirmação de que são fonte de dado.

---

## 5. O que não fazer

- **Não preencher `mecRating` de Pitágoras e Wyden por semelhança com as marcas irmãs do grupo.** Nota institucional é por IES, não por grupo. Estácio ter 4 não diz nada sobre a Wyden.
- **Não "corrigir" `campusCount` da Anhanguera para 209 ou 382.** Os dois medem municípios com oferta, não polos, e os dois são pisos. Trocar um número mal rotulado por outro mal rotulado não melhora nada.
- **Não publicar contagem de cidade sem dizer que é piso** enquanto a medição depender da lista de 284.

---

## Anexo: a única mudança de código deste branch

`app/bolsas-de-estudo/page.tsx` passa a emitir `sameAs` a partir de `emecLink`, e apenas quando a URL é de registro da IES. Instituição cujo link é a home do e-MEC fica sem `sameAs` — que é o estado honesto.

É correção de link, não de dado: remove um identificador externo inventado do nosso structured data. Está em commit separado, para poder ser descartado sem levar a auditoria junto.
