import { getItemImageUrl } from '@/lib/itemUtils'

interface ItemIconProps {
  itemId: string
  quality?: number
  size?: number
  className?: string
}

export function ItemIcon({ itemId, quality = 1, size = 40, className = '' }: ItemIconProps) {
  return (
    <img
      src={getItemImageUrl(itemId, quality)}
      alt={itemId}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
