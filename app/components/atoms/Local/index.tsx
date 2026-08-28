'use client'
import { useGeoLocation } from '../../../context/GeoLocationContext'
import { brazilCityStateOrNull } from '@/app/lib/geo/brazil-location'

const GeoLocation = () => {
  const { city, region, state, town, error } = useGeoLocation()

  // Usar city/region (novo) ou town/state (compatibilidade)
  const displayCity = city || town
  const displayState = region || state
  const allowed = brazilCityStateOrNull(displayCity, displayState)

  return (
    <div>
      {allowed ? (
        <span>
          {allowed.city} - {allowed.state}
        </span>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <p>Obtendo localização...</p>
      )}
    </div>
  )
}

export default GeoLocation
