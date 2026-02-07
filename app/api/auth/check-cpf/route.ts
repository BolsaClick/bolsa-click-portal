import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCpf = cpf.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Verificar se o CPF já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (existingUser) {
      // CPF já cadastrado
      return NextResponse.json({
        exists: true,
        message: 'Este CPF já está cadastrado. Faça login para continuar.',
        // Enviar email parcialmente mascarado para ajudar o usuário
        emailHint: existingUser.email
          ? `${existingUser.email.substring(0, 3)}***@${existingUser.email.split('@')[1]}`
          : null,
      })
    }

    // CPF não existe no banco
    return NextResponse.json({
      exists: false,
      message: 'CPF disponível para cadastro',
    })
  } catch (error) {
    console.error('Error checking CPF:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar CPF' },
      { status: 500 }
    )
  }
}
