export interface LocationByIP {
  city: string
  region: string
  country: string
  countryCode: string
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
        // ipapi.co pode retornar region_code (sigla) ou region (nome completo)
        if (data.city && (data.region || data.region_code)) {
          const stateUF = data.region_code || convertStateToUF(data.region || 'SP')
          
          return {
            city: data.city,
            region: stateUF,
            country: data.country_name || 'Brasil',
            countryCode: data.country_code || 'BR',
          }
        }
      }
    } catch (error) {
      console.warn('Erro com ipapi.co, tentando alternativa:', error)
    }

    // Fallback: usar ip-api.com (alternativa gratuita)
    try {
      const response = await fetch('http://ip-api.com/json/?fields=status,message,city,regionName,region,country,countryCode', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'success' && data.city && (data.regionName || data.region)) {
          // ip-api.com retorna region como código (ex: "SP") ou regionName como nome completo
          const stateUF = data.region || convertStateToUF(data.regionName || 'SP')
          
          return {
            city: data.city,
            region: stateUF,
            country: data.country || 'Brasil',
            countryCode: data.countryCode || 'BR',
          }
        }
      }
    } catch (error) {
      console.warn('Erro com ip-api.com:', error)
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

