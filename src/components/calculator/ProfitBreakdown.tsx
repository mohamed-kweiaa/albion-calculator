import { calculateBlackMarketProfit, calculateFlipProfit } from '@/lib/profitCalculator'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import { formatPercent } from '@/lib/formatters'

interface ProfitBreakdownProps {
  buyPrice: number
  sellPrice: number
  isPremium: boolean
  quantity: number
  isBlackMarket?: boolean
}

export function ProfitBreakdown({ buyPrice, sellPrice, isPremium, quantity, isBlackMarket = false }: ProfitBreakdownProps) {
  const result = isBlackMarket
    ? calculateBlackMarketProfit(buyPrice, sellPrice, isPremium, quantity)
    : calculateFlipProfit(buyPrice, sellPrice, isPremium, quantity)
  const buySetupFee = buyPrice * quantity * 0.025
  const sellSetupFee = sellPrice * quantity * 0.025

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Profit Breakdown</h3>
      <div className="space-y-2 text-sm">
        <Row label="Buy Price" value={<SilverDisplay amount={buyPrice * quantity} />} />
        <Row label="Buy Setup Fee (2.5%)" value={<SilverDisplay amount={buySetupFee} />} />
        <Row label="Total Buy Cost" value={<SilverDisplay amount={result.totalBuyCost} className="font-semibold" />} />
        <div className="my-3 border-t border-border" />
        <Row label={isBlackMarket ? 'Black Market Buy Order' : 'Sell Price'} value={<SilverDisplay amount={sellPrice * quantity} />} />
        <Row label="Sell Setup Fee (2.5%)" value={<SilverDisplay amount={sellSetupFee} />} />
        <Row label={`Sales Tax (${isPremium ? '4' : '8'}%)`} value={<SilverDisplay amount={result.salesTax} />} />
        <Row label="Total Sell Income" value={<SilverDisplay amount={result.totalSellIncome} className="font-semibold" />} />
        <div className="my-3 border-t border-border" />
        <Row label="Profit" value={<SilverDisplay amount={result.profit} showSign className="text-lg font-bold" />} />
        <Row label="Profit Margin" value={<span className={result.profit >= 0 ? 'text-profit' : 'text-loss'}>{formatPercent(result.profitMargin)}</span>} />
        {quantity > 1 && <Row label="Per Item Profit" value={<SilverDisplay amount={result.perItemProfit} showSign />} />}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>
}
