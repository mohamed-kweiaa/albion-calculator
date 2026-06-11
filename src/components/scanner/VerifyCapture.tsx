import { useState, useCallback } from 'react'
import { CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useMarketPrices } from '@/hooks/useMarketPrices'
import { CITIES, QUALITY_NAMES } from '@/lib/constants'
import { formatTimeAgo, getDataAgeMs } from '@/lib/formatters'
import { CityBadge } from '@/components/shared/CityBadge'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import { FreshnessBadge } from '@/components/shared/FreshnessBadge'
import { buildItemId, parseItemId } from '@/lib/itemUtils'
import type { QualityLevel } from '@/types/market'

interface VerifyCaptureProps {
  className?: string
}

export function VerifyCapture({ className }: VerifyCaptureProps) {
  const [itemId, setItemId] = useState('')
  const [quality, setQuality] = useState<QualityLevel>(1)
  const [checkCount, setCheckCount] = useState(0)
  const [prevTimestamps, setPrevTimestamps] = useState<Record<string, string>>({})

  const fullId = itemId.includes('@') ? itemId : itemId

  const { data: prices = [], isLoading, refetch } = useMarketPrices(
    fullId ? [fullId] : [],
    CITIES,
    [quality],
  )

  const handleCheck = useCallback(() => {
    const snapshot: Record<string, string> = {}
    prices.forEach((p) => {
      snapshot[`${p.city}|${p.quality}`] = p.sell_price_min_date
    })
    setPrevTimestamps(snapshot)
    setCheckCount((c) => c + 1)
    refetch()
  }, [prices, refetch])

  const handleRecheck = useCallback(() => {
    setCheckCount((c) => c + 1)
    refetch()
  }, [refetch])

  const changedCount = prices.filter((p) => {
    const key = `${p.city}|${p.quality}`
    const prev = prevTimestamps[key]
    if (!prev) return false
    return p.sell_price_min_date !== prev && p.sell_price_min_date !== '0001-01-01T00:00:00'
  }).length

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className ?? ''}`}>
      <h3 className="mb-1 flex items-center gap-2 font-semibold">
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
        Verify Data Capture
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Check if the Albion Data Client is successfully updating prices for a specific item.
        Click <strong>Snapshot</strong>, then open that item's market in-game, wait 10-30 seconds,
        then click <strong>Recheck</strong> to see if timestamps changed.
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-64">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Item ID</label>
          <input
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="e.g. T5_2H_BOW@1 or paste from scanner"
            className="h-10 w-full rounded border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value) as QualityLevel)}
            className="h-10 rounded border border-input bg-background px-3 text-sm"
          >
            {[1, 2, 3, 4, 5].map((q) => (
              <option key={q} value={q}>{q} - {QUALITY_NAMES[q]}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCheck}
          disabled={!itemId || isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CameraIcon />}
          Snapshot
        </button>
        {checkCount > 0 && (
          <button
            onClick={handleRecheck}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Recheck
          </button>
        )}
      </div>

      {checkCount > 0 && changedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="font-medium text-green-600 dark:text-green-400">
            {changedCount} price{changedCount !== 1 ? 's' : ''} updated since last snapshot!
            The Albion Data Client is working.
          </span>
        </div>
      )}

      {checkCount > 1 && changedCount === 0 && prices.length > 0 && !isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
          <XCircle className="h-5 w-5 text-yellow-500" />
          <span className="font-medium text-yellow-600 dark:text-yellow-400">
            No changes detected. Either you haven't opened this item's market in-game yet,
            or the Albion Data Client is not running/connected.
          </span>
        </div>
      )}

      {prices.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">City</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Sell Min</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Buy Max</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Last Updated</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Age</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-muted-foreground">Changed?</th>
              </tr>
            </thead>
            <tbody>
              {prices
                .filter((p) => p.quality === quality)
                .map((price) => {
                  const key = `${price.city}|${price.quality}`
                  const prev = prevTimestamps[key]
                  const changed = prev && price.sell_price_min_date !== prev && price.sell_price_min_date !== '0001-01-01T00:00:00'
                  const age = getDataAgeMs(price.sell_price_min_date)
                  const isStale = age > 6 * 60 * 60 * 1000
                  return (
                    <tr key={key} className={`border-t border-border ${changed ? 'bg-green-500/5' : ''}`}>
                      <td className="px-3 py-2"><CityBadge city={price.city as any} /></td>
                      <td className="px-3 py-2">
                        {price.sell_price_min > 0 && price.sell_price_min_date !== '0001-01-01T00:00:00'
                          ? <SilverDisplay amount={price.sell_price_min} />
                          : <span className="text-muted-foreground">No data</span>}
                      </td>
                      <td className="px-3 py-2">
                        {price.buy_price_max > 0 && price.buy_price_max_date !== '0001-01-01T00:00:00'
                          ? <SilverDisplay amount={price.buy_price_max} />
                          : <span className="text-muted-foreground">No data</span>}
                      </td>
                      <td className="px-3 py-2">
                        {price.sell_price_min_date !== '0001-01-01T00:00:00'
                          ? <FreshnessBadge date={price.sell_price_min_date} />
                          : <span className="text-muted-foreground">Never</span>}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {age < Number.POSITIVE_INFINITY
                          ? `${Math.round(age / 60000)}m old`
                          : 'No data'}
                      </td>
                      <td className="px-3 py-2">
                        {checkCount > 0 && prev ? (
                          changed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Updated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> Same
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {prices.length === 0 && !isLoading && itemId && (
        <div className="text-sm text-muted-foreground">No data found. Make sure the item ID is correct (e.g. T5_2H_BOW@1).</div>
      )}

      <div className="mt-4 rounded bg-muted/50 p-3 text-xs text-muted-foreground">
        <strong>How to test:</strong>
        <ol className="mt-1 list-inside list-decimal space-y-1">
          <li>Enter an item ID (copy from scanner results or type like <code className="rounded bg-background px-1">T5_2H_BOW@1</code>)</li>
          <li>Click <strong>Snapshot</strong> to save current timestamps</li>
          <li>Open Albion, go to a city market, search for that item</li>
          <li>Browse the item listings (let the game load the prices)</li>
          <li>Wait 10-30 seconds for the Albion Data Client to upload</li>
          <li>Come back here and click <strong>Recheck</strong></li>
          <li>If rows show <span className="text-green-500">Updated</span> — your ADC is working!</li>
        </ol>
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
