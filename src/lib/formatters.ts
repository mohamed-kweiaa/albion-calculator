import { NULL_DATE } from '@/lib/constants'

/**
 * Formats a silver amount with comma separators.
 * e.g., 1234567 -> "1,234,567"
 */
export function formatSilver(amount: number): string {
  return Math.round(amount).toLocaleString('en-US')
}

/**
 * Returns a human-readable "time ago" string from an ISO date string.
 * Returns "No data" for null/empty dates from the API.
 */
export function formatTimeAgo(dateStr: string): string {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return 'No data'

  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  if (diffMs < 0) return 'Just now'

  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) {
    const remainingMinutes = minutes - hours * 60
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m ago`
      : `${hours}h ago`
  }
  const remainingHours = hours - days * 24
  return remainingHours > 0
    ? `${days}d ${remainingHours}h ago`
    : `${days}d ago`
}

/**
 * Returns a freshness color based on how old the data is.
 * <1h green, 1-6h yellow, 6-24h orange, >24h red
 */
export function getFreshnessColor(
  dateStr: string
): 'green' | 'yellow' | 'orange' | 'red' {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return 'red'

  const diffMs = Date.now() - new Date(dateStr).getTime()
  const hours = diffMs / 3_600_000

  if (hours < 1) return 'green'
  if (hours < 6) return 'yellow'
  if (hours < 24) return 'orange'
  return 'red'
}

export function getDataAgeMs(dateStr: string): number {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return Number.POSITIVE_INFINITY
  const timestamp = new Date(dateStr).getTime()
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY
  return Date.now() - timestamp
}

/**
 * Formats a number as a percentage string with sign.
 * e.g., 12.5 -> "+12.5%", -3.2 -> "-3.2%"
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Formats a number in compact notation.
 * e.g., 1_200_000 -> "1.2M", 450_000 -> "450K", 500 -> "500"
 */
export function formatCompactNumber(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000
    return `${sign}${parseFloat(val.toFixed(1))}M`
  }
  if (abs >= 1_000) {
    const val = abs / 1_000
    return `${sign}${parseFloat(val.toFixed(1))}K`
  }
  return `${sign}${Math.round(abs)}`
}
