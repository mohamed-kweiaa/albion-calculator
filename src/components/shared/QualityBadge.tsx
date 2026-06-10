import { cn } from '@/lib/utils'
import { QUALITY_NAMES } from '@/lib/constants'

interface QualityBadgeProps {
  quality: number
  className?: string
}

const qualityStyles: Record<number, string> = {
  1: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  2: 'bg-green-500/20 text-green-400 border border-green-500/30',
  3: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  4: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  5: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

export function QualityBadge({ quality, className }: QualityBadgeProps) {
  const name = QUALITY_NAMES[quality]
  const style = qualityStyles[quality]

  if (!name || !style) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold',
        style,
        className
      )}
    >
      {name}
    </span>
  )
}
