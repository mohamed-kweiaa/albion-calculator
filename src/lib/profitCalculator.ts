import {
  SETUP_FEE_RATE,
  PREMIUM_TAX_RATE,
  NON_PREMIUM_TAX_RATE,
  NULL_DATE,
} from '@/lib/constants'

export interface FlipProfitResult {
  totalBuyCost: number
  totalSellIncome: number
  profit: number
  profitMargin: number
  perItemProfit: number
  setupFee: number
  salesTax: number
  taxRate: number
}

/**
 * Calculates the profit from a market flip (buy at one price, sell at another).
 *
 * - totalBuyCost includes the 2.5% setup fee on the buy order
 * - totalSellIncome deducts the 2.5% setup fee and the sales tax (4% premium / 8% non-premium)
 */
export function calculateFlipProfit(
  buyPrice: number,
  sellPrice: number,
  isPremium: boolean,
  quantity: number = 1
): FlipProfitResult {
  const taxRate = isPremium ? PREMIUM_TAX_RATE : NON_PREMIUM_TAX_RATE

  const totalBuyCost = buyPrice * quantity * (1 + SETUP_FEE_RATE)
  const totalSellIncome = sellPrice * quantity * (1 - SETUP_FEE_RATE - taxRate)

  const profit = totalSellIncome - totalBuyCost
  const profitMargin = totalBuyCost > 0 ? (profit / totalBuyCost) * 100 : 0
  const perItemProfit = quantity > 0 ? profit / quantity : 0

  const setupFee =
    buyPrice * quantity * SETUP_FEE_RATE +
    sellPrice * quantity * SETUP_FEE_RATE
  const salesTax = sellPrice * quantity * taxRate

  return {
    totalBuyCost,
    totalSellIncome,
    profit,
    profitMargin,
    perItemProfit,
    setupFee,
    salesTax,
    taxRate,
  }
}

/**
 * Returns true only if the price is positive and the date is not the
 * null sentinel value from the API (indicating no data).
 */
export function isValidPrice(price: number, date: string): boolean {
  return price > 0 && date !== NULL_DATE
}

/**
 * Calculates profit for Black Market flips.
 *
 * The Black Market's `buy_price_max` is what the BM pays you when you
 * sell to it, so the income side uses that value. The cost side is the
 * price you pay to buy the item on a regular city market.
 */
export function calculateBlackMarketProfit(
  buyPrice: number,
  bmBuyOrderPrice: number,
  isPremium: boolean,
  quantity: number = 1
): FlipProfitResult {
  const taxRate = isPremium ? PREMIUM_TAX_RATE : NON_PREMIUM_TAX_RATE

  const totalBuyCost = buyPrice * quantity * (1 + SETUP_FEE_RATE)
  const totalSellIncome =
    bmBuyOrderPrice * quantity * (1 - SETUP_FEE_RATE - taxRate)

  const profit = totalSellIncome - totalBuyCost
  const profitMargin = totalBuyCost > 0 ? (profit / totalBuyCost) * 100 : 0
  const perItemProfit = quantity > 0 ? profit / quantity : 0

  const setupFee =
    buyPrice * quantity * SETUP_FEE_RATE +
    bmBuyOrderPrice * quantity * SETUP_FEE_RATE
  const salesTax = bmBuyOrderPrice * quantity * taxRate

  return {
    totalBuyCost,
    totalSellIncome,
    profit,
    profitMargin,
    perItemProfit,
    setupFee,
    salesTax,
    taxRate,
  }
}
