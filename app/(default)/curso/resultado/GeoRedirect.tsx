'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isBot } from '@/app/lib/utils/is-bot'

/**
 * Detecta localização por IP quando a URL não tem cidade/estado nem curso, e
 * redireciona (`router.replace`) pra mesma página com `cidade`/`estado`
 * preenchidos. Sem efeito visual — só side effect. Fica fora do Suspense (é
 * puramente client) pra não segurar o streaming dos resultados.
 *
 * Bots/crawlers NÃO passam por geolocalização (evita URLs indexadas com
 * "Mountain View, CA" vindas do datacenter do crawler).
 */
export default function GeoRedirect({
  curso,
  cursoNomeCompleto,
  cidade,
  estado,
  modalidade,
  nivel,
}: {
  curso: string
  cursoNomeCompleto: string
  cidade: string
  estado: string
  modalidade: string
  nivel: string
}) {
  const router = useRouter()
  const [locationDetected, setLocationDetected] = useState(false)

  useEffect(() => {
    // Já tem localização, ou já tem curso (busca nacional imediata): nada a fazer.
    if ((cidade && estado) || (curso && curso.trim())) return
    if (locationDetected) return

    if (isBot()) {
      setLocationDetected(true)
      return
    }

    const timeoutId = setTimeout(async () => {
      if (locationDetected) return

      // Revalidar URL atual (pode ter atualizado após navegação da home).
      if (typeof window !== 'undefined') {
        const current = new URLSearchParams(window.location.search)
        if ((current.get('cidade') ?? '').trim() && (current.get('estado') ?? '').trim()) {
          return
        }
      }

      const buildParams = (city: string, state: string) => {
        const params = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.search : '',
        )
        params.set('cidade', city)
        params.set('estado', state)
        if (!params.has('c') && curso) params.set('c', curso)
        if (!params.has('cn') && cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
        if (!params.has('nivel')) params.set('nivel', nivel)
        if (!params.has('modalidade') && modalidade?.trim()) params.set('modalidade', modalidade)
        return params
      }

      try {
        const { getCityFromOurAPIByIP } = await import('@/app/lib/api/get-city-from-api-by-ip')
        const location = await getCityFromOurAPIByIP()
        if (!location) return

        setLocationDetected(true)
        router.replace(`/curso/resultado?${buildParams(location.city, location.state)}`, {
          scroll: false,
        })
      } catch (error) {
        console.error('Erro ao detectar localização:', error)
        setLocationDetected(true)
        router.replace(`/curso/resultado?${buildParams('São Paulo', 'SP')}`, { scroll: false })
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [cidade, estado, modalidade, nivel, curso, cursoNomeCompleto, router, locationDetected])

  return null
}
