import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/whatsapp/memory?phone=5511999999999
 * Busca o histórico de conversa de um número
 */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')
  if (!phone) {
    return NextResponse.json({ error: 'phone parameter is required' }, { status: 400 })
  }

  try {
    const memory = await prisma.whatsappMemory.findUnique({
      where: { phone },
    })

    return NextResponse.json({ memory: memory?.data || null })
  } catch (error) {
    console.error('Error fetching WhatsApp memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/whatsapp/memory
 * Salva ou atualiza o histórico de conversa
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, data } = await request.json()

    if (!phone || !data) {
      return NextResponse.json({ error: 'phone and data are required' }, { status: 400 })
    }

    // Limitar histórico a 30 mensagens para evitar payload enorme
    if (data.messages && Array.isArray(data.messages)) {
      data.messages = data.messages.slice(-30)
    }

    const memory = await prisma.whatsappMemory.upsert({
      where: { phone },
      update: { data, updatedAt: new Date() },
      create: { phone, data },
    })

    return NextResponse.json({ success: true, id: memory.id })
  } catch (error) {
    console.error('Error saving WhatsApp memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/whatsapp/memory?phone=5511999999999
 * Limpa o histórico de um número (reset da conversa)
 */
export async function DELETE(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone')
  if (!phone) {
    return NextResponse.json({ error: 'phone parameter is required' }, { status: 400 })
  }

  try {
    await prisma.whatsappMemory.deleteMany({
      where: { phone },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting WhatsApp memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
