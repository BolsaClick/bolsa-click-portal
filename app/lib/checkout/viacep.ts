/**
 * Consulta de CEP no ViaCEP para o checkout da Estácio.
 *
 * Até out/2026 era conveniência: o candidato digitava os 6 campos de endereço
 * e o ViaCEP só adiantava 4. Agora o formulário pede só CEP + número e esconde
 * logradouro, bairro, cidade e UF — o ViaCEP virou CAMINHO CRÍTICO, é ele quem
 * preenche 4 campos obrigatórios do payload da Athena.
 *
 * Por isso esta função NUNCA lança e sempre diz o que faltou:
 *  - timeout curto (o candidato está parado esperando);
 *  - CEP inexistente (`erro: true`), HTTP != 200, rede fora, JSON inválido →
 *    `ok: false`, e o checkout mostra os campos para preenchimento manual;
 *  - CEP geral de cidade pequena vem com logradouro/bairro VAZIOS → `ok: true`
 *    com `missing` listando o que o candidato ainda precisa digitar.
 * Um ViaCEP fora do ar não pode zerar a inscrição da Estácio.
 */

export const VIACEP_TIMEOUT_MS = 4000

export type CepAddressField = 'street' | 'neighborhood' | 'city' | 'state'

export const CEP_ADDRESS_FIELDS: readonly CepAddressField[] = [
  'street',
  'neighborhood',
  'city',
  'state',
]

export type CepAddress = Record<CepAddressField, string>

export type CepLookupResult =
  | { ok: true; address: CepAddress; missing: CepAddressField[] }
  | { ok: false; reason: 'invalid' | 'not_found' | 'timeout' | 'http' | 'network' }

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
}>

export async function lookupCep(
  cep: string,
  opts: { timeoutMs?: number; fetchImpl?: FetchLike } = {},
): Promise<CepLookupResult> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return { ok: false, reason: 'invalid' }

  const fetchImpl = opts.fetchImpl ?? (fetch as unknown as FetchLike)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? VIACEP_TIMEOUT_MS)

  try {
    const res = await fetchImpl(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, reason: 'http' }

    const data = (await res.json()) as Record<string, unknown> | null
    if (!data || data.erro) return { ok: false, reason: 'not_found' }

    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
    const address: CepAddress = {
      street: str(data.logradouro),
      neighborhood: str(data.bairro),
      city: str(data.localidade),
      state: str(data.uf).toUpperCase(),
    }
    const missing = CEP_ADDRESS_FIELDS.filter((f) => !address[f])
    return { ok: true, address, missing }
  } catch (error) {
    const aborted =
      controller.signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    return { ok: false, reason: aborted ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timer)
  }
}
