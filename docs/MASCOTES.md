# Mascotes do Bolsa Click — guia de uso obrigatório

O mascote oficial do Bolsa Click é o **Bob** — a capivara estudante (claymation 3D, moletom navy, mochila vermelha). Set ativo: **biblioteca de 40 poses PNG com fundo transparente** em `public/assets/mascote/3d/bob-*.png`, recortada da Biblioteca Oficial (packs SVG `bob_biblioteca_20_poses` + `21_a_30` + `31_a_40`, 2026-07-15) com o pipeline `scripts/mascote-cutout.py` (fundo removido, labels/badges da folha eliminados, sombra translúcida preservada). O set flat do livrinho (12 SVGs em `public/assets/mascote/mascote-*.svg`) fica arquivado como identidade alternativa.

**Regra: toda nova superfície de UI com espaço para ilustração deve usar o mascote — não usar ilustrações genéricas.** Componente oficial: `app/components/v2/mascot/Mascot.tsx` (tipado por pose) e `MascotPop.tsx`/`ReactiveCta` (peek atrás de botões e feedback de clique).

## Poses e quando usar cada uma

**Postura & saudação**: `em-pe` (neutra/fallback) · `acenando` (hero, boas-vindas) · `joinha` (aprovação, confirmações) · `bracos-cruzados` (confiança, garantias) · `maos-na-cintura` (institucional) · `pulando` (conquistas) · `correndo` (agilidade, "em minutos") · `andando` (jornada) · `apontando` (direcionar atenção a CTA/card)

**Estudo & conteúdo**: `sentado-lendo`/`lendo` (blog, guias) · `escrevendo` (formulários) · `prova` (ENEM/vestibular) · `notebook`/`tablet`/`celular` (EAD, multiplataforma) · `biblioteca` (acervo, cursos) · `professor`/`explicando` (tutoriais, como funciona) · `pesquisando` (busca)

**Emoções & momentos**: `cafe` (rotina, onboarding) · `metas` (planejamento, simulador) · `ideia` (dicas, FAQ) · `pensando`/`confuso` (dúvidas, loading) · `surpreso` (empty states, 404) · `comemorando` (sucesso, peek do ReactiveCta) · `dancando` (social, comemorações) · `dormindo` (boa noite, e-mails)

**Tecnologia**: `headset-notebook`/`headset` (atendimento, suporte) · `notebook-casual`/`digitando` (área do aluno) · `gamer`/`programando` (cursos de TI) · `ia` (teste vocacional com IA, recursos de IA) · `chat` (WhatsApp, chatbot) · `smartphone`/`smartwatch`/`tablet-sofa` (mobile, notificações)

## Regras de aplicação

1. **Não distorcer** — proporção preservada; respiro mínimo de ~10% ao redor.
2. **Um mascote por viewport/dobra** — é acento, não papel de parede.
3. **Tamanho**: 64–96px em componentes, 120–200px em seções, máx. 240px.
4. **Peek de botão** (`ReactiveCta`): todo CTA primary tem a capivara comemorando espiando por trás no hover/foco — ≤240ms, decorativa, respeita `prefers-reduced-motion` (não aparece).
5. **Acessibilidade**: `alt=""` quando decorativo ao lado de texto; alt descritivo quando for o único conteúdo visual.
6. **Poses novas**: gerar a partir da folha de referência original mantendo personagem, roupa navy e a marca "+" no peito; recortar com o pipeline de componentes conexos (ver scripts da sessão 2026-07-15) para preservar sombras translúcidas.

## Bob por profissão (área de curso)

Set gerado 2026-07-16 na conversa oficial "Bob o Mascote" (ChatGPT, projeto Bolsa Click) com transparência nativa. Mapa área→pose para páginas de curso, hubs e chips de categoria:

| Asset | Área/cursos |
|---|---|
| `bob-medico` | Medicina, biomedicina, saúde em geral |
| `bob-enfermeiro` | Enfermagem, técnico de enfermagem |
| `bob-advogado` | Direito |
| `bob-engenheiro` | Engenharias, arquitetura |
| `bob-psicologo` | Psicologia |
| `bob-pedagogo` | Pedagogia, licenciaturas |
| `bob-dentista` | Odontologia |
| `bob-chef` | Gastronomia, nutrição |

Para novas áreas: gerar na MESMA conversa "Bob o Mascote" pedindo fundo transparente e sem textos; baixar e fatiar com o pipeline de componentes conexos.

## Bob Mago (atendente mágico — FAQ e chat)

Set gerado 2026-07-16 na mesma conversa "Bob o Mascote" (chapéu pontudo de mago azul-marinho com estrelas douradas + varinha mágica). Uso: o assistente `BobWizard` do FAQ (estilo assistente clássico do Office) e superfícies de ajuda/chat.

| Asset | Quando usar |
|---|---|
| `bob-mago-acenando` | Idle do atendente, boas-vindas |
| `bob-mago-apontando` | Direcionar pra uma resposta/CTA |
| `bob-mago-magia` | Reação "lançando magia" (pergunta aberta, sucesso) |
| `bob-mago-lendo` | Consultando o "livro de magias" (loading, busca) |
