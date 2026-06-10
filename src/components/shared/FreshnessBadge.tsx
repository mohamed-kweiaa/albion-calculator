import { cn } from '@/lib/utils'
import { formatTimeAgo, getFreshnessColor } from '@/lib/formatters'

interface FreshnessBadgeProps {
  date: string
  className?: string
}

const dotColorMap: Record<ReturnType<typeof getFreshnessColor>, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
}

export function FreshnessBadge({ date, className }: FreshnessBadgeProps) {
  const freshness = getFreshnessColor(date)
  const timeText = formatTimeAgo(date)

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <span className={cn('inline-block h-2 w-2 rounded-full', dotColorMap[freshness])} />
      <span>{timeText}</span>
    </span>
  )
}
