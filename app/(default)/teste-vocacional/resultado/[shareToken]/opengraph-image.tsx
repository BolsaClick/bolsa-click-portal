/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { prisma } from '@/app/lib/prisma'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

export const runtime = 'nodejs' // precisa do prisma — não pode rodar no edge
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'Meu perfil vocacional — Bolsa Click'

interface SharedProfile {
  hollandCode: string
  primary: { code: string; name: string; description?: string }
  secondary?: { code: string; name: string }
  tertiary?: { code: string; name: string }
  recommendations?: Array<{ courseSlug: string }>
}

export default async function OGImage({ params }: { params: { shareToken: string } }) {
  const { shareToken } = params
  const record = await prisma.vocationalTestResult.findUnique({
    where: { shareToken },
    select: { hollandCode: true, profileData: true },
  })

  if (!record) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4EFE5',
            fontSize: 48,
            color: '#0B1F3C',
          }}
        >
          Bolsa Click · Teste Vocacional
        </div>
      ),
      size
    )
  }

  const profile = record.profileData as unknown as SharedProfile
  const courses = (profile.recommendations ?? []).slice(0, 3).map(r => {
    const c = TOP_CURSOS.find(x => x.slug === r.courseSlug)
    return c?.apiCourseName ?? r.courseSlug
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#F4EFE5',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          color: '#0B1F3C',
          position: 'relative',
        }}
      >
        {/* Topo: badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 18,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#f21d44',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: '#f21d44',
              borderRadius: 999,
            }}
          />
          Teste vocacional · Bolsa Click
        </div>

        {/* Conteúdo principal — Holland Code + cursos */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            marginTop: 40,
            gap: 60,
            alignItems: 'center',
          }}
        >
          {/* Esquerda: Holland Code grande */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 380,
            }}
          >
            <div
              style={{
                fontSize: 240,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-12px',
                color: '#0B1F3C',
              }}
            >
              {record.hollandCode}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                marginTop: 16,
                color: '#0B1F3C',
              }}
            >
              {profile.primary.name}
            </div>
            <div
              style={{
                fontSize: 18,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#5A6B82',
                marginTop: 8,
                fontWeight: 600,
              }}
            >
              Holland Code
            </div>
          </div>

          {/* Direita: cursos recomendados */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              borderLeft: '2px solid rgba(11, 31, 60, 0.15)',
              paddingLeft: 50,
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#5A6B82',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              3 cursos com maior afinidade
            </div>
            {courses.map((name, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#0B1F3C',
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    color: '#f21d44',
                    fontWeight: 700,
                    width: 28,
                  }}
                >
                  {i + 1}.
                </div>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 20,
            color: '#5A6B82',
            marginTop: 30,
          }}
        >
          <div style={{ display: 'flex' }}>bolsaclick.com.br/teste-vocacional</div>
          <div style={{ display: 'flex', fontWeight: 600 }}>
            Grátis · 5 min · sem CPF
          </div>
        </div>
      </div>
    ),
    size
  )
}
