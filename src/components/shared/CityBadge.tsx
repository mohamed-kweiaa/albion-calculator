import { cn } from '@/lib/utils'
import { CITY_COLORS } from '@/lib/constants'
import type { CityName } from '@/types/market'

interface CityBadgeProps {
  city: CityName
  className?: string
}

export function CityBadge({ city, className }: CityBadgeProps) {
  const color = CITY_COLORS[city]

  return (
    <span
      className={cn('text-xs font-medium', className)}
      style={{ color }}
    >
      {city}
    </span>
  )
}
