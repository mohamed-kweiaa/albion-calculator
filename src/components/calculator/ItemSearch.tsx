import { useMemo, useState } from 'react'
import equipmentItems from '@/data/equipment-items.json'
import resourceItems from '@/data/resource-items.json'
import otherItems from '@/data/other-items.json'
import type { AlbionItem } from '@/types/items'
import { cn } from '@/lib/utils'

const allItems = [
  ...(equipmentItems as AlbionItem[]),
  ...(resourceItems as AlbionItem[]),
  ...(otherItems as AlbionItem[]),
]

interface ItemSearchProps {
  onSelect: (item: AlbionItem) => void
  className?: string
}

export function ItemSearch({ onSelect, className }: ItemSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return allItems
      .filter((item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
      .slice(0, 20)
  }, [query])

  return (
    <div className={cn('relative', className)}>
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search item by name or ID..."
        className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none ring-ring focus:ring-2"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(item)
                setQuery(item.name)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-accent"
            >
              <span>
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{item.id}</span>
              </span>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs">T{item.tier} {item.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
