/**
 * Sugestão de correção de domínio de e-mail — SUGERE, nunca bloqueia.
 *
 * Cobre os erros de digitação mais comuns em domínios populares no Brasil
 * (Gmail, Hotmail/Outlook, Yahoo, BOL, UOL...). Roda no client (sem custo de
 * rede) para dar feedback imediato: "Você quis dizer joao@gmail.com?",
 * clicável para corrigir com um toque — a pessoa sempre pode ignorar, porque
 * o domínio parecido pode ser legítimo (empresa própria, provedor regional).
 *
 * Isto é DIFERENTE da checagem de MX (`email-mx.ts`, servidor): aqui é
 * heurística de digitação; lá é prova de que o domínio recebe e-mail.
 */

/** Domínios populares no Brasil — contra esta lista o fallback por distância roda. */
const DOMINIOS_POPULARES = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'outlook.com.br',
  'yahoo.com',
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'icloud.com',
  'live.com',
  'msn.com',
  'globo.com',
  'ig.com.br',
] as const

/**
 * Typos exatos → domínio correto. Mapeados a partir dos erros mais comuns
 * (tecla vizinha, letra faltando, TLD errado, ".br" esquecido). Tem
 * prioridade sobre o fallback por distância de edição, porque é exato.
 */
const TYPOS_CONHECIDOS: Record<string, string> = {
  // Gmail
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.copm': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  // Hotmail
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmall.com': 'hotmail.com',
  'hormail.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  // Outlook
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlok.com.br': 'outlook.com.br',
  'outloo.com': 'outlook.com',
  // Yahoo
  'yaho.com': 'yahoo.com',
  'yaho.com.br': 'yahoo.com.br',
  'yahoo.con': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'iahoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  // UOL / BOL — portais brasileiros; erro mais comum é esquecer o ".br"
  'uol.com': 'uol.com.br',
  'bol.com': 'bol.com.br',
  'uol.com.b': 'uol.com.br',
  'bol.com.b': 'bol.com.br',
  // iCloud
  'icloud.con': 'icloud.com',
  'icloud.co': 'icloud.com',
  'iclould.com': 'icloud.com',
  // Terra
  'terra.com': 'terra.com.br',
}

/** Distância de Levenshtein simples — clareza importa mais que velocidade aqui. */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prevDiag = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prevDiag : 1 + Math.min(prevDiag, dp[j], dp[j - 1])
      prevDiag = temp
    }
  }
  return dp[n]
}

/**
 * Sugere a correção do domínio para um e-mail digitado, ou `null` quando não
 * há nada a sugerir (formato inválido, domínio já é popular, ou não há
 * candidato próximo o bastante para justificar o palpite).
 *
 * Retorna o e-mail completo já corrigido — pronto para preencher o campo com
 * um clique.
 */
export function suggestEmailCorrection(email: string): string | null {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0 || at === trimmed.length - 1) return null

  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1).toLowerCase()
  if (!domain) return null

  // Já é um domínio popular — nada a corrigir.
  if ((DOMINIOS_POPULARES as readonly string[]).includes(domain)) return null

  const conhecido = TYPOS_CONHECIDOS[domain]
  if (conhecido) return `${local}@${conhecido}`

  // Fallback: distância de edição 1 contra a lista de domínios populares.
  // Threshold conservador de propósito — evita sugerir domínio errado pra
  // quem usa provedor próprio/corporativo que por coincidência é parecido.
  let melhor: string | null = null
  let melhorDist = Infinity
  let empatou = false
  for (const candidato of DOMINIOS_POPULARES) {
    const dist = levenshtein(domain, candidato)
    if (dist < melhorDist) {
      melhorDist = dist
      melhor = candidato
      empatou = false
    } else if (dist === melhorDist) {
      empatou = true
    }
  }

  if (melhor && melhorDist === 1 && !empatou) return `${local}@${melhor}`
  return null
}
