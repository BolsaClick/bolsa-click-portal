'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { brazilCityStateOrNull, convertStateToUf, isBrazilianUf, isForbiddenGeoCity } from '@/app/lib/geo/brazil-location'
import { isBot } from '@/app/lib/utils/is-bot'

/**
 * Detecta localização por IP quando a URL não tem cidade/estado nem curso, e
 * redireciona (`router.replace`) pra mesma página com `cidade`/`estado`
 * preenchidos. Sem efeito visual — só side effect. Fica fora do Suspense (é
 * puramente client) pra não segurar o streaming dos resultados.
 *
 * Bots/crawlers NÃO passam por geolocalização (evita URLs indexadas com
 * "Mountain View, CA" vindas do datacenter do crawler).
 *
 * Write-path: this is the query-string injector that #87 missed. It must
 * never write Washington/DC, and must not overwrite a city the user already
 * put in the URL (e.g. BH without UF).
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
    if (locationDetected) return

    const fromWindow =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null
    const urlCidade = (fromWindow?.get('cidade') ?? cidade ?? '').trim()
    const urlEstado = (fromWindow?.get('estado') ?? estado ?? '').trim()
    const urlCurso = (fromWindow?.get('c') ?? curso ?? '').trim()

    const allowedFromUrl = brazilCityStateOrNull(urlCidade, urlEstado)

    const stripForbiddenFromUrl = () => {
      if (!fromWindow) return
      if (!fromWindow.has('cidade') && !fromWindow.has('estado')) return
      fromWindow.delete('cidade')
      fromWindow.delete('estado')
      setLocationDetected(true)
      router.replace(`/curso/resultado?${fromWindow.toString()}`, { scroll: false })
    }

    // Valid BR city already in the URL: nothing to do.
    if (allowedFromUrl) return

    const incomingForbidden =
      isForbiddenGeoCity(urlCidade) ||
      (Boolean(urlEstado) && !isBrazilianUf(convertStateToUf(urlEstado)))

    // Washington/DC (or any non-BR UF) in the query string: drop it.
    // BH without UF stays — do not replace with geo.
    if (incomingForbidden) {
      stripForbiddenFromUrl()
      return
    }

    if (urlCidade || urlCurso) return

    if (isBot()) {
      setLocationDetected(true)
      return
    }

    const timeoutId = setTimeout(async () => {
      if (locationDetected) return

      if (typeof window !== 'undefined') {
        const current = new URLSearchParams(window.location.search)
        if (brazilCityStateOrNull(current.get('cidade'), current.get('estado'))) {
          return
        }
        if ((current.get('cidade') ?? '').trim()) {
          return
        }
      }

      const buildParams = (city: string, state: string) => {
        const params = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.search : '',
        )
        const allowed = brazilCityStateOrNull(city, state)
        if (!allowed) {
          params.delete('cidade')
          params.delete('estado')
          return params
        }
        params.set('cidade', allowed.city)
        params.set('estado', allowed.state)
        if (!params.has('c') && curso) params.set('c', curso)
        if (!params.has('cn') && cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
        if (!params.has('nivel')) params.set('nivel', nivel)
        if (!params.has('modalidade') && modalidade?.trim()) params.set('modalidade', modalidade)
        return params
      }

      try {
        const { getCityFromOurAPIByIP } = await import('@/app/lib/api/get-city-from-api-by-ip')
        const location = await getCityFromOurAPIByIP()
        const allowed = brazilCityStateOrNull(location?.city, location?.state)
        if (!allowed) return

        setLocationDetected(true)
        router.replace(`/curso/resultado?${buildParams(allowed.city, allowed.state)}`, {
          scroll: false,
        })
      } catch (error) {
        console.error('Erro ao detectar localização:', error)
        setLocationDetected(true)
        // Foreign IP / lookup failure: leave city empty. Never invent SP or DC.
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [cidade, estado, modalidade, nivel, curso, cursoNomeCompleto, router, locationDetected])

  return null
}
