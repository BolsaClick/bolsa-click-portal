# Google Tracking — Guia operacional GTM / GA4 / Google Ads

> **Status:** guia escrito em 2026-07-17 a partir da auditoria do container `GTM-K4KZBRF3`.
> **Público:** quem tem acesso de edição/publicação no GTM e acesso admin no Google Ads.
> **Objetivo:** sair de "todo form submit vira conversão" para um funil com conversões
> de verdade (Purchase com valor, Lead Estácio, matrícula pós/profissionalizante),
> alimentando o Smart Bidding com sinal limpo.

## IDs de referência

| O quê | Valor |
| --- | --- |
| Container GTM | `GTM-K4KZBRF3` |
| Google tag (googtag) | `GT-PL9LM36B` |
| GA4 Measurement ID | `G-3V5185H67J` |
| Google Ads (conta de conversão) | `AW-17355201661` |
| Rótulo da conversão atual (form submit) | `stDXCMmAt44bEP24zdNA` |
| Moeda | `BRL` |

---

## 1. Estado atual do container (auditoria 2026-07-17)

O container tem hoje **6 tags**:

| Tag | Tipo | Acionador | Problema |
| --- | --- | --- | --- |
| Google tag `GT-PL9LM36B` | Google tag | Inicialização (todas as páginas) | OK — manter. |
| Configuração GA4 `G-3V5185H67J` | Google tag / config GA4 | Todas as páginas | OK — manter. |
| Conversion Linker | Vinculador de conversões | Todas as páginas | OK — manter (necessário pros cookies `_gcl_*`). |
| Conversão Google Ads "form submit" (`AW-17355201661` / `stDXCMmAt44bEP24zdNA`) | Acompanhamento de conversões do Google Ads | `gtm.formSubmit` (listener de envio de formulário com filtro "algum campo contém `@`") | **Qualquer** formulário com email dispara conversão: chat do Bob, newsletter, teste vocacional. Sinal sujo pro Smart Bidding — o Ads otimiza pra "gente que preenche qualquer coisa", não pra quem paga. Sem valor, sem dedup. |
| Evento GA4 "Envio de Formulário" | Google Analytics: evento do GA4 | Mesmo `gtm.formSubmit` genérico | Mesmo problema — infla "conversão" no GA4 com submits que não valem nada. |
| — | — | — | **Faltando:** nenhuma tag escuta `purchase`, `generate_lead`, `begin_checkout`, `formSuccess`/`formBSuccess`. Os pushes que o site já faz são **órfãos** — chegam no dataLayer e morrem ali. Conversão de pagamento confirmada nunca chega no Ads. |

### O que o site já empurra no dataLayer (código novo, deploy próximo)

Eventos no **schema padrão GA4 ecommerce** (`ecommerce: { currency, value, items, transaction_id }`),
via `app/lib/analytics/gtag.ts` (`pushDataLayerEvent`, que já faz o `ecommerce: null` antes de cada push):

| Evento | Quando dispara | Fluxo |
| --- | --- | --- |
| `view_item` | Página de curso carrega | Todos |
| `select_item` | Clique no card de curso | Todos |
| `begin_checkout` | Checkout aberto | Cogna e Estácio |
| `add_payment_info` | Dados de pagamento preenchidos | Cogna (matrícula) |
| `purchase` | Pagamento da taxa de matrícula confirmado (PIX/cartão) — com `transaction_id`, `value`, `currency: 'BRL'`, `items` | Cogna (matrícula) |
| `generate_lead` | Inscrição criada na Estácio (pagamento acontece na instituição) | Estácio |
| `formSuccess` / `formBSuccess` | Página de sucesso de matrícula (nome varia por tema via `NEXT_PUBLIC_THEME`: `anhanguera` → `formSuccess`, demais → `formBSuccess`) | Pós/profissionalizante ≈ CompleteRegistration |
| `enhanced_conversion_data` | Step 2 do checkout (PaymentForm renderiza) — `user_data: { email, phone_number, name }` **em claro** | Cogna |

### Mapa de conversão por fluxo de negócio

| Fluxo | Funil no dataLayer | Conversão que importa |
| --- | --- | --- |
| (a) Cogna / matrícula | `begin_checkout` → `add_payment_info` → `purchase` | **`purchase`** (tem valor em R$) |
| (b) Estácio | `begin_checkout` → `generate_lead` | **`generate_lead`** (sem pagamento no site) |
| (c) Pós / profissionalizante | checkout → `formSuccess`/`formBSuccess` | **`formSuccess`/`formBSuccess`** |

---

## 2. Passo a passo no painel do GTM

Trabalhe num **espaço de trabalho** novo (canto superior esquerdo → "Espaço de trabalho padrão" → `+` → nomeie `conversoes-funil-2026-07`). Só publique depois do checklist da seção 3.

### 2.1 Criar os acionadores de Evento personalizado

Repita o processo abaixo **8 vezes**, um acionador por evento.

1. Menu lateral → **Acionadores** → **Novo**.
2. Nomeie seguindo o padrão `CE - <evento>` (ex.: `CE - purchase`).
3. Clique em **Configuração do acionador** → escolha o tipo **Evento personalizado**.
4. Em **Nome do evento**, digite o nome EXATO do push (case-sensitive):
   - `view_item`
   - `select_item`
   - `begin_checkout`
   - `add_payment_info`
   - `generate_lead`
   - `purchase`
   - `formSuccess`
   - `formBSuccess`
5. Em "Este acionador é disparado em", deixe **Todos os eventos personalizados**.
6. **Salvar**.

Atalho para os dois de sucesso de matrícula: dá pra criar UM acionador `CE - formSuccess (ambos temas)` marcando **Usar correspondência de regex** e usando `^(formSuccess|formBSuccess)$` como nome do evento. Recomendado — evita duplicar tag.

Opcional (para a tag GA4 única da seção 2.2-B): um acionador agrupando os eventos ecommerce, também com regex: nome `CE - ga4 ecommerce (regex)`, **Usar correspondência de regex** marcado, nome do evento `^(view_item|select_item|begin_checkout|add_payment_info|generate_lead|purchase)$`.

### 2.2 Tags GA4 de evento (ecommerce)

**Importante:** a "Medição aprimorada" (enhanced measurement) do GA4 NÃO captura eventos de ecommerce do dataLayer — ela só cobre page_view, scroll, clique de saída, etc. Os eventos `purchase`, `begin_checkout` etc. **precisam de tag GA4 de evento no GTM** lendo o objeto `ecommerce` da camada de dados.

Duas formas — escolha UMA. A opção B é a recomendada (menos tags pra manter).

#### Opção A — uma tag por evento

Para cada evento ecommerce (6 tags):

1. **Tags** → **Novo** → nomeie `GA4 - <evento>` (ex.: `GA4 - purchase`).
2. **Configuração da tag** → **Google Analytics** → **Google Analytics: evento do GA4**.
3. **ID de métricas**: `G-3V5185H67J`.
4. **Nome do evento**: o mesmo nome do push (ex.: `purchase`).
5. Expanda **Mais configurações** → marque **Enviar dados de e-commerce** → **Fonte de dados: Camada de dados** (Data Layer). Isso faz a tag ler `ecommerce.value`, `ecommerce.items`, `ecommerce.transaction_id` automaticamente — não crie parâmetro manual nenhum.
6. **Acionamento**: o acionador `CE - <evento>` correspondente.
7. **Salvar**.

#### Opção B — tag única com `{{Event}}` (recomendada)

1. **Tags** → **Novo** → nomeie `GA4 - ecommerce (evento dinâmico)`.
2. Tipo **Google Analytics: evento do GA4**, **ID de métricas** `G-3V5185H67J`.
3. **Nome do evento**: digite `{{Event}}` — a variável interna do GTM que carrega o nome do evento do dataLayer. Assim a tag repassa `purchase` como `purchase`, `begin_checkout` como `begin_checkout`, etc.
   - Se `{{Event}}` não aparecer no autocomplete: **Variáveis** → **Configurar** (variáveis internas) → marque **Evento** na seção "Utilitários".
4. **Mais configurações** → **Enviar dados de e-commerce** → **Fonte de dados: Camada de dados**.
5. **Acionamento**: o acionador regex `CE - ga4 ecommerce (regex)` da seção 2.1.
6. **Salvar**.

Para `formSuccess`/`formBSuccess` (que não são ecommerce), crie uma tag separada `GA4 - matricula concluida (pos/profi)`:
tipo **Google Analytics: evento do GA4**, nome do evento fixo `matricula_concluida` (normaliza os dois nomes de tema num evento GA4 só), acionador `CE - formSuccess (ambos temas)`. Sem "Enviar dados de e-commerce".

### 2.3 Conversões Google Ads

Regra geral: cada conversão do Ads precisa de (1) a **ação de conversão** criada no painel do Google Ads e (2) uma **tag** no GTM (quando for tag direta) ou uma **importação do GA4** (quando for via GA4).

#### 2.3.1 Conversão "Compra — Matrícula" no `purchase` — TAG DIRETA (recomendado)

Duas rotas possíveis; **recomendamos a tag direta**:

- **Importar do GA4**: no Ads, Metas → Conversões → Nova ação → Importar → GA4 → evento `purchase`. Simples, mas o dado passa por GA4 → Ads com latência maior (horas a até 1 dia) e modelagem intermediária. Smart Bidding aprende mais devagar.
- **Tag Ads direta (recomendado)**: a conversão chega no Ads em tempo quase real, com `value` e `transaction_id` nativos. Smart Bidding (tROAS/tCPA) começa a otimizar mais rápido.

Passos:

**No Google Ads:**
1. Metas → **Conversões** → **Resumo** → **Nova ação de conversão** → **Site**.
2. Categoria: **Compra**. Nome: `Compra - Taxa de matrícula`.
3. Valor: **Usar valores diferentes para cada conversão** (o valor vem da tag).
4. Contagem: **Uma** por interação... na verdade para compra use **Todas** — o `transaction_id` já deduplica repetições da mesma transação.
5. Escolha instalação **via Google Tag Manager** → anote o **ID de conversão** (`17355201661`) e o **Rótulo de conversão** novo gerado.

**No GTM:**
1. **Tags** → **Novo** → nomeie `Ads - Conversao - Compra matricula`.
2. Tipo **Google Ads** → **Acompanhamento de conversões do Google Ads**.
3. **ID de conversão**: `17355201661`. **Rótulo de conversão**: o rótulo novo do passo acima (NÃO reutilize `stDXCMmAt44bEP24zdNA`).
4. Crie 3 variáveis de camada de dados (menu **Variáveis** → **Nova** → tipo **Variável da camada de dados**):
   - `DLV - ecommerce.value` → nome da variável na camada: `ecommerce.value`
   - `DLV - ecommerce.transaction_id` → `ecommerce.transaction_id`
   - `DLV - ecommerce.currency` → `ecommerce.currency`
5. Na tag: **Valor da conversão** = `{{DLV - ecommerce.value}}`, **Código da transação** = `{{DLV - ecommerce.transaction_id}}`, **Código da moeda** = `{{DLV - ecommerce.currency}}`.
6. **Acionamento**: `CE - purchase`.
7. **Salvar**.

**Dedup por `transaction_id`:** o Google Ads descarta automaticamente conversões repetidas com o mesmo Código da transação (refresh da página de sucesso, volta pelo histórico, etc.) dentro da janela de conversão. Por isso o campo é obrigatório aqui — sem ele, cada F5 na página de sucesso viraria outra compra. Se um dia importarem TAMBÉM o `purchase` do GA4, deixe apenas UMA das duas ações como "primária" (a outra como secundária), senão a mesma compra conta duas vezes no relatório de conversões.

#### 2.3.2 Conversão "Lead Estácio" no `generate_lead`

**No Google Ads:** nova ação de conversão → Site → categoria **Enviar formulário de lead** (ou **Inscrição**) → nome `Lead - Inscricao Estacio` → valor: pode usar **Usar o mesmo valor para cada conversão** com um valor fixo estimado do lead (alinhar com o Rodrigo) ou "Não usar valor" — de início, sem valor é aceitável. Contagem: **Uma** (um lead por clique é o que importa). Anote o rótulo novo.

**No GTM:**
1. **Tags** → **Novo** → `Ads - Conversao - Lead Estacio`.
2. Tipo **Acompanhamento de conversões do Google Ads**, ID `17355201661`, rótulo novo.
3. Sem valor/transaction_id obrigatórios (se decidirem valor fixo, configure no próprio Ads, não na tag).
4. **Acionamento**: `CE - generate_lead`.

#### 2.3.3 Conversão "Matrícula pós/profissionalizante" (CompleteRegistration)

**No Google Ads:** nova ação → Site → categoria **Inscrição** → nome `Matricula - Pos/Profissionalizante`. Anote o rótulo.

**No GTM:** tag `Ads - Conversao - Matricula pos/profi`, tipo Acompanhamento de conversões do Google Ads, ID `17355201661`, rótulo novo, acionador `CE - formSuccess (ambos temas)` (o regex cobre os dois temas).

#### 2.3.4 O que fazer com a conversão atual de form submit

**NÃO apague agora.** As novas ações de conversão começam com volume zero e o Smart Bidding precisa de dados. Plano de transição:

1. **Hoje:** renomeie a ação no Ads para `[LEGADO] Form submit generico` (deixa explícito que é sinal fraco). Mantenha como está.
2. **Quando `Compra - Taxa de matrícula` + `Lead Estacio` somarem ~30 conversões em 30 dias** (mínimo pro Smart Bidding): no Ads, abra a ação legada → **Configurações** → **Ação de conversão primária/secundária** → mude para **Secundária** (vira só observação, sai do lance automático). As novas ficam como **Primárias**.
3. **Depois de mais 30-60 dias estáveis:** avaliar pausar a ação legada de vez.

Faça o mesmo rebaixamento nos objetivos da campanha se as campanhas usarem "metas de conta" — confira em cada campanha se a meta de conversão referencia a ação certa.

### 2.4 Enhanced Conversions (conversões otimizadas)

O site já empurra, no Step 2 do checkout, o push:

```js
dataLayer.push({
  event: 'enhanced_conversion_data',
  user_data: {
    email: '...',        // em claro
    phone_number: '...', // em claro
    name: '...',
  },
})
```

(fonte: `app/components/organisms/PaymentForm/index.tsx`)

**Pré-requisito no Ads:** Metas → Conversões → Configurações → **Conversões otimizadas** → ativar → método **Tag do Google ou Google Tag Manager**. Aceite os termos.

**No GTM:**

1. Crie as variáveis de camada de dados:
   - `DLV - user_data.email` → nome na camada: `user_data.email`
   - `DLV - user_data.phone_number` → `user_data.phone_number`
2. Crie a variável de dados do usuário: **Variáveis** → **Nova** → tipo **Dados fornecidos pelo usuário** → nomeie `UPD - enhanced conversions` → modo **Configuração manual** → campo **E-mail** = `{{DLV - user_data.email}}`, campo **Telefone** = `{{DLV - user_data.phone_number}}`.
3. Nas tags de conversão do Ads (2.3.1, 2.3.2, 2.3.3): expanda **Incluir dados fornecidos pelo usuário do seu site** → marque e selecione `{{UPD - enhanced conversions}}`.

**Armadilha técnica — persistência entre páginas:** variável de camada de dados NÃO sobrevive à navegação. O push `enhanced_conversion_data` acontece na página do checkout, mas `purchase`/`formSuccess` podem disparar na página de sucesso (outra carga de página em Next.js dependendo do fluxo) — nesse caso `user_data.*` estará vazio quando a tag de conversão disparar. **Validar no Preview** (seção 3): se na hora do `purchase` a variável `UPD - enhanced conversions` estiver vazia, é preciso o time de dev re-empurrar o `enhanced_conversion_data` também na página de sucesso (ou incluir `user_data` no próprio push do `purchase`).

**Ressalva de privacidade (registrar o risco):** email e telefone vão pro dataLayer **em claro**. O Google aceita assim e a tag faz hash SHA-256 client-side antes de enviar — o valor cru não sai do navegador pela tag. Mas o dado em claro fica exposto no dataLayer a QUALQUER script third-party da página (outros pixels, chat, etc.), o que é superfície de vazamento e ponto de atenção **LGPD**: precisa de base legal documentada e cobertura na política de privacidade/banner de consentimento. Hoje o GTM só injeta com consentimento de marketing aceito (ver `AnalyticsScripts.tsx`), o que mitiga — mas o push em claro em si fica registrado aqui como risco aceito até o time trocar por hash server-side ou push já hasheado.

### 2.5 Limpeza do trigger genérico

1. No GTM, renomeie a tag Ads antiga para `[LEGADO] Ads - form submit generico` e a tag GA4 "Envio de Formulário" para `[LEGADO] GA4 - form submit generico`.
2. **Não** remova os acionadores ainda (a transição da seção 2.3.4 depende deles).
3. Quando a ação legada for pausada no Ads, aí sim: pause/remova as duas tags legadas e o acionador `gtm.formSubmit` genérico.

---

## 3. Checklist de validação (antes de publicar)

### 3.1 Preview do GTM (modo de visualização)

1. No workspace, clique em **Visualizar** (Tag Assistant abre).
2. Conecte em `https://www.bolsaclick.com.br` (ou o domínio do tema em teste).
3. Percorra o fluxo real: página de curso → card → checkout → pagamento de teste.
4. Para cada evento, confira no painel esquerdo do Tag Assistant:
   - [ ] `view_item` aparece na página de curso e a tag GA4 dispara ("Tags Fired").
   - [ ] `select_item` no clique do card.
   - [ ] `begin_checkout` ao abrir o checkout.
   - [ ] `enhanced_conversion_data` aparece no Step 2 e a variável `UPD - enhanced conversions` está **preenchida** (aba "Variables").
   - [ ] `add_payment_info` ao preencher pagamento.
   - [ ] `purchase` dispara: tag GA4 **e** tag Ads de compra, com `Valor da conversão` e `Código da transação` resolvidos (aba "Variables" do evento — nada de `undefined`).
   - [ ] Na hora do `purchase`, a `UPD - enhanced conversions` ainda tem email/telefone (ver armadilha da seção 2.4).
   - [ ] Fluxo Estácio: `generate_lead` dispara a tag Ads de lead.
   - [ ] Página de sucesso pós/profi: `formSuccess` (tema anhanguera) ou `formBSuccess` (demais) dispara a tag Ads de matrícula.
   - [ ] Nenhuma tag nova dispara em evento errado (ex.: tag de compra em `begin_checkout`).
   - [ ] Aba "Errors" do Tag Assistant zerada.

### 3.2 DebugView do GA4

1. GA4 (`G-3V5185H67J`) → Administrador → **DebugView** (o Preview do GTM já marca os hits como debug).
2. Confira que os eventos chegam com os parâmetros:
   - [ ] `purchase` com `value`, `currency`, `transaction_id` e `items` (expandir o evento → "Itens").
   - [ ] `begin_checkout`, `add_payment_info`, `generate_lead` com `items`/`value`.
   - [ ] Nenhum evento duplicado no mesmo segundo (indicaria tag dupla — ex.: opção A e B da seção 2.2 ativas ao mesmo tempo).
3. Depois de publicar: Relatórios → Monetização → **Compras de e-commerce** deve começar a popular em ~24h.

### 3.3 Diagnóstico de conversões no Google Ads

1. Metas → Conversões → **Resumo**: nas primeiras horas após o teste, as novas ações devem sair de "Inativa" para **"Registrando conversões"** (pode levar de 3h a 1 dia).
2. Abra cada ação → aba **Diagnóstico**:
   - [ ] Status da tag: "Ativa".
   - [ ] Conversões otimizadas: "Registrando dados fornecidos pelo usuário" (se 2.4 configurado).
   - [ ] Sem alerta de "transaction_id ausente" na ação de compra.
3. [ ] Confirmar que a ação `[LEGADO] Form submit generico` continua registrando (não quebramos o que existia) até o rebaixamento planejado.

---

## 4. Tabela final — evento → tag → conversão Ads → papel

| Evento (dataLayer) | Tag GTM | Conversão Google Ads | Primária/Secundária |
| --- | --- | --- | --- |
| `view_item` | `GA4 - ecommerce (evento dinâmico)` | — (só GA4, funil/remarketing) | — |
| `select_item` | `GA4 - ecommerce (evento dinâmico)` | — (só GA4) | — |
| `begin_checkout` | `GA4 - ecommerce (evento dinâmico)` | — (só GA4; útil pra públicos de abandono) | — |
| `add_payment_info` | `GA4 - ecommerce (evento dinâmico)` | — (só GA4) | — |
| `purchase` | `GA4 - ecommerce (evento dinâmico)` + `Ads - Conversao - Compra matricula` | `Compra - Taxa de matrícula` (valor dinâmico + transaction_id + enhanced conversions) | **Primária** |
| `generate_lead` | `GA4 - ecommerce (evento dinâmico)` + `Ads - Conversao - Lead Estacio` | `Lead - Inscricao Estacio` (+ enhanced conversions) | **Primária** |
| `formSuccess` / `formBSuccess` | `GA4 - matricula concluida (pos/profi)` + `Ads - Conversao - Matricula pos/profi` | `Matricula - Pos/Profissionalizante` (+ enhanced conversions) | **Primária** |
| `gtm.formSubmit` (genérico, legado) | `[LEGADO] Ads - form submit generico` + `[LEGADO] GA4 - form submit generico` | `[LEGADO] Form submit generico` | Primária **temporária** → **Secundária** quando as novas somarem ~30 conversões/30 dias → pausar |
| `enhanced_conversion_data` | — (alimenta a variável `UPD - enhanced conversions`) | usada dentro das 3 tags Ads acima | — |

### Referências no código

- Push genérico + limpeza de `ecommerce`: `app/lib/analytics/gtag.ts`
- Push de dados do usuário (enhanced conversions): `app/components/organisms/PaymentForm/index.tsx`
- Sucesso de matrícula (`formSuccess`/`formBSuccess` por tema): `app/checkout/success/SuccessClient.tsx` e `app/checkout/matricula/sucesso/MatriculaSuccessClient.tsx`
- Injeção condicionada a consentimento de marketing: `app/components/organisms/AnalyticsScripts.tsx`
