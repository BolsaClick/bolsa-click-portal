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
  params: Promise<{ code: string }>
}

// GET - Buscar cupom por código no Elysium
export async function GET(request: NextRequest, { params }: Props) {
  const auth = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(auth)) return auth

  try {
    const { code } = await params

    console.log(`📥 Buscando cupom por código "${code}" no Elysium...`)

    const response = await elysium.get<ElysiumCoupon>(`/coupons/code/${code}`)
    const coupon = response.data

    console.log('✅ Cupom encontrado:', coupon)

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('❌ Erro ao buscar cupom por código no Elysium:', error)

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
