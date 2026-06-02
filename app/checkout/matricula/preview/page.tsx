'use client'

/**
 * Página de PREVIEW (apenas desenvolvimento) do checkout inline da matrícula.
 * Renderiza <MatriculaPayment> com dados de teste para inspecionar o design
 * (Pix/Cartão/Boleto + modal do QR) sem precisar de uma oferta ATHENAS real.
 *
 * NÃO é exposta em produção (retorna 404). Pode ser removida quando não precisar.
 */

import { notFound } from 'next/navigation'
import { toast } from 'sonner'
import MatriculaPayment from '../MatriculaPayment'

export default function MatriculaPaymentPreview() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-paper py-10">
      <div className="mx-auto max-w-md px-4">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          Preview · dev only
        </p>
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)]">
          <MatriculaPayment
            amountInCents={14990}
            customer={{
              name: 'Maria Teste da Silva',
              cpf: '111.444.777-35',
              email: 'maria.teste@example.com',
              phone: '(11) 99999-0000',
            }}
            description="Matrícula - Curso de Teste (preview)"
            metadata={{ courseId: 'preview', courseName: 'Curso de Teste', institutionName: 'Anhanguera' }}
            formReady
            onRequireData={() => toast.error('Preencha seus dados (preview)')}
            onPaid={() => toast.success('onPaid disparado — aqui a inscrição seria criada')}
          />
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-ink-500">
          Os botões &quot;Gerar&quot; chamam <code className="font-mono">/api/checkout</code> → Elysium de
          verdade. Pix/Cartão dependem do Elysium estar no ar; boleto depende do contrato do
          backend. O erro vermelho também faz parte do design (estado de falha).
        </p>
      </div>
    </div>
  )
}
