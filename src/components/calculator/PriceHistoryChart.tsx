import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { CITY_COLORS } from '@/lib/constants'
import { formatCompactNumber } from '@/lib/formatters'
import { usePriceHistory } from '@/hooks/usePriceHistory'
import type { CityName } from '@/types/market'

interface PriceHistoryChartProps {
  itemId: string
  locations?: CityName[]
}

export function PriceHistoryChart({ itemId, locations = ['Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Caerleon'] }: PriceHistoryChartProps) {
  const [timeScale, setTimeScale] = useState(6)
  const { data = [], isLoading } = usePriceHistory([itemId], locations, timeScale)

  const chartData = useMemo(() => {
    const byTime = new Map<string, Record<string, string | number>>()
    data.forEach((series) => {
      series.data?.forEach((point) => {
        const key = point.timestamp
        const row = byTime.get(key) ?? { timestamp: key }
        row[series.location] = point.avg_price
        byTime.set(key, row)
      })
    })
    return Array.from(byTime.values()).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
  }, [data])

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Price History</h3>
        <div className="flex gap-2">
          {[1, 6, 24].map((scale) => (
            <button key={scale} onClick={() => setTimeScale(scale)} className={timeScale === scale ? 'rounded bg-primary px-2 py-1 text-xs text-primary-foreground' : 'rounded bg-secondary px-2 py-1 text-xs'}>{scale}h</button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">Loading history...</div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">No history data available.</div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} fontSize={12} />
              <YAxis tickFormatter={formatCompactNumber} fontSize={12} />
              <Tooltip formatter={(value) => formatCompactNumber(Number(value))} labelFormatter={(value) => new Date(value).toLocaleString()} />
              <Legend />
              {locations.map((city) => <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city]} dot={false} strokeWidth={2} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
