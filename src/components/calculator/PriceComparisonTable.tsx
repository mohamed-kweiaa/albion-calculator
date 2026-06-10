import { CITIES } from '@/lib/constants'
import { isValidPrice } from '@/lib/profitCalculator'
import { useMarketPrices } from '@/hooks/useMarketPrices'
import { CityBadge } from '@/components/shared/CityBadge'
import { FreshnessBadge } from '@/components/shared/FreshnessBadge'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import type { CityName } from '@/types/market'

interface PriceComparisonTableProps {
  itemId: string
  quality: number
}

function priceCell(price: number, date: string) {
  return isValidPrice(price, date) ? <SilverDisplay amount={price} /> : <span className="text-muted-foreground">-</span>
}

export function PriceComparisonTable({ itemId, quality }: PriceComparisonTableProps) {
  const { data = [], isLoading } = useMarketPrices([itemId], CITIES, [quality])

  const bestBuy = data
    .filter((price) => isValidPrice(price.sell_price_min, price.sell_price_min_date))
    .sort((a, b) => a.sell_price_min - b.sell_price_min)[0]
  const bestSell = data
    .map((price) => ({
      ...price,
      effectiveSell: price.city === 'Black Market' ? price.buy_price_max : price.sell_price_min,
      effectiveDate: price.city === 'Black Market' ? price.buy_price_max_date : price.sell_price_min_date,
    }))
    .filter((price) => isValidPrice(price.effectiveSell, price.effectiveDate))
    .sort((a, b) => b.effectiveSell - a.effectiveSell)[0]

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">City</th>
            <th className="px-3 py-2">Sell Min</th>
            <th className="px-3 py-2">Sell Max</th>
            <th className="px-3 py-2">Buy Min</th>
            <th className="px-3 py-2">Buy Max</th>
            <th className="px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && CITIES.map((city) => (
            <tr key={city} className="border-t border-border">
              <td colSpan={6} className="px-3 py-3 text-muted-foreground">Loading {city}...</td>
            </tr>
          ))}
          {!isLoading && CITIES.map((city) => {
            const row = data.find((entry) => entry.city === city)
            const isBestBuy = row?.city === bestBuy?.city
            const isBestSell = row?.city === bestSell?.city
            return (
              <tr key={city} className={isBestBuy || isBestSell ? 'border-t border-border bg-green-500/5' : 'border-t border-border'}>
                <td className="px-3 py-2"><CityBadge city={city as CityName} /></td>
                <td className="px-3 py-2">{row ? priceCell(row.sell_price_min, row.sell_price_min_date) : '-'}</td>
                <td className="px-3 py-2">{row ? priceCell(row.sell_price_max, row.sell_price_max_date) : '-'}</td>
                <td className="px-3 py-2">{row ? priceCell(row.buy_price_min, row.buy_price_min_date) : '-'}</td>
                <td className="px-3 py-2">{row ? priceCell(row.buy_price_max, row.buy_price_max_date) : '-'}</td>
                <td className="px-3 py-2">{row ? <FreshnessBadge date={row.sell_price_min_date !== '0001-01-01T00:00:00' ? row.sell_price_min_date : row.buy_price_max_date} /> : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
