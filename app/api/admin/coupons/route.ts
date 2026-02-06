import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'

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

// GET - Listar todos os cupons do Elysium
export async function GET() {
  try {
    console.log('📥 Buscando cupons do Elysium...')

    const response = await elysium.get<ElysiumCoupon[]>('/coupons')
    const coupons = response.data || []

    console.log(`✅ ${coupons.length} cupons encontrados no Elysium`)

    return NextResponse.json({
      coupons,
      total: coupons.length
    })
  } catch (error) {
    console.error('❌ Erro ao buscar cupons do Elysium:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cupons do Elysium' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cupom no Elysium
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      description,
      discount,
      type,
      maxUses,
      validUntil,
    } = body

    // Validações
    if (!code || discount === undefined || !type) {
      return NextResponse.json(
        { error: 'code, discount and type are required' },
        { status: 400 }
      )
    }

    if (!['PERCENT', 'FIXED'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be PERCENT or FIXED' },
        { status: 400 }
      )
    }

    if (type === 'PERCENT' && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'For PERCENT type, discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    const elysiumPayload = {
      code: code.toUpperCase(),
      description: description || `Cupom ${code}`,
      discount,
      type,
      maxUses: maxUses || null,
      validUntil: validUntil || null,
    }

    console.log('📤 Criando cupom no Elysium:', elysiumPayload)

    const response = await elysium.post<ElysiumCoupon>('/coupons', elysiumPayload)
    const coupon = response.data

    console.log('✅ Cupom criado no Elysium:', coupon)

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    console.error('❌ Erro ao criar cupom no Elysium:', error)

    const axiosError = error as { response?: { data?: { message?: string; error?: string } } }
    const errorMessage = axiosError?.response?.data?.message ||
                         axiosError?.response?.data?.error ||
                         'Erro ao criar cupom no Elysium'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
