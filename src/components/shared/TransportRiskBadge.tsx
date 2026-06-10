import { cn } from '@/lib/utils'
import { Shield, AlertTriangle, Skull } from 'lucide-react'
import { getTransportRisk, getTransportRiskLabel, getTransportRiskColor } from '@/lib/transportRisk'
import type { CityName } from '@/types/market'

interface TransportRiskBadgeProps {
  fromCity: CityName
  toCity: CityName
  className?: string
}

const riskIcons = {
  safe: Shield,
  moderate: AlertTriangle,
  high: Skull,
} as const

export function TransportRiskBadge({ fromCity, toCity, className }: TransportRiskBadgeProps) {
  const risk = getTransportRisk(fromCity, toCity)
  const label = getTransportRiskLabel(risk)
  const colorClass = getTransportRiskColor(risk)
  const Icon = riskIcons[risk]

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', colorClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  )
}
