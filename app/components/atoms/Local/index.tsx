'use client'
import { useGeoLocation } from '../../../context/GeoLocationContext'

const GeoLocation = () => {
  const { state, town, error } = useGeoLocation()

  return (
    <div>
      {state && town ? (
        <span>
          {town} - {state}
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
