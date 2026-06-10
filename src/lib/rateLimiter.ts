import { RATE_LIMIT_PER_SEC } from '@/lib/constants'

/**
 * Queue-based rate limiter using a sliding window approach.
 * Ensures requests stay within the configured rate (default 2.5/sec),
 * which is safe for both the 180/min and 300/5min API limits.
 */
class RateLimiter {
  private readonly maxPerSecond: number
  private readonly windowMs: number
  private readonly timestamps: number[] = []
  private queue: Array<{
    resolve: (value: Response) => void
    reject: (reason: unknown) => void
    url: string
    options?: RequestInit
  }> = []
  private processing = false

  constructor(maxPerSecond: number = RATE_LIMIT_PER_SEC) {
    this.maxPerSecond = maxPerSecond
    this.windowMs = 1000 // 1 second sliding window
  }

  /**
   * Wraps fetch with rate limiting. Requests are queued and processed
   * at a rate that respects the configured limit.
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      this.queue.push({ resolve, reject, url, options })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      await this.waitForSlot()

      const request = this.queue.shift()
      if (!request) break

      this.timestamps.push(Date.now())

      try {
        const response = await fetch(request.url, request.options)
        request.resolve(response)
      } catch (error) {
        request.reject(error)
      }
    }

    this.processing = false
  }

  /**
   * Waits until a request slot is available in the sliding window.
   * Cleans up old timestamps that have fallen outside the window.
   */
  private async waitForSlot(): Promise<void> {
    while (true) {
      const now = Date.now()
      const windowStart = now - this.windowMs

      // Remove timestamps outside the sliding window
      while (this.timestamps.length > 0 && this.timestamps[0] <= windowStart) {
        this.timestamps.shift()
      }

      // Check if we have capacity
      if (this.timestamps.length < this.maxPerSecond) {
        return
      }

      // Calculate how long to wait until the oldest timestamp exits the window
      const oldestInWindow = this.timestamps[0]
      const waitMs = oldestInWindow + this.windowMs - now + 1
      await this.delay(waitMs)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/** Singleton rate limiter instance */
const rateLimiter = new RateLimiter()

/**
 * Rate-limited fetch wrapper. Drop-in replacement for `fetch()` that
 * ensures requests respect the Albion Data Project API rate limits.
 */
export function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  return rateLimiter.fetch(url, options)
}

export { RateLimiter }
