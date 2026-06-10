import type { CityName } from '@/types/market'

export type TransportRisk = 'safe' | 'moderate' | 'high'

export function getTransportRisk(fromCity: CityName, toCity: CityName): TransportRisk {
  // Brecilien = high risk always (Roads of Avalon)
  if (fromCity === 'Brecilien' || toCity === 'Brecilien') return 'high'
  // Caerleon or Black Market (which is in Caerleon) = moderate risk (red zone transit)
  if (fromCity === 'Caerleon' || toCity === 'Caerleon' || fromCity === 'Black Market' || toCity === 'Black Market') return 'moderate'
  // Royal city to royal city = safe
  return 'safe'
}

export function getTransportRiskColor(risk: TransportRisk): string {
  switch (risk) {
    case 'safe': return 'text-green-500'
    case 'moderate': return 'text-yellow-500'
    case 'high': return 'text-red-500'
  }
}

export function getTransportRiskLabel(risk: TransportRisk): string {
  switch (risk) {
    case 'safe': return 'Safe Route'
    case 'moderate': return 'Red Zone'
    case 'high': return 'Roads of Avalon'
  }
}
