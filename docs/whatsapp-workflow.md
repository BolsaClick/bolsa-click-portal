# WhatsApp AI Atendimento — n8n + Evolution API + Gemini

## Arquitetura Geral

```
┌──────────────┐     Webhook      ┌──────────────┐     API        ┌──────────────┐
│   WhatsApp   │ ──────────────▸  │     n8n      │ ────────────▸  │   Gemini AI  │
│  (Evolution) │ ◂──────────────  │  Workflow    │ ◂────────────  │   (Google)   │
│              │   Send Message   │              │   Response     │              │
└──────────────┘                  └──────┬───────┘                └──────────────┘
                                        │
                              ┌─────────┼─────────┐
                              │         │         │
                              ▼         ▼         ▼
                        ┌─────────┐ ┌────────┐ ┌──────────┐
                        │Bolsa    │ │Anhang. │ │ Leads DB │
                        │Click API│ │Website │ │ (Prisma) │
                        └─────────┘ └────────┘ └──────────┘
```

### URLs do Ambiente

| Serviço        | URL                                    |
| -------------- | -------------------------------------- |
| Evolution API  | `https://evo.inovitdigital.com.br`     |
| n8n            | `https://n8n.inovitdigital.com.br`     |
| Bolsa Click    | `https://www.bolsaclick.com.br`        |
| Webhook n8n    | `https://n8n.inovitdigital.com.br/webhook/whatsapp-bot` |

---

## 1. Configuração da Evolution API

### 1.1 Criar Webhook na Instância

Na Evolution API, configure o webhook da instância para enviar mensagens recebidas ao n8n.

**Via painel ou API:**

```bash
curl -X POST https://evo.inovitdigital.com.br/webhook/set/SUA_INSTANCIA \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY_EVOLUTION" \
  -d '{
    "url": "https://n8n.inovitdigital.com.br/webhook/whatsapp-bot",
    "webhook_by_events": true,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT"
    ]
  }'
```

> **Importante:** Substitua `SUA_INSTANCIA` pelo nome da sua instância e `SUA_API_KEY_EVOLUTION` pela API Key.

### 1.2 Enviar Mensagem via Evolution API

**Endpoint para envio de texto:**
```
POST https://evo.inovitdigital.com.br/message/sendText/SUA_INSTANCIA
Headers:
  Content-Type: application/json
  apikey: SUA_API_KEY_EVOLUTION

Body:
{
  "number": "5511999999999",
  "text": "Mensagem aqui"
}
```

**Endpoint para envio de imagem (PIX QR Code):**
```
POST https://evo.inovitdigital.com.br/message/sendMedia/SUA_INSTANCIA
Headers:
  Content-Type: application/json
  apikey: SUA_API_KEY_EVOLUTION

Body:
{
  "number": "5511999999999",
  "mediatype": "image",
  "media": "base64_da_imagem_aqui",
  "caption": "Escaneie o QR Code para pagar via PIX"
}
```

---

## 2. Workflow n8n — Visão Geral dos Nodes

```
[Webhook Trigger]
       │
       ▼
[Filter: Só mensagens de texto recebidas]
       │
       ▼
[Buscar Histórico da Conversa] ◀── Redis/n8n Storage
       │
       ▼
[Detectar Intenção com Gemini]
       │
       ├──▸ [Intenção: Buscar Curso] ──▸ [HTTP: API Bolsa Click] ──▸ [Formatar Resposta]
       │
       ├──▸ [Intenção: Info Acadêmica] ──▸ [HTTP: Scrape Anhanguera] ──▸ [Gemini: Resumir]
       │
       ├──▸ [Intenção: Capturar Lead] ──▸ [HTTP: POST /api/leads]
       │
       ├──▸ [Intenção: Transferir Humano] ──▸ [Notificar Atendente]
       │
       └──▸ [Intenção: Conversa Geral] ──▸ [Resposta Gemini Direta]
              │
              ▼
       [Salvar Histórico]
              │
              ▼
       [Enviar via Evolution API]
```

---

## 3. Configuração Passo a Passo no n8n

### Node 1: Webhook Trigger

- **Tipo:** Webhook
- **Method:** POST
- **Path:** `whatsapp-bot`
- **URL resultante:** `https://n8n.inovitdigital.com.br/webhook/whatsapp-bot`

### Node 2: Filter — Só mensagens válidas

**Tipo:** IF

Condição (JavaScript):
```javascript
// Filtra apenas mensagens de texto recebidas (não enviadas pelo bot)
const data = $json.body || $json;
const isMessage = data.event === 'messages.upsert';
const message = data?.data;
const isFromMe = message?.key?.fromMe === true;
const hasText = !!message?.message?.conversation || !!message?.message?.extendedTextMessage?.text;

return isMessage && !isFromMe && hasText;
```

**Extrair dados úteis (Set node após o IF):**
```javascript
const data = $json.body || $json;
const message = data.data;
const remoteJid = message.key.remoteJid;
const phone = remoteJid.replace('@s.whatsapp.net', '');
const text = message.message?.conversation
  || message.message?.extendedTextMessage?.text
  || '';
const pushName = message.pushName || '';

return {
  phone,
  text: text.trim(),
  pushName,
  remoteJid,
  messageId: message.key.id,
  timestamp: message.messageTimestamp
};
```

### Node 3: Buscar Histórico da Conversa

Use o node **Redis** ou **n8n Internal Storage** para manter o contexto.

**Opção A — Redis (recomendado para produção):**
- **Tipo:** Redis → Get
- **Key:** `whatsapp:{{$json.phone}}`
- **Se não existir:** retorna array vazio `[]`

**Opção B — HTTP Request para uma API de memória simples:**

Você pode criar um endpoint simples no Bolsa Click para armazenar histórico (ver seção 7).

**Estrutura do histórico:**
```json
{
  "phone": "5511999999999",
  "name": "João",
  "messages": [
    { "role": "user", "content": "Oi, quero saber sobre administração", "timestamp": "..." },
    { "role": "assistant", "content": "Olá João! Temos ótimas bolsas...", "timestamp": "..." }
  ],
  "leadData": {
    "name": "João Silva",
    "email": "joao@email.com",
    "cpf": null,
    "courseInterest": "Administração"
  },
  "stage": "browsing",
  "lastInteraction": "2026-03-04T10:00:00Z"
}
```

### Node 4: Gemini — Processar Mensagem

**Tipo:** HTTP Request

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=SUA_GEMINI_API_KEY
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "{{$json.systemPrompt}}\n\nHistórico:\n{{$json.history}}\n\nMensagem do usuário:\n{{$json.text}}" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.9,
    "maxOutputTokens": 1024,
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "intent": {
          "type": "string",
          "enum": ["BUSCAR_CURSO", "INFO_ACADEMICA", "CAPTURAR_LEAD", "CHECKOUT", "TRANSFERIR_HUMANO", "CONVERSA_GERAL", "STATUS_MATRICULA"]
        },
        "response": { "type": "string" },
        "courseQuery": { "type": "string" },
        "leadData": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" },
            "cpf": { "type": "string" },
            "courseInterest": { "type": "string" }
          }
        },
        "stage": {
          "type": "string",
          "enum": ["greeting", "browsing", "interested", "collecting_data", "checkout", "support", "handoff"]
        }
      },
      "required": ["intent", "response", "stage"]
    }
  }
}
```

### Node 5: Switch — Rotear por Intenção

**Tipo:** Switch

| Valor de `intent`    | Rota para                    |
| -------------------- | ---------------------------- |
| `BUSCAR_CURSO`       | Node: Buscar Cursos API      |
| `INFO_ACADEMICA`     | Node: Consultar Anhanguera   |
| `CAPTURAR_LEAD`      | Node: Criar Lead             |
| `CHECKOUT`           | Node: Gerar Link Checkout    |
| `TRANSFERIR_HUMANO`  | Node: Notificar Atendente    |
| `STATUS_MATRICULA`   | Node: Consultar Status       |
| `CONVERSA_GERAL`     | Node: Resposta Direta        |

### Node 6A: Buscar Cursos — HTTP Request

```
GET https://www.bolsaclick.com.br/api/cursos?search={{$json.courseQuery}}&limit=5
```

**Depois: Formatar resposta com Code node:**
```javascript
const courses = $json.courses || [];
if (courses.length === 0) {
  return { formattedCourses: 'Não encontrei cursos com esse nome. Tente outro termo.' };
}

const list = courses.map((c, i) => {
  return `*${i + 1}. ${c.fullName || c.name}*\n` +
    `   📚 Tipo: ${c.type} | ${c.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-Graduação'}\n` +
    `   ⏱ Duração: ${c.duration || 'Consultar'}\n` +
    `   💼 Mercado: ${c.marketDemand === 'ALTA' ? '🟢 Alta demanda' : c.marketDemand === 'MEDIA' ? '🟡 Média demanda' : '🔴 Baixa demanda'}\n` +
    `   🔗 Ver mais: https://www.bolsaclick.com.br/cursos/${c.slug}`;
}).join('\n\n');

return {
  formattedCourses: `Encontrei ${courses.length} curso(s):\n\n${list}\n\n💡 Quer saber valores e bolsas disponíveis? Me diga qual curso te interessa!`
};
```

### Node 6B: Consultar Anhanguera — HTTP Request

Para buscar informações acadêmicas do site da Anhanguera, use o Gemini com web grounding ou faça scraping:

**Opção 1 — Gemini com pesquisa web (recomendado):**

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Busque informações sobre o curso de {{$json.courseQuery}} na faculdade Anhanguera. Inclua: grade curricular, módulos, duração, modalidades disponíveis (EAD, presencial), e diferenciais. Fonte: site oficial da Anhanguera (anhanguera.com)." }]
    }
  ],
  "tools": [{ "googleSearch": {} }],
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 1024
  }
}
```

**Opção 2 — Scraping direto (se preferir):**
```
GET https://www.anhanguera.com/graduacao/cursos/{slug-do-curso}
```
Parsear o HTML com um Code node e extrair as informações relevantes.

### Node 6C: Criar Lead — HTTP Request

```
POST https://www.bolsaclick.com.br/api/leads

Headers:
  Content-Type: application/json

Body:
{
  "name": "{{$json.leadData.name}}",
  "email": "{{$json.leadData.email}}",
  "phone": "{{$json.phone}}",
  "cpf": "{{$json.leadData.cpf}}",
  "courseName": "{{$json.leadData.courseInterest}}",
  "institutionName": "Anhanguera",
  "courseNames": ["{{$json.leadData.courseInterest}}"]
}
```

### Node 6D: Gerar Link de Checkout

**Code node:**
```javascript
const courseSlug = $json.courseQuery
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const checkoutUrl = `https://www.bolsaclick.com.br/cursos/${courseSlug}`;

return {
  checkoutMessage: `🎓 *Pronto para garantir sua bolsa!*\n\n` +
    `Acesse o link abaixo para ver os valores com desconto e finalizar sua matrícula:\n\n` +
    `👉 ${checkoutUrl}\n\n` +
    `✅ Inscrição 100% gratuita\n` +
    `✅ Bolsas de até 80% de desconto\n` +
    `✅ Processo 100% online\n\n` +
    `Se precisar de ajuda durante o processo, é só me chamar! 😊`
};
```

### Node 6E: Transferir para Humano

**Code node — Formatar notificação:**
```javascript
return {
  handoffMessage: `🤖 *Transferindo para atendimento humano...*\n\n` +
    `Um de nossos consultores vai continuar seu atendimento em breve.\n` +
    `Horário de atendimento: Seg-Sex, 8h às 18h.\n\n` +
    `Enquanto isso, você pode explorar nossas bolsas em:\n` +
    `👉 https://www.bolsaclick.com.br/cursos`,
  // Notificação interna (pode enviar para grupo de atendentes)
  internalNotification: `🔔 *Novo atendimento para humano*\n` +
    `📱 Telefone: ${$json.phone}\n` +
    `👤 Nome: ${$json.pushName}\n` +
    `💬 Último assunto: ${$json.text}\n` +
    `📊 Estágio: ${$json.stage}`
};
```

**Depois: Enviar notificação para grupo de atendentes via Evolution API:**
```
POST https://evo.inovitdigital.com.br/message/sendText/SUA_INSTANCIA
{
  "number": "NUMERO_GRUPO_ATENDENTES@g.us",
  "text": "{{$json.internalNotification}}"
}
```

### Node 7: Salvar Histórico

**Redis → Set:**
- **Key:** `whatsapp:{{$json.phone}}`
- **Value:** histórico atualizado com a nova mensagem + resposta
- **TTL:** `86400` (24h) ou `604800` (7 dias)

### Node 8: Enviar Resposta via Evolution API

**Tipo:** HTTP Request

```
POST https://evo.inovitdigital.com.br/message/sendText/SUA_INSTANCIA

Headers:
  Content-Type: application/json
  apikey: SUA_API_KEY_EVOLUTION

Body:
{
  "number": "{{$json.phone}}",
  "text": "{{$json.finalResponse}}"
}
```

---

## 4. System Prompt do Gemini

Este é o prompt que define a personalidade e conhecimento da IA:

```
Você é a assistente virtual do Bolsa Click, a maior plataforma de bolsas de estudo do Brasil.

## Sua Identidade
- Nome: Ana (Assistente Bolsa Click)
- Tom: Amigável, profissional, empático e objetivo
- Idioma: Português brasileiro, informal mas respeitoso
- Use emojis com moderação (1-2 por mensagem)

## Sobre o Bolsa Click
- Plataforma que conecta estudantes a bolsas de estudo de até 80% de desconto
- Parceria principal com Anhanguera, Unopar e Unime (Grupo Cogna)
- Oferece cursos de Graduação (Bacharelado, Licenciatura, Tecnólogo) e Pós-Graduação
- Modalidades: EAD, Presencial e Semipresencial
- Inscrição 100% gratuita pelo site
- Site: https://www.bolsaclick.com.br

## Faculdades Parceiras
- **Anhanguera** — Maior rede privada do Brasil, nota MEC 4, 500.000+ alunos
- **Unopar** — Referência em EAD, presente em todo Brasil
- **Unime** — Forte no Nordeste, especialmente Bahia

## O que você DEVE fazer:
1. Cumprimentar o usuário pelo nome (se disponível)
2. Entender o que o usuário procura (curso, cidade, modalidade, preço)
3. Buscar cursos e apresentar opções com preços quando disponíveis
4. Coletar dados para lead quando o usuário demonstrar interesse (nome, email, telefone, CPF)
5. Direcionar para o checkout quando o usuário quiser se matricular
6. Transferir para humano quando: reclamações, problemas técnicos, assuntos financeiros complexos, ou quando o usuário pedir

## O que você NÃO deve fazer:
- Inventar preços, prazos ou informações que não tem
- Prometer descontos específicos sem consultar a API
- Falar sobre concorrentes
- Dar conselhos médicos, jurídicos ou financeiros
- Compartilhar dados de outros usuários

## Fluxo de Conversa Ideal:
1. **Saudação** → Perguntar o que procura
2. **Descoberta** → Entender curso + modalidade + cidade de interesse
3. **Apresentação** → Mostrar opções com valores
4. **Interesse** → Coletar dados para lead (nome, email)
5. **Conversão** → Enviar link do checkout
6. **Pós-venda** → Ajudar com dúvidas sobre matrícula

## Coleta de Dados (Lead):
Quando o usuário demonstrar interesse, colete gradualmente:
- Nome completo (pergunte se não souber)
- E-mail
- CPF (para matrícula)
- Curso de interesse
NÃO peça tudo de uma vez. Colete naturalmente durante a conversa.

## Respostas sobre cursos:
Ao apresentar cursos, inclua:
- Nome do curso e tipo (Bacharelado/Licenciatura/Tecnólogo)
- Modalidade (EAD/Presencial/Semipresencial)
- Duração
- Valor com bolsa (se disponível)
- Link para ver detalhes

## Quando transferir para humano:
- Usuário pede explicitamente para falar com alguém
- Reclamação ou problema com matrícula existente
- Questões sobre cancelamento ou reembolso
- Dúvidas muito específicas sobre grade curricular
- Após 3 tentativas de resolver sem sucesso

## Formato das mensagens:
- Mensagens curtas (máx. 3 parágrafos)
- Use *negrito* para destaque
- Use listas quando apresentar múltiplas opções
- Sempre termine com uma pergunta ou call-to-action
- Não use markdown de heading (#), apenas formatação WhatsApp (*negrito*, _itálico_, ~tachado~)
```

---

## 5. Gestão de Memória da Conversa

### Estrutura no Redis

**Key pattern:** `whatsapp:{phone}`
**TTL:** 7 dias (604800 segundos)

```json
{
  "phone": "5511999999999",
  "name": "João Silva",
  "messages": [
    {
      "role": "user",
      "content": "Oi quero saber sobre administração",
      "timestamp": "2026-03-04T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Olá! Temos ótimas bolsas para Administração...",
      "timestamp": "2026-03-04T10:00:05Z"
    }
  ],
  "leadData": {
    "name": "João Silva",
    "email": null,
    "cpf": null,
    "courseInterest": "Administração",
    "leadId": null
  },
  "stage": "browsing",
  "lastInteraction": "2026-03-04T10:00:05Z"
}
```

### Limpeza do Histórico

Para evitar que o contexto fique muito grande, mantenha apenas as últimas **20 mensagens**:

```javascript
// Code node antes de enviar ao Gemini
const history = $json.conversationHistory || { messages: [] };
const messages = history.messages || [];

// Manter apenas últimas 20 mensagens
const recentMessages = messages.slice(-20);

// Formatar para o Gemini
const formattedHistory = recentMessages
  .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
  .join('\n');

return {
  history: formattedHistory,
  stage: history.stage || 'greeting',
  leadData: history.leadData || {},
  name: history.name || $json.pushName || ''
};
```

---

## 6. Endpoint de Memória (Opcional)

Se preferir não usar Redis, crie esta API no Bolsa Click para gerenciar o histórico:

### Criar `app/api/whatsapp/memory/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET — Buscar histórico
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const memory = await prisma.whatsappMemory.findUnique({
    where: { phone }
  })

  return NextResponse.json({ memory: memory?.data || null })
}

// POST — Salvar/atualizar histórico
export async function POST(request: NextRequest) {
  const { phone, data } = await request.json()
  if (!phone || !data) return NextResponse.json({ error: 'phone and data required' }, { status: 400 })

  const memory = await prisma.whatsappMemory.upsert({
    where: { phone },
    update: { data, updatedAt: new Date() },
    create: { phone, data }
  })

  return NextResponse.json({ success: true, id: memory.id })
}
```

### Model Prisma necessário:

```prisma
model WhatsappMemory {
  id        String   @id @default(uuid())
  phone     String   @unique
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([phone])
}
```

---

## 7. Fluxo Completo — Exemplo de Conversa

```
👤 Usuário: Oi, boa tarde!
🤖 Ana: Boa tarde! 😊 Sou a Ana, assistente virtual do Bolsa Click.
         Aqui você encontra bolsas de até 80% em faculdades como
         Anhanguera, Unopar e Unime.
         Como posso te ajudar hoje?

👤 Usuário: Quero saber sobre o curso de Administração EAD
🤖 [Intent: BUSCAR_CURSO, courseQuery: "Administração"]
   [API: GET /api/cursos?search=Administração]
🤖 Ana: Ótima escolha! Administração é um dos cursos mais procurados 📚
         *Administração — Bacharelado EAD*
         ⏱ Duração: 4 anos (8 semestres)
         💼 Mercado: 🟢 Alta demanda
         🔗 Ver detalhes: bolsaclick.com.br/cursos/administracao
         Quer saber os valores com bolsa? 💰

👤 Usuário: Sim, quanto custa?
🤖 [Intent: BUSCAR_CURSO — detalhe de preço]
   [API: Consulta Tartarus para ofertas]
🤖 Ana: Aqui estão as bolsas disponíveis para Administração EAD:
         *Anhanguera* — de R$ 499/mês por *R$ 149/mês* (70% OFF)
         *Unopar* — de R$ 459/mês por *R$ 139/mês* (69% OFF)
         Qual te interessa mais? 😊

👤 Usuário: Anhanguera, como funciona a grade?
🤖 [Intent: INFO_ACADEMICA, courseQuery: "Administração Anhanguera"]
   [Gemini: busca web no site da Anhanguera]
🤖 Ana: O curso de Administração na Anhanguera tem:
         📋 *Grade Curricular:*
         • 1º ano: Fundamentos (Economia, Contabilidade, Matemática)
         • 2º ano: Gestão (Marketing, RH, Finanças)
         • 3º ano: Estratégia (Planejamento, Logística)
         • 4º ano: TCC + Estágio
         🖥 100% online com aulas ao vivo semanais
         Quer garantir sua bolsa de 70%?

👤 Usuário: Quero sim! Como faço?
🤖 [Intent: CAPTURAR_LEAD, stage: collecting_data]
🤖 Ana: Que ótimo! 🎉 Para garantir sua bolsa, preciso de
         algumas informações. Qual seu nome completo?

👤 Usuário: João Silva
🤖 Ana: Prazer, João! E qual seu melhor e-mail?

👤 Usuário: joao@email.com
🤖 [Intent: CAPTURAR_LEAD → POST /api/leads]
   [Lead criado com sucesso]
🤖 Ana: Perfeito, João! Sua pré-inscrição foi registrada ✅
         Acesse o link abaixo para finalizar com a bolsa de 70%:
         👉 https://www.bolsaclick.com.br/cursos/administracao
         ✅ Inscrição 100% gratuita
         ✅ Processo 100% online
         Precisa de mais alguma ajuda? 😊

👤 Usuário: Tenho um problema com minha matrícula
🤖 [Intent: TRANSFERIR_HUMANO]
🤖 Ana: Entendo, João. Vou te transferir para um de nossos
         consultores que pode te ajudar melhor com isso.
         Um momento, por favor! 🙏
   [Notifica grupo de atendentes]
```

---

## 8. Workflow n8n — JSON para Importar

Salve o conteúdo abaixo como arquivo `.json` e importe no n8n via **Menu → Import from File**.

> **Antes de importar:** Substitua os valores marcados com `SUBSTITUIR_*` pelas suas credenciais reais.

```json
{
  "name": "WhatsApp Bot - Bolsa Click",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-bot",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook WhatsApp",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "respondWith": "noData",
        "options": {}
      },
      "id": "respond-webhook",
      "name": "Respond 200",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body || $input.first().json;\n\n// Filtrar apenas mensagens recebidas de texto\nif (body.event !== 'messages.upsert') return [];\n\nconst message = body.data;\nif (!message || message.key?.fromMe) return [];\n\nconst text = message.message?.conversation\n  || message.message?.extendedTextMessage?.text\n  || '';\n\nif (!text.trim()) return [];\n\nconst phone = message.key.remoteJid.replace('@s.whatsapp.net', '');\n\nreturn [{\n  json: {\n    phone,\n    text: text.trim(),\n    pushName: message.pushName || '',\n    remoteJid: message.key.remoteJid,\n    timestamp: new Date().toISOString()\n  }\n}];"
      },
      "id": "filter-messages",
      "name": "Filtrar e Extrair",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://www.bolsaclick.com.br/api/whatsapp/memory?phone={{ $json.phone }}",
        "options": {
          "timeout": 5000
        }
      },
      "id": "get-memory",
      "name": "Buscar Histórico",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [900, 300],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "jsCode": "const input = $input.first().json;\nconst prevNode = $('Filtrar e Extrair').first().json;\nconst memory = input.memory || { messages: [], stage: 'greeting', leadData: {} };\n\n// Formatar histórico para o Gemini (últimas 15 msgs)\nconst recent = (memory.messages || []).slice(-15);\nconst history = recent\n  .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)\n  .join('\\n');\n\nreturn [{\n  json: {\n    phone: prevNode.phone,\n    text: prevNode.text,\n    pushName: prevNode.pushName,\n    remoteJid: prevNode.remoteJid,\n    history,\n    stage: memory.stage || 'greeting',\n    leadData: memory.leadData || {},\n    userName: memory.name || prevNode.pushName || ''\n  }\n}];"
      },
      "id": "prepare-context",
      "name": "Preparar Contexto",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=SUBSTITUIR_GEMINI_API_KEY",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"contents\": [\n    {\n      \"role\": \"user\",\n      \"parts\": [{ \"text\": \"Você é a Ana, assistente virtual do Bolsa Click. Tom amigável e profissional. Use formatação WhatsApp (*negrito*, _itálico_). Mensagens curtas (máx 3 parágrafos). Sempre termine com pergunta ou CTA.\\n\\nSobre o Bolsa Click: plataforma de bolsas de estudo com até 80% OFF. Parceiras: Anhanguera, Unopar, Unime. Cursos de Graduação e Pós. Modalidades: EAD, Presencial, Semipresencial. Site: bolsaclick.com.br\\n\\nEstágio atual: {{ $json.stage }}\\nNome do usuário: {{ $json.userName }}\\nDados coletados: {{ JSON.stringify($json.leadData) }}\\n\\nHistórico:\\n{{ $json.history }}\\n\\nMensagem do usuário: {{ $json.text }}\\n\\nResponda em JSON com: intent (BUSCAR_CURSO, INFO_ACADEMICA, CAPTURAR_LEAD, CHECKOUT, TRANSFERIR_HUMANO, CONVERSA_GERAL), response (texto para enviar), courseQuery (se buscar curso), leadData (dados coletados), stage (greeting, browsing, interested, collecting_data, checkout, support, handoff)\" }]\n    }\n  ],\n  \"generationConfig\": {\n    \"temperature\": 0.7,\n    \"maxOutputTokens\": 1024,\n    \"responseMimeType\": \"application/json\"\n  }\n}",
        "options": {
          "timeout": 15000
        }
      },
      "id": "gemini-process",
      "name": "Gemini - Processar",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1340, 300]
    },
    {
      "parameters": {
        "jsCode": "const input = $input.first().json;\nconst prevData = $('Preparar Contexto').first().json;\n\n// Extrair resposta do Gemini\nlet aiResponse;\ntry {\n  const text = input.candidates?.[0]?.content?.parts?.[0]?.text || '{}';\n  aiResponse = JSON.parse(text);\n} catch (e) {\n  aiResponse = {\n    intent: 'CONVERSA_GERAL',\n    response: 'Desculpe, tive um probleminha. Pode repetir? 😊',\n    stage: prevData.stage\n  };\n}\n\nreturn [{\n  json: {\n    phone: prevData.phone,\n    remoteJid: prevData.remoteJid,\n    text: prevData.text,\n    intent: aiResponse.intent || 'CONVERSA_GERAL',\n    response: aiResponse.response || 'Como posso te ajudar?',\n    courseQuery: aiResponse.courseQuery || '',\n    leadData: { ...prevData.leadData, ...(aiResponse.leadData || {}) },\n    stage: aiResponse.stage || prevData.stage,\n    userName: prevData.userName\n  }\n}];"
      },
      "id": "parse-gemini",
      "name": "Parsear Resposta Gemini",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1560, 300]
    },
    {
      "parameters": {
        "rules": {
          "values": [
            { "outputIndex": 0, "value": "BUSCAR_CURSO" },
            { "outputIndex": 1, "value": "CAPTURAR_LEAD" },
            { "outputIndex": 2, "value": "TRANSFERIR_HUMANO" },
            { "outputIndex": 3, "value": "={{ $json.intent }}" }
          ]
        },
        "dataType": "string",
        "value1": "={{ $json.intent }}"
      },
      "id": "switch-intent",
      "name": "Switch Intenção",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [1780, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://www.bolsaclick.com.br/api/cursos?search={{ encodeURIComponent($json.courseQuery) }}&limit=5",
        "options": { "timeout": 10000 }
      },
      "id": "search-courses",
      "name": "Buscar Cursos API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2020, 100]
    },
    {
      "parameters": {
        "jsCode": "const courses = $input.first().json.courses || [];\nconst prevData = $('Parsear Resposta Gemini').first().json;\nlet finalResponse = prevData.response;\n\nif (courses.length > 0) {\n  const list = courses.map((c, i) =>\n    `*${i + 1}. ${c.fullName || c.name}*\\n` +\n    `   📚 ${c.type} | ${c.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós'}\\n` +\n    `   ⏱ Duração: ${c.duration || 'Consultar'}\\n` +\n    `   🔗 bolsaclick.com.br/cursos/${c.slug}`\n  ).join('\\n\\n');\n  finalResponse += `\\n\\n${list}\\n\\n💡 Quer saber valores e bolsas? Me diga qual te interessa!`;\n}\n\nreturn [{ json: { ...prevData, response: finalResponse } }];"
      },
      "id": "format-courses",
      "name": "Formatar Cursos",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2240, 100]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://www.bolsaclick.com.br/api/leads",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"name\": \"{{ $json.leadData.name || $json.userName || '' }}\",\n  \"email\": \"{{ $json.leadData.email || '' }}\",\n  \"phone\": \"{{ $json.phone }}\",\n  \"cpf\": \"{{ $json.leadData.cpf || '' }}\",\n  \"courseName\": \"{{ $json.leadData.courseInterest || '' }}\",\n  \"institutionName\": \"Anhanguera\",\n  \"courseNames\": [\"{{ $json.leadData.courseInterest || '' }}\"]\n}",
        "options": { "timeout": 10000 }
      },
      "id": "create-lead",
      "name": "Criar Lead",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2020, 300],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://evo.inovitdigital.com.br/message/sendText/SUBSTITUIR_INSTANCIA",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Content-Type", "value": "application/json" },
            { "name": "apikey", "value": "SUBSTITUIR_API_KEY_EVOLUTION" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"number\": \"{{ $json.phone }}\",\n  \"text\": \"🤖 *Transferindo para atendimento humano...*\\n\\nUm de nossos consultores vai continuar seu atendimento em breve.\\nHorário: Seg-Sex, 8h às 18h.\\n\\nEnquanto isso, explore nossas bolsas:\\n👉 https://www.bolsaclick.com.br/cursos\"\n}",
        "options": { "timeout": 10000 }
      },
      "id": "handoff-user",
      "name": "Msg Transferência",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2020, 500]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://evo.inovitdigital.com.br/message/sendText/SUBSTITUIR_INSTANCIA",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Content-Type", "value": "application/json" },
            { "name": "apikey", "value": "SUBSTITUIR_API_KEY_EVOLUTION" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"number\": \"{{ $json.phone }}\",\n  \"text\": \"{{ $json.response }}\"\n}",
        "options": { "timeout": 10000 }
      },
      "id": "send-response",
      "name": "Enviar Resposta WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2460, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://www.bolsaclick.com.br/api/whatsapp/memory",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"phone\": \"{{ $json.phone }}\",\n  \"data\": {\n    \"name\": \"{{ $json.userName }}\",\n    \"messages\": [],\n    \"stage\": \"{{ $json.stage }}\",\n    \"leadData\": {{ JSON.stringify($json.leadData) }},\n    \"lastInteraction\": \"{{ new Date().toISOString() }}\"\n  }\n}",
        "options": { "timeout": 5000 }
      },
      "id": "save-memory",
      "name": "Salvar Histórico",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2680, 300],
      "onError": "continueRegularOutput"
    }
  ],
  "connections": {
    "Webhook WhatsApp": {
      "main": [
        [
          { "node": "Respond 200", "type": "main", "index": 0 },
          { "node": "Filtrar e Extrair", "type": "main", "index": 0 }
        ]
      ]
    },
    "Filtrar e Extrair": {
      "main": [
        [{ "node": "Buscar Histórico", "type": "main", "index": 0 }]
      ]
    },
    "Buscar Histórico": {
      "main": [
        [{ "node": "Preparar Contexto", "type": "main", "index": 0 }]
      ]
    },
    "Preparar Contexto": {
      "main": [
        [{ "node": "Gemini - Processar", "type": "main", "index": 0 }]
      ]
    },
    "Gemini - Processar": {
      "main": [
        [{ "node": "Parsear Resposta Gemini", "type": "main", "index": 0 }]
      ]
    },
    "Parsear Resposta Gemini": {
      "main": [
        [{ "node": "Switch Intenção", "type": "main", "index": 0 }]
      ]
    },
    "Switch Intenção": {
      "main": [
        [{ "node": "Buscar Cursos API", "type": "main", "index": 0 }],
        [{ "node": "Criar Lead", "type": "main", "index": 0 }],
        [{ "node": "Msg Transferência", "type": "main", "index": 0 }],
        [{ "node": "Enviar Resposta WhatsApp", "type": "main", "index": 0 }]
      ]
    },
    "Buscar Cursos API": {
      "main": [
        [{ "node": "Formatar Cursos", "type": "main", "index": 0 }]
      ]
    },
    "Formatar Cursos": {
      "main": [
        [{ "node": "Enviar Resposta WhatsApp", "type": "main", "index": 0 }]
      ]
    },
    "Criar Lead": {
      "main": [
        [{ "node": "Enviar Resposta WhatsApp", "type": "main", "index": 0 }]
      ]
    },
    "Enviar Resposta WhatsApp": {
      "main": [
        [{ "node": "Salvar Histórico", "type": "main", "index": 0 }]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

---

## 9. Checklist de Implantação

### Credenciais para substituir no workflow:

| Placeholder                      | Onde encontrar                                  |
| -------------------------------- | ----------------------------------------------- |
| `SUBSTITUIR_GEMINI_API_KEY`      | Google AI Studio → API Keys                     |
| `SUBSTITUIR_INSTANCIA`           | Nome da instância na Evolution API              |
| `SUBSTITUIR_API_KEY_EVOLUTION`   | API Key da Evolution API                        |

### Passos:

- [ ] 1. Criar model `WhatsappMemory` no Prisma e rodar `prisma db push`
- [ ] 2. Criar endpoint `/api/whatsapp/memory` no Bolsa Click
- [ ] 3. Importar o workflow JSON no n8n
- [ ] 4. Substituir as 3 credenciais no workflow
- [ ] 5. Configurar webhook na Evolution API apontando para `https://n8n.inovitdigital.com.br/webhook/whatsapp-bot`
- [ ] 6. Ativar o workflow no n8n
- [ ] 7. Testar enviando "Oi" para o número do WhatsApp
- [ ] 8. Verificar logs no n8n para ajustar o system prompt

### Melhorias futuras:
- [ ] Rate limiting (máx. 30 msgs/min por número)
- [ ] Horário de atendimento automático (fora do horário → msg padrão)
- [ ] Envio de imagens/PDFs (boletos, comprovantes)
- [ ] Dashboard de métricas (msgs/dia, leads capturados, taxa de conversão)
- [ ] Integração com CRM
- [ ] Filas de atendimento humano com prioridade
