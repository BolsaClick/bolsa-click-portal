'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCityFromOurAPIByIP } from '@/app/lib/api/get-city-from-api-by-ip'
import { isBot } from '@/app/lib/utils/is-bot'

type LocationData = {
  state: string | null
  town: string | null
  city: string | null
  region: string | null
  error: string | null
}

const GeoLocationContext = createContext<LocationData | null>(null)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<string | null>(null)
  const [town, setTown] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [region, setRegion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Não detectar geolocalização para bots/crawlers
    // Evita que Googlebot (Mountain View, CA) gere URLs inválidas
    if (isBot()) {
      setCity('São Paulo')
      setRegion('SP')
      setState('SP')
      setTown('São Paulo')
      return
    }

    const detectLocation = async () => {
      try {
        const location = await getCityFromOurAPIByIP()

        if (location) {
          setCity(location.city)
          setRegion(location.state)
          setState(location.state)
          setTown(location.city)
        } else {
          setError('Não foi possível obter a localização.')
        }
      } catch (err) {
        console.error('Erro ao detectar localização por IP:', err)
        setError('Não foi possível obter a localização.')
        setCity('São Paulo')
        setRegion('SP')
        setState('SP')
        setTown('São Paulo')
      }
    }

    detectLocation()
  }, [])

  return (
    <GeoLocationContext.Provider value={{ state, town, city, region, error }}>
      {children}
    </GeoLocationContext.Provider>
  )
}

export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext)
  if (!context) {
    throw new Error(
      'useGeoLocation deve ser usado dentro de GlobalProvider',
    )
  }
  return context
}
