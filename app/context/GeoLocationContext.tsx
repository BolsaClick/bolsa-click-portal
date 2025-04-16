import axios from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'

type LocationData = {
  state: string | null
  town: string | null
  error: string | null
}

const GeoLocationContext = createContext<LocationData | null>(null)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<string | null>(null)
  const [town, setTown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador.')
      return
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
  
        try {
          const response = await axios.get(
            'https://nominatim.openstreetmap.org/reverse',
            {
              params: {
                format: 'json',
                lat: latitude,
                lon: longitude,
              },
            }
          )
  
          const address = response.data.address || {}
  
          setState(address.state ?? null)
          setTown(address.town ?? address.city ?? null) // tenta city como fallback
        } catch (err) {
          console.error('Erro ao buscar endereço da API:', err)
          setError('Não foi possível obter a localização.')
        }
      },
      (geoError) => {
        console.error(
          'Erro de geolocalização:',
          geoError?.message || geoError || 'Erro desconhecido'
        )
        setError('Permissão negada ou erro ao acessar a localização.')
      }
    )
  }, [])

  return (
    <GeoLocationContext.Provider value={{ state, town, error }}>
      {children}
    </GeoLocationContext.Provider>
  )
}

export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext)
  if (!context) {
    throw new Error(
      'useGeoLocation deve ser usado dentro de GeoLocationProvider',
    )
  }
  return context
}
