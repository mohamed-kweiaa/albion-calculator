import type { ScanProgress as Progress } from '@/types/flip'

interface ScanProgressProps {
  progress: Progress
  onCancel: () => void
}

function formatEta(progress: Progress) {
  if (!progress.startTime || progress.scanned <= 0 || progress.status !== 'scanning') return 'calculating...'
  const elapsed = Date.now() - progress.startTime
  const perItem = elapsed / progress.scanned
  const remainingMs = Math.max(0, (progress.total - progress.scanned) * perItem)
  const mins = Math.ceil(remainingMs / 60000)
  return `~${mins} min`
}

export function ScanProgress({ progress, onCancel }: ScanProgressProps) {
  if (progress.status === 'idle') return null
  const percent = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{progress.status === 'scanning' ? `Scanning ${progress.scanned}/${progress.total} items... (ETA: ${formatEta(progress)})` : `Scan ${progress.status}: ${progress.found} flips found`}</span>
        {progress.status === 'scanning' && <button onClick={onCancel} className="rounded bg-destructive px-3 py-1 text-xs text-destructive-foreground">Cancel</button>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div>
      <div className="mt-2 text-xs text-muted-foreground">Found {progress.found} profitable flips</div>
    </div>
  )
}
