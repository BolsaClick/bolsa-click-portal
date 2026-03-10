export interface LocationByIP {
  city: string
  region: string
  country: string
  countryCode: string
  latitude?: number
  longitude?: number
}

// Mapeamento de estados brasileiros para siglas UF
const stateToUF: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amapá': 'AP',
  'Amazonas': 'AM',
  'Bahia': 'BA',
  'Ceará': 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  'Goiás': 'GO',
  'Maranhão': 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  'Pará': 'PA',
  'Paraíba': 'PB',
  'Paraná': 'PR',
  'Pernambuco': 'PE',
  'Piauí': 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO',
  'Roraima': 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  'Sergipe': 'SE',
  'Tocantins': 'TO',
  // Também aceitar siglas já no formato correto
  'AC': 'AC', 'AL': 'AL', 'AP': 'AP', 'AM': 'AM', 'BA': 'BA',
  'CE': 'CE', 'DF': 'DF', 'ES': 'ES', 'GO': 'GO', 'MA': 'MA',
  'MT': 'MT', 'MS': 'MS', 'MG': 'MG', 'PA': 'PA', 'PB': 'PB',
  'PR': 'PR', 'PE': 'PE', 'PI': 'PI', 'RJ': 'RJ', 'RN': 'RN',
  'RS': 'RS', 'RO': 'RO', 'RR': 'RR', 'SC': 'SC', 'SP': 'SP',
  'SE': 'SE', 'TO': 'TO',
}

// Função para converter nome do estado para sigla UF
function convertStateToUF(stateName: string): string {
  // Se já for uma sigla de 2 letras, retornar como está
  if (stateName.length === 2 && /^[A-Z]{2}$/i.test(stateName)) {
    return stateName.toUpperCase()
  }
  
  // Tentar encontrar no mapeamento (case-insensitive)
  const normalizedState = stateName.trim()
  const found = Object.keys(stateToUF).find(
    key => key.toLowerCase() === normalizedState.toLowerCase()
  )
  
  if (found) {
    return stateToUF[found]
  }
  
  // Se não encontrar, retornar o valor original (pode ser uma sigla não mapeada)
  return normalizedState.toUpperCase()
}

export async function getLocationByIP(): Promise<LocationByIP | null> {
  try {
    // Tentar primeiro com ipapi.co
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Verificar se temos cidade e estado válidos
        // ipapi.co pode retornar region_code (sigla) ou region (nome completo); latitude/longitude opcionais
        if (data.city && (data.region || data.region_code)) {
          const stateUF = data.region_code || convertStateToUF(data.region || 'SP')
          const lat = typeof data.latitude === 'number' ? data.latitude : (data.latitude != null ? Number(data.latitude) : undefined)
          const lng = typeof data.longitude === 'number' ? data.longitude : (data.longitude != null ? Number(data.longitude) : undefined)
          return {
            city: data.city,
            region: stateUF,
            country: data.country_name || 'Brasil',
            countryCode: data.country_code || 'BR',
            ...(lat != null && !Number.isNaN(lat) && lng != null && !Number.isNaN(lng) && { latitude: lat, longitude: lng }),
          }
        }
      }
    } catch (error) {
      console.warn('Erro com ipapi.co, tentando alternativa:', error)
    }

    // Fallback: usar ipwho.is (alternativa gratuita com HTTPS)
    try {
      const response = await fetch('https://ipwho.is/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.city && (data.region || data.region_code)) {
          const stateUF = data.region_code || convertStateToUF(data.region || 'SP')
          const lat = typeof data.latitude === 'number' ? data.latitude : undefined
          const lng = typeof data.longitude === 'number' ? data.longitude : undefined
          return {
            city: data.city,
            region: stateUF,
            country: data.country || 'Brasil',
            countryCode: data.country_code || 'BR',
            ...(lat != null && !Number.isNaN(lat) && lng != null && !Number.isNaN(lng) && { latitude: lat, longitude: lng }),
          }
        }
      }
    } catch (error) {
      console.warn('Erro com ipwho.is:', error)
    }

    // Se ambas falharem, retornar valores padrão
    throw new Error('Todas as APIs de geolocalização falharam')
  } catch (error) {
    console.error('Erro ao detectar localização por IP:', error)
    // Retornar valores padrão em caso de erro
    return {
      city: 'São Paulo',
      region: 'SP',
      country: 'Brasil',
      countryCode: 'BR',
    }
  }
}

