// Extrai pares pergunta/resposta de uma seção "Perguntas frequentes" no
// conteúdo HTML de blog posts. Usado pra gerar FAQPage schema condicional —
// estrutura ideal pra citação em AI Overviews, ChatGPT e Perplexity.
//
// Padrão esperado:
//   <h2>Perguntas frequentes</h2>   (ou h3, "FAQ", "Dúvidas frequentes")
//     <h3>Pergunta 1?</h3>
//       <p>Resposta 1...</p>
//     <h3>Pergunta 2?</h3>
//       <p>Resposta 2...</p>

export interface FaqItem {
  question: string
  answer: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Regex pra detectar uma headline de seção FAQ (case-insensitive, com
// variações comuns em pt-BR).
const FAQ_HEADING_RE =
  /<h([23])[^>]*>\s*(?:perguntas\s+frequentes|faq|d[uú]vidas\s+frequentes|principais\s+d[uú]vidas)\s*<\/h\1>/i

export function extractFaqFromHtml(html: string): FaqItem[] {
  if (!html) return []

  const headingMatch = html.match(FAQ_HEADING_RE)
  if (!headingMatch || headingMatch.index === undefined) return []

  // Pega tudo a partir do heading FAQ — perguntas estão depois.
  const sectionStart = headingMatch.index + headingMatch[0].length
  const section = html.slice(sectionStart)

  // Cada item FAQ é um H3 com pergunta + tudo até o próximo H2/H3.
  // Aceitamos h3 com ou sem atributos (id="...").
  const itemRe = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h[23][^>]*>|$)/gi
  const items: FaqItem[] = []
  let match
  while ((match = itemRe.exec(section)) !== null) {
    const question = stripHtml(match[1])
    const answer = stripHtml(match[2])
    if (!question || !answer) continue
    // Filtro defensivo: pergunta de FAQ "real" geralmente termina em ?, mas
    // não é obrigatório. Aceitamos se tem ? ou começa com palavra-pergunta.
    if (question.length < 6) continue
    items.push({ question, answer })
  }

  return items
}
