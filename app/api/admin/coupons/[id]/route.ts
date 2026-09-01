import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

interface ElysiumCoupon {
  id: string
  code: string
  description?: string
  discount: number
  type: 'PERCENT' | 'FIXED'
  maxUses?: number
  usedCount?: number
  validFrom?: string
  validUntil?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

type Props = {
  params: Promise<{ id: string }>
}

// GET - Buscar cupom por ID no Elysium
export async function GET(request: NextRequest, { params }: Props) {
  const auth = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params

    console.log(`📥 Buscando cupom ${id} no Elysium...`)

    const response = await elysium.get<ElysiumCoupon>(`/coupons/${id}`)
    const coupon = response.data

    console.log('✅ Cupom encontrado:', coupon)

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('❌ Erro ao buscar cupom no Elysium:', error)

    const axiosError = error as { response?: { status?: number } }
    if (axiosError?.response?.status === 404) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao buscar cupom no Elysium' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cupom no Elysium
export async function PUT(request: NextRequest, { params }: Props) {
  const auth = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const {
      description,
      discount,
      type,
      maxUses,
      validUntil,
      isActive,
    } = body

    // Validações
    if (type && !['PERCENT', 'FIXED'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be PERCENT or FIXED' },
        { status: 400 }
      )
    }

    if (type === 'PERCENT' && discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'For PERCENT type, discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, unknown> = {}
    if (description !== undefined) updatePayload.description = description
    if (discount !== undefined) updatePayload.discount = discount
    if (type !== undefined) updatePayload.type = type
    if (maxUses !== undefined) updatePayload.maxUses = maxUses
    if (validUntil !== undefined) updatePayload.validUntil = validUntil
    if (isActive !== undefined) updatePayload.isActive = isActive

    console.log(`📤 Atualizando cupom ${id} no Elysium:`, updatePayload)

    const response = await elysium.put<ElysiumCoupon>(`/coupons/${id}`, updatePayload)
    const coupon = response.data

    console.log('✅ Cupom atualizado no Elysium:', coupon)

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('❌ Erro ao atualizar cupom no Elysium:', error)

    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } }
    if (axiosError?.response?.status === 404) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    const errorMessage = axiosError?.response?.data?.message ||
                         axiosError?.response?.data?.error ||
                         'Erro ao atualizar cupom no Elysium'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Deletar cupom no Elysium
export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params

    console.log(`🗑️ Deletando cupom ${id} no Elysium...`)

    await elysium.delete(`/coupons/${id}`)

    console.log('✅ Cupom deletado no Elysium')

    return NextResponse.json({ message: 'Cupom deletado com sucesso' })
  } catch (error) {
    console.error('❌ Erro ao deletar cupom no Elysium:', error)

    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } }
    if (axiosError?.response?.status === 404) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    const errorMessage = axiosError?.response?.data?.message ||
                         axiosError?.response?.data?.error ||
                         'Erro ao deletar cupom no Elysium'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
