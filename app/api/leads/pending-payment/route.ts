import { NextRequest, NextResponse } from 'next/server'
import { upsertNotealyContact } from '@/app/lib/api/notealy'

// Graduação EAD/semi ATHENAS: decisão de negócio remove a cobrança do site
// (a Cogna dobrou a comissão, mas exige que o pagamento não seja coletado por
// nós — fica com o payment-link deles, quando integrado). Marca o contato
// como "Pendente Pagamento" pra diferenciar de quem já pagou.
// Best-effort — sempre responde 200 para não impactar o checkout.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, cpf } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    try {
      await upsertNotealyContact({
        name,
        email,
        phone: phone ? String(phone).replace(/\D/g, '') : undefined,
        cpf: cpf ? String(cpf).replace(/\D/g, '') : undefined,
        tagId: process.env.NOTEALY_TAG_PENDENTE_PAGAMENTO,
      })
    } catch (notealyError) {
      console.error('⚠️ Notealy (pendente pagamento) falhou:', notealyError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error tagging pending payment to Notealy:', error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
