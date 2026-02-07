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

// GET - Listar favoritos
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Adicionar favorito
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      courseId,
      courseName,
      courseSlug,
      institutionName,
      modalidade,
      price,
      discount,
    } = body

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      update: {
        courseName,
        courseSlug,
        institutionName,
        modalidade,
        price,
        discount,
      },
      create: {
        userId: user.id,
        courseId,
        courseName,
        courseSlug,
        institutionName,
        modalidade,
        price,
        discount,
      },
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remover favorito
export async function DELETE(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
