# CourseCard Redesign v2 — A/B Test Guide

## 📋 O que foi implementado

### **Dados MEC agregados à Course**
- `mecScore?: number` — Avaliação do MEC (0-5)
- `enrolledCount?: number` — Quantidade de alunos inscritos
- `discount?: number` — Desconto em %
- `discountExpires?: string` — Data de expiração do desconto
- `availableSpots?: number | null` — Vagas disponíveis

### **Novo Design CourseCard (Redesign.tsx)**

**Melhorias de conversão:**
1. ✅ **Avaliação MEC real** em destaque (social proof)
2. ✅ **Social proof** — "+X alunos inscritos"
3. ✅ **Preço em DESTAQUE** — fonte 4xl, cor verde
4. ✅ **Urgência** — badges para desconto 50%+ e vagas limitadas
5. ✅ **CTA bold** — "🔒 Garantir Bolsa" (em vez de "Inscreva-se")
6. ✅ **Economia visível** — mostra quanto economiza se tem desconto
7. ✅ **Design refinado** — sombras, animations hover, spacing

### **A/B Test via PostHog**

Feature flag: `course_card_redesign_v2`

- **Controle (A):** Design original (CourseCardOriginal)
- **Teste (B):** Design novo (CourseCardRedesign)
- **Rastreamento:** Events incluem `design_version: 'redesign_v2'`

---

## 🚀 Como ativar o A/B test

### **1. No PostHog**

```
Dashboards → Feature Flags → + Create Feature Flag

Name: course_card_redesign_v2
Key: course_card_redesign_v2
Type: Boolean
```

**Opção A: 50/50 split**
```
Release conditions:
- Percentage rollout: 50% of users
```

**Opção B: Whitelist específica**
```
Release conditions:
- Specific persons or groups
- Add your email/ID
```

### **2. Validar no código**

```bash
# Verificar que feature flag é consultada
grep -r "course_card_redesign_v2" app/

# Esperado:
# - app/components/CourseCardNew/index.tsx
#   useFeatureFlags() lê 'course_card_redesign_v2'
```

### **3. Testar localmente**

```bash
npm run dev
# Abrir DevTools → Console
# PostHog mostra: "🔍 PostHog Feature Flag 'course_card_redesign_v2': <true|false>"
```

---

## 📊 O que rastrear no PostHog

### **Events com design_version**
Todos os eventos agora incluem:
```javascript
{
  design_version: 'redesign_v2'  // ou não incluem se design original
}
```

**Events importantes:**
1. `course_selected` — usuário clicou no CTA
2. `course_card_click_blocked` — shift não selecionado
3. `course_favorited` / `course_unfavorited` — favoritos
4. `course_shift_selected` — turno selecionado

### **Dashboard de A/B test**

1. Criar **Funnel**
   - Course viewed → course_selected
   - Breakdown by: design_version
   - Compare A vs B conversion rate

2. Criar **Trends**
   - Event: course_selected
   - Breakdown by: design_version
   - Ver volume absoluto

3. **Expected improvement:**
   - Design original: ~32% conversion (29 de 89 que buscam)
   - Design novo (esperado): +15-25% conversion (mais preço/urgência visível)

---

## 🎨 Detalhes do novo design

### **Visual hierarchy**
1. **Logo faculdade** (pequeno, contexto)
2. **Nome curso** (grande, 18px bold)
3. **Avaliação + inscritos** (social proof, destaque)
4. **Info auxiliar** (modalidade, duração, cidade)
5. **PREÇO** (4xl, verde, DESTAQUE)
6. **CTA** (bold, gradient, hover effect)

### **Badges de urgência**
- 🔥 **50%+ desconto** → Red badge com Zap icon
- ⚠️ **<10 vagas** → Amber badge com count

### **Economia visível**
Se `discount > 0`:
```
R$ 1.200,00 ↖️ Preço original
R$ 240,00 ✓ Economiza
```

### **CTA principal**
```
🔒 Garantir Bolsa
```
(em vez de genérico "Inscreva-se")

---

## 🔄 Próximos passos (após validar)

1. **Se conversion + 20%:** Converter design_v2 pra padrão
2. **Se conversion < 10%:** Iterar design (ajustar cores, copy, etc)
3. **Adicionar dados reais:** Puxar MEC scores, enrolledCount do backend
4. **Testar mobile:** Design é responsive? Badges funcionam em mobile?

---

## 🐛 Troubleshooting

**Feature flag não aparece?**
- Verificar console: "PostHog Feature Flag 'course_card_redesign_v2': false"
- Se undefined, aguardar PostHog carregar (~3s)

**Design não muda?**
- Hard refresh: Cmd+Shift+R (Mac) ou Ctrl+Shift+F5 (Windows)
- Verificar que `useFeatureFlags()` está retornando valor correto

**Dados MEC sempre null?**
- `mecScore`, `enrolledCount` etc. precisam vir do backend
- Por enquanto usar valores mockados pra testar design

---

## 📝 Checklist

- [ ] Ativar feature flag no PostHog
- [ ] Validar design visualmente em navegador
- [ ] Criar dashboard de A/B no PostHog
- [ ] Rastrear por 2-4 semanas
- [ ] Analisar resultados (conversion, click-through, etc)
- [ ] Decidir: rollout 100%, iterar, ou desativar
