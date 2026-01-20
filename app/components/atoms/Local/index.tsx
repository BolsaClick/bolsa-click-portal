'use client'
import { useGeoLocation } from '../../../context/GeoLocationContext'

const GeoLocation = () => {
  const { city, region, state, town, error } = useGeoLocation()

  // Usar city/region (novo) ou town/state (compatibilidade)
  const displayCity = city || town
  const displayState = region || state

  return (
    <div>
      {displayCity && displayState ? (
        <span>
          {displayCity} - {displayState}
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
