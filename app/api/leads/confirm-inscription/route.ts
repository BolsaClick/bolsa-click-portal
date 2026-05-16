import { NextRequest, NextResponse } from 'next/server'
import { upsertNotealyContact } from '@/app/lib/api/notealy'

// Estágio 2 do CRM Notealy: chamado quando a inscrição é confirmada.
// Atualiza (upsert) o contato com a tag "inscrito". Não envia email.
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
        tagId: process.env.NOTEALY_TAG_INSCRITO,
      })
    } catch (notealyError) {
      console.error('⚠️ Notealy (estágio 2) falhou:', notealyError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error confirming inscription to Notealy:', error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
