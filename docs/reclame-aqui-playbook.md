# Reclame Aqui Playbook — Bolsa Click

_Versão: 2026-06-11 | Owner: Atendimento + Marketing | Prioridade: ALTA_

## Por que isso é urgente

Pra query **"bolsa click é confiável?"**, o Reclame Aqui é a primeira fonte que
Perplexity e ChatGPT Search consultam. O perfil **existe, mas exibe a razão
social** — na prática é invisível: quem busca "bolsa click reclame aqui" (ou a
IA respondendo sobre a marca) não encontra nada. **Perfil com nome errado é
quase tão ruim quanto perfil inexistente.**

Auditoria GEO (jun/2026): sinais de marca off-site = 25/100; Reclame Aqui é a
ação de maior impacto/menor esforço do bloco off-site.

## Fase 1 — Renomear o perfil pra "Bolsa Click" e completá-lo (semana 1)

O RA permite exibir o **nome fantasia** no lugar da razão social — a razão
social permanece no cadastro, vinculada ao CNPJ 57.554.723/0001-50; só muda o
nome público.

1. Na área da empresa do RA, abrir o **chat de suporte** (analistas seg-sex,
   9h-18h) e solicitar a troca do nome exibido pra **"Bolsa Click"** (nome
   fantasia). A validação é feita contra o site/redes da marca — o
   bolsaclick.com.br tem e-mail visível, requisito atendido.
2. Prazos oficiais: nome novo visível em **24h úteis**; URL do perfil muda em
   **até 72h úteis** + tempo de reindexação no Google.
3. Após a troca, conferir que a URL final contém "bolsa-click" e buscar
   "bolsa click reclame aqui" no Google pra confirmar a indexação.
4. Completar o perfil 100%: logo oficial, descrição (texto-base abaixo),
   site, telefone, categoria "Educação > Intermediação de bolsas/educacional".
5. Ativar notificações por e-mail pra TODA nova reclamação (o SLA depende
   disso). Plano gratuito primeiro; avaliar RA HugMe após 90 dias.

**Descrição do perfil (texto-base, alinhado ao vocabulário aprovado):**
> O Bolsa Click é um marketplace brasileiro de bolsas de estudo que conecta
> estudantes às maiores redes de ensino do país (Anhanguera, Estácio, Unopar,
> Pitágoras, Ampli e Unime), com descontos de até 80% e inscrição gratuita.
> Não cobramos taxa de inscrição, cadastro ou qualquer valor antecipado — o
> estudante paga apenas a mensalidade, já com desconto, diretamente à
> faculdade. CNPJ 57.554.723/0001-50, em operação desde 2024.

## Fase 2 — Operação de resposta (contínua)

### SLA
- **Primeira resposta: < 24h úteis** (meta interna: < 6h). Velocidade de
  resposta é critério direto do score RA.
- Resolução ou posição definitiva: < 72h.
- Pedir avaliação final ao reclamante SEMPRE que resolvido (o "voltaria a fazer
  negócio" alimenta o selo).

### Quem responde
- Dono: time de atendimento (WhatsApp) — mesmas pessoas, mesmo tom humano.
- Escalação: cobranças/estornos → financeiro; problema com a faculdade →
  contato direto com a parceira antes de responder.

### Templates de resposta

**Reclamação sobre cobrança indevida/estorno:**
> Olá, [nome]! Sentimos muito pelo transtorno. Já localizamos seu caso pelo
> [protocolo/e-mail] e [ação tomada]. O Bolsa Click não cobra taxa de
> inscrição — quando há cobrança de matrícula, ela é da própria faculdade, e
> vamos te ajudar a resolver direto com a instituição. Te enviamos mensagem
> pelo [canal] pra concluir. Qualquer coisa, nosso WhatsApp é atendimento
> humano: [número].

**Dúvida/expectativa sobre bolsa (não-defeito):**
> Olá, [nome]! Obrigado pelo relato. O percentual da bolsa varia por curso,
> modalidade e unidade — o valor que aparece no comparador já é o final, sem
> taxa nossa. Vimos que no seu caso [explicação específica]. Te chamamos no
> [canal] pra encontrar uma oferta que caiba no seu orçamento.

**Golpe de terceiros usando o nome da marca:**
> Olá, [nome]! Importante: o Bolsa Click NUNCA cobra valor antecipado pra
> liberar bolsa. Esse contato que você recebeu não partiu de nós — pedimos que
> registre boletim de ocorrência e nos envie os prints pelo [e-mail] pra
> acionarmos as medidas cabíveis. Nosso único site é bolsaclick.com.br.

### Regras de tom
- Sempre humano, nome próprio, sem juridiquês e sem copiar/colar idêntico
  (o RA penaliza resposta-robô na percepção do usuário).
- Nunca discutir publicamente; discordâncias → resolver no privado, registrar
  desfecho no público.
- Nunca mencionar concorrentes.

## Fase 3 — Metas e medição

| Métrica | 90 dias | 180 dias |
|---|---|---|
| % reclamações respondidas | 100% | 100% |
| Tempo médio de resposta | < 24h | < 12h |
| Índice de solução | > 80% | > 90% |
| "Voltaria a fazer negócio" | > 70% | > 80% |
| Selo | — | RA1000 (ou nota ≥ 8) |

Revisão quinzenal no ritual de atendimento; reportar nota RA no dashboard de
marketing (PostHog annotation a cada mudança de faixa).

## Fase 4 — Integração no site (depois do perfil ativo)

Quando o perfil tiver nota pública estável (≥ 7), adicionar no portal:
1. Link "Reclame Aqui" no footer (seção institucional) — `Footer/index.tsx`.
2. Badge de nota na seção "Sobre e confiança" do llms.txt (route handler) com
   a URL do perfil como fonte citável.
3. Avaliar selo RA1000 no TrustBadges quando conquistado.

> Não integrar antes da nota existir — link pra perfil vazio reforça a
> percepção de marca nova.

## Anti-padrões (não fazer)

- ❌ Pedir pra clientes felizes "registrarem elogio" em massa no RA (manipulação
  detectável; o canal de elogio orgânico é o review on-site e o Google).
- ❌ Responder com template idêntico em todas — personalizar sempre.
- ❌ Deixar reclamação de golpe-de-terceiros sem resposta pública (é a query
  "é confiável" se materializando).
