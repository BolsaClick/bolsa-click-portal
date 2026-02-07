import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firebaseUid, email, name, avatar, emailVerified } = body

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upsert user - criar se não existir, atualizar se existir
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        name: name || undefined,
        avatar: avatar || undefined,
        emailVerified,
        lastLoginAt: new Date(),
      },
      create: {
        firebaseUid,
        email,
        name,
        avatar,
        emailVerified,
        lastLoginAt: new Date(),
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
