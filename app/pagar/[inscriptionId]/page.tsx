import { Metadata } from 'next'
import PagarRedirectClient from './PagarRedirectClient'

export const metadata: Metadata = {
  title: 'Pagamento da sua inscrição',
  // Link de cobrança individual — nunca deve ser indexado.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Link DURÁVEL de pagamento, pensado pra ir em WhatsApp/e-mail/SMS.
 *
 * O checkout da Cogna (`pay.anhanguera.com/...`) expira em ~30min — inútil num
 * canal assíncrono, onde a pessoa abre a mensagem horas depois. Esta página
 * resolve isso: o link mandado é sempre este (`/pagar/<numero_inscricao>`, que
 * não expira) e o checkout fresco é gerado no MOMENTO DO CLIQUE, redirecionando
 * pra Cogna. Ver [[project_passo7_payment_link_cogna]].
 *
 * O redirect é feito no cliente (não no servidor) porque a geração leva de 0,9s
 * a 37s: bloquear a resposta HTTP arriscaria timeout de gateway. Enquanto gera,
 * mostra "preparando pagamento".
 */
export default async function PagarPage({
  params,
}: {
  params: Promise<{ inscriptionId: string }>
}) {
  const { inscriptionId } = await params
  const valid = /^\d+$/.test(inscriptionId)

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      {valid ? (
        <PagarRedirectClient inscriptionId={inscriptionId} />
      ) : (
        <p className="text-ink-600 text-sm">Link de pagamento inválido.</p>
      )}
    </main>
  )
}
