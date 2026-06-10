import { cn } from '@/lib/utils'
import { formatSilver } from '@/lib/formatters'

interface SilverDisplayProps {
  amount: number
  showSign?: boolean
  className?: string
}

export function SilverDisplay({ amount, showSign = false, className }: SilverDisplayProps) {
  const formatted = formatSilver(Math.abs(amount))
  const sign = amount >= 0 ? '+' : '-'
  const displayText = showSign ? `${sign}${formatted}` : formatted

  const colorClass = showSign
    ? amount >= 0
      ? 'text-profit'
      : 'text-loss'
    : undefined

  return (
    <span className={cn('inline-flex items-center gap-1', colorClass, className)}>
      <span>{displayText}</span>
      <span className="text-xs text-muted-foreground">silver</span>
    </span>
  )
}
