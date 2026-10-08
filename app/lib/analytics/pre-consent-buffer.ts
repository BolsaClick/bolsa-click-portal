'use client'

/**
 * Fila em MEMÓRIA dos eventos disparados antes do PostHog existir.
 *
 * Por que precisa existir: o PostHog só inicializa depois do consent de
 * analytics (ver PostHogProvider). Mas a primeira etapa do funil —
 * `checkout_viewed` — dispara no mount do checkout, ou seja, ANTES de a pessoa
 * ter decidido qualquer coisa. Sem fila, quem aceita o banner já entra no
 * PostHog sem o topo do próprio funil: a conversão aparece sem denominador e
 * o funil de checkout fica impossível de ler.
 *
 * O que isto NÃO é: não é consent implícito. Nada sai do device enquanto não
 * houver aceite — a fila vive só em memória (nunca cookie, nunca
 * localStorage/sessionStorage, nunca request), e é DESCARTADA se a pessoa
 * recusar. Só o aceite explícito libera o flush.
 *
 * O timestamp original de cada operação é preservado (`ts`) e repassado ao
 * PostHog no flush — sem isso todos os eventos represados chegariam colados no
 * instante do aceite e a ordem do funil se perderia.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NÃO APAGUE ISTO ACHANDO QUE É REDUNDANTE. Leia antes.
 *
 * Até 2026-10-08 este arquivo PARECIA inútil, e por um motivo traiçoeiro: havia
 * um bug de remount no PostHogProvider (a árvore trocava de forma quando o
 * consent chegava). O remount mascarava a perda de eventos, porque remontar
 * re-disparava os efeitos e os eventos apareciam por acidente. Com o remount
 * fechado, os efeitos NÃO re-disparam e o buffer deixa de ser cinto de
 * segurança e vira a ÚNICA coisa que salva o `checkout_viewed`. Ou seja: o fix
 * do remount sozinho nos faria PERDER o topo do funil.
 *
 * Então: quem remover este buffer não vai ver nada quebrar em teste manual —
 * vai ver o funil de checkout perder o próprio denominador em produção, em
 * silêncio, que é o pior tipo de regressão. O sinal de que ele está vivo e
 * funcionando é o evento `preconsent_buffer_flushed` no PostHog.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Props = Record<string, string | number | boolean | null | undefined>

type BufferedOp =
  | { kind: 'capture'; ts: Date; event: string; properties?: Props }
  | { kind: 'identify'; ts: Date; distinctId: string; properties?: Props }
  | { kind: 'person'; ts: Date; properties: Props }

/**
 * Teto da fila. Uma sessão longa sem decisão de consent não pode virar
 * vazamento de memória; 50 operações cobrem com folga o caminho
 * busca → checkout → envio, que é o que interessa medir.
 */
const MAX_BUFFERED_OPS = 50

let buffer: BufferedOp[] = []
let droppedCount = 0

/**
 * `Omit` normal aplicado direto numa union discriminada colapsa para as chaves
 * COMUNS a todos os membros — `event` e `distinctId` sumiriam do tipo e os
 * chamadores passariam a compilar errado. O `T extends unknown` força a
 * distribuição membro a membro, preservando cada variante.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** Operação como o chamador a escreve: sem `ts` (preenchido aqui). */
export type BufferedOpInput = DistributiveOmit<BufferedOp, 'ts'> & { ts?: Date }

/** Enfileira uma operação. Silenciosamente ignora depois do teto. */
export function bufferPostHogOp(op: BufferedOpInput): void {
  if (buffer.length >= MAX_BUFFERED_OPS) {
    droppedCount++
    return
  }
  buffer.push({ ...op, ts: op.ts ?? new Date() } as BufferedOp)
}

type PostHogLike = {
  capture: (event: string, properties?: Props, options?: { timestamp?: Date }) => void
  identify: (distinctId: string, properties?: Props) => void
  setPersonProperties: (properties: Props) => void
}

/**
 * Reproduz, em ordem, tudo que ficou represado. Chamado pelo PostHogProvider
 * logo após o init — isto é, só depois do aceite.
 *
 * Telemetria nunca pode derrubar a página: qualquer falha aqui é engolida, e a
 * fila é limpa de todo jeito para não repetir no próximo flush.
 */
export function flushPostHogBuffer(posthog: PostHogLike): number {
  const pending = buffer
  buffer = []
  const dropped = droppedCount
  droppedCount = 0

  let sent = 0
  for (const op of pending) {
    try {
      if (op.kind === 'capture') {
        posthog.capture(op.event, op.properties, { timestamp: op.ts })
      } else if (op.kind === 'identify') {
        posthog.identify(op.distinctId, op.properties)
      } else {
        posthog.setPersonProperties(op.properties)
      }
      sent++
    } catch {
      // Um evento ruim não pode impedir os outros de subir.
    }
  }

  if (sent > 0) {
    try {
      // Marca a sessão que passou pela fila: sem isto não dá para distinguir,
      // no PostHog, um funil medido do início de um que só começou a ser
      // medido no aceite.
      posthog.capture('preconsent_buffer_flushed', {
        buffered_ops: sent,
        dropped_ops: dropped,
      })
    } catch {
      /* idem */
    }
  }

  return sent
}

/** Descarta a fila — usado quando a pessoa RECUSA analytics. */
export function discardPostHogBuffer(): void {
  buffer = []
  droppedCount = 0
}

/** Só para teste/diagnóstico. */
export function bufferedOpCount(): number {
  return buffer.length
}
