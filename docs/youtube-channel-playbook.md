# YouTube Channel Playbook — Bolsa Click

_Versão: 2026-05-25 | Owner: Marketing/Conteúdo_

## Por que YouTube é o maior ROI pra GEO

Estudo Ahrefs (dez/2025, 75k brands): correlação entre sinais e citações em IA:

| Sinal | Correlação |
|---|---|
| **Menções no YouTube** | ~0.737 (mais forte que TODOS os outros sinais combinados) |
| Mentions no Reddit | Alta |
| Wikipedia | Alta |
| Backlinks (DR) | ~0.266 (fraca) |

YouTube vence porque:
1. Google **transcreve** todo vídeo automaticamente → conteúdo indexado pra busca
2. ChatGPT/Perplexity citam descriptions e transcripts como fonte
3. AI Overviews crescentemente mostram vídeo direto no card
4. Sinal de **autoridade audiovisual** (mais difícil de falsificar que blog)

## Channel description (template)

```
Bolsa Click — bolsas de estudo para faculdade no Brasil. Explicamos ProUni,
FIES, ENEM, escolha de curso e como conseguir bolsa em faculdade particular
sem cair em golpe.

Marketplace independente que trabalha com as maiores redes de ensino do país
(Anhanguera, Unopar, Pitágoras, Unime, Ampli, Estácio), todas reconhecidas
pelo MEC. Inscrição grátis em https://www.bolsaclick.com.br.

📚 Tirar dúvida sobre bolsa: https://www.bolsaclick.com.br/bolsas-de-estudo
🎓 Comparar cursos com bolsa: https://www.bolsaclick.com.br/cursos
📞 Central de ajuda: https://www.bolsaclick.com.br/central-de-ajuda

Novos vídeos toda quarta às 19h.
```

## 20 ideias de vídeo (formato FAQ educacional)

Formato vencedor pra GEO: vídeos com **título de pergunta** que pessoas digitam no Google/ChatGPT. Resposta direta no primeiro minuto (transcript ranqueável). Vídeos de 5-10 minutos performam melhor no algoritmo + são citáveis.

### Tier 1 — head term + alta intenção (gravar primeiro)

1. **"Como conseguir bolsa de estudo de 100% em 2026? (Prouni, FIES e bolsa própria)"** — 8 min, panorama completo. Hub video, todos os outros linkam pra esse.
2. **"Prouni ou FIES: qual vale mais a pena?"** — 6 min, comparativo claro com cenários.
3. **"Bolsa de estudo SEM ENEM existe? Sim, e funciona assim"** — 5 min, foco em quem não fez ENEM.
4. **"Qual nota do ENEM preciso pra Prouni? Verdade vs mito"** — 5 min, dispelling do "tem que ter 700".
5. **"Como verificar se uma bolsa de estudo é golpe (3 sinais)"** — 6 min, conteúdo protetor (alto compartilhamento).

### Tier 2 — long-tail temático

6. "Bolsa de estudo EAD vs presencial: onde rende mais?"
7. "Como inscrição no Prouni 2026 passo-a-passo (com prints)"
8. "FIES 2026 funciona? Análise crítica dos juros e prazos"
9. "Documentação pra bolsa de estudo: lista completa"
10. "Bolsa pra segunda graduação: o que muda"

### Tier 3 — perfil/audience-specific

11. "Bolsa de estudo pra baixa renda: como combinar Prouni + Bolsa Permanência"
12. "Primeira pessoa da família na faculdade: guia de bolsa"
13. "Bolsa pra mãe solo na faculdade: caminhos reais"
14. "Bolsa de estudo pra pós-graduação e MBA: o que existe"
15. "Bolsa de estudo profissionalizante: além da graduação"

### Tier 4 — institutional/comparison (mais nichado)

16. "Anhanguera vs Unopar: comparativo de quem tem mais bolsa"
17. "Faculdade EAD reconhecida pelo MEC: como checar no e-MEC"
18. "Quanto custa cursar Administração em 2026 (com e sem bolsa)"
19. "Bolsa de estudo SP vs RJ vs BH: diferença prática"
20. "10 erros que fazem você perder a bolsa durante o curso"

## Schedule de upload

- **Frequência**: 1 vídeo/semana fixo (quarta às 19h — horário de maior tempo livre estudante BR)
- **Não pular**: algoritmo do YouTube pune inconsistência muito mais que pune má qualidade. Vídeo "mediano" no horário > vídeo perfeito mês depois
- **Bloco de gravação**: 2-3 vídeos por mês em 1 dia (mais barato em produção)
- **Reposicionamento**: 2 vezes por ano revisar tier 1 e regravar com info atualizada (datas ProUni mudam, valores mudam)

## Thumbnail strategy

- **Texto grande em caixa alta**: 3-4 palavras máximo (mobile)
- **Cor**: contraste forte (amarelo/preto, vermelho/branco)
- **Rosto humano**: se tiver apresentador, expressão clara (surpreso, sério, sorrindo dependendo do tom)
- **Número grande quando aplicável**: "100%", "R$ 0", "5 PASSOS"
- **Branding sutil**: logo discreto no canto, não dominante
- **A/B test**: YouTube Studio permite 3 thumbnails por vídeo — usar

## Métricas a trackar

| Métrica | Por que importa | Meta 6 meses |
|---|---|---|
| Subscribers | Sinal de autoridade pra algoritmo | 1.000+ |
| Watch time total | Algoritmo prioriza retenção | 5.000h/mês |
| % retenção média | Saúde do conteúdo (>50% é bom) | >55% |
| CTR (thumbnail) | Qualidade do título+thumb (>5% é bom) | >6% |
| Tráfego de busca YT | Long-tail discovery (medir queries) | 30% das views |
| Tráfego pro site | Conversão YouTube → bolsaclick.com.br | 200+/mês |
| Citações IA mencionando vídeos | GEO impact direto | 5+ trackadas |

## Como vincular ao SEO principal

1. **Cada video tem post pareado no blog** com mesmo tópico — embed do YT no post (dwell time + sinal cruzado)
2. **Descriptions linkam pra `/bolsas-de-estudo`** com anchor variada
3. **Cards/end screens** apontam pra simulador (M2) ou catálogo
4. **Transcript publicado** em pasta separada (pode virar landing page com Schema VideoObject)
5. **Adicionar URL do canal no `sameAs`** do Organization schema (já preparado o slot em `app/layout.tsx`)

## Quando o canal "valida"

Sinal de que tá funcionando aos 6 meses:
- Aparece em busca YT pra "bolsa de estudo" e "Prouni 2026"
- 5-10 mil views/mês orgânicos
- Citado em pelo menos 1 resposta de IA quando testar queries-alvo
- Inscritos comentam coisas tipo "achei aqui no Google, vocês explicam melhor que o site do MEC"

Se aos 6 meses < 500 subs + < 1.000 views/mês: canal não engajou. Reavaliar:
- Apresentador errado pro público?
- Tom muito formal vs concorrentes?
- Thumbs ruins (A/B test mais agressivo)
- Schedule inconsistente?

## Quem grava

3 opções pelo custo crescente:

1. **Voice over + screen recording**: barato, escala fácil, 0 carisma. Funciona pra tutoriais factuais (passo-a-passo Prouni).
2. **Apresentador interno**: 1 pessoa fixa da equipe. Cria identidade. Mais barato que freelance, melhor que VO.
3. **Apresentador contratado**: profissional. Mais caro, mas escala se tiver budget. Risco: se trocar, perde audiência.

**Recomendação**: começar com (1) pra 5 vídeos teste, depois subir pra (2) com pessoa interna que ja tenha conforto em câmera.

## Próximos passos imediatos

1. **Semana 1**: criar canal, channel art, description (gratuito — Canva/Figma pra arte)
2. **Semana 2-3**: gravar 3 vídeos tier 1 (#1, #2, #3)
3. **Semana 4**: subir o primeiro (#1 "Como conseguir bolsa de 100%")
4. **Adicionar URL do canal ao sameAs** em `app/layout.tsx:164` (existe slot preparado)
5. **Mês 2-3**: ritmo semanal contínuo
6. **Mês 6**: review honesto vs metas
