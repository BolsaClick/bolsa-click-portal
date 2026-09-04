import { NextResponse } from 'next/server'
import { isAxiosError } from 'axios'

/**
 * Repassa o erro de uma chamada ao Tartarus (via `app/lib/api/*`) para o
 * cliente EXATAMENTE como o Tartarus respondeu — mesmo status HTTP, mesmo
 * corpo JSON. Isso é o que garante que `getCognaErrorMessage`/
 * `getCognaErrorDetails` (lidos no client a partir do erro do axios contra
 * ESTA rota) continuem extraindo a mesma mensagem que extraiam antes, quando
 * o client chamava o Tartarus direto — a rota é um proxy transparente, não
 * reinterpreta o erro.
 *
 * Só cai no fallback 502 quando não há resposta HTTP nenhuma do Tartarus
 * (timeout, DNS, rede) — nesse caso não existe status/corpo pra repassar.
 */
export function tartarusErrorResponse(error: unknown, fallbackStatus = 502) {
  if (isAxiosError(error) && error.response) {
    return NextResponse.json(
      error.response.data ?? { message: error.message },
      { status: error.response.status },
    )
  }
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao falar com o Tartarus'
  return NextResponse.json({ message }, { status: fallbackStatus })
}
