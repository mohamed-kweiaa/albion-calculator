import { useState } from 'react'
import { Link } from 'react-router'
import { formatSilver } from '@/lib/formatters'

export function QuickFlipMode() {
  const [budget, setBudget] = useState(1000000)
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-semibold">Quick Flip Mode</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter a budget and jump to scanner presets for affordable opportunities.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value) || 0)} className="h-10 rounded border border-input bg-background px-3 text-sm" />
        <Link to="/scanner" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Find flips under {formatSilver(budget)}</Link>
      </div>
    </div>
  )
}
