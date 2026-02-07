import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { adminAuth } from '@/app/lib/firebase/admin'

async function verifyToken(request: NextRequest) {
  if (!adminAuth) {
    console.error('Firebase Admin not configured')
    return null
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        favorites: true,
        enrollments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      cpf,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      educationLevel,
      currentSchool,
      receiveEmails,
      receiveSms,
      receiveWhatsapp,
    } = body

    const user = await prisma.user.update({
      where: { firebaseUid: decodedToken.uid },
      data: {
        name,
        phone,
        cpf,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        educationLevel,
        currentSchool,
        receiveEmails,
        receiveSms,
        receiveWhatsapp,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
