import { cn } from '@/lib/utils'

interface EnchantmentBadgeProps {
  enchantment: number
  className?: string
}

const enchantmentStyles: Record<number, string> = {
  1: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  2: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  3: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  4: 'bg-white/20 text-white border border-white/30',
}

export function EnchantmentBadge({ enchantment, className }: EnchantmentBadgeProps) {
  if (enchantment === 0) return null

  const style = enchantmentStyles[enchantment]
  if (!style) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold',
        style,
        className
      )}
    >
      .{enchantment}
    </span>
  )
}
