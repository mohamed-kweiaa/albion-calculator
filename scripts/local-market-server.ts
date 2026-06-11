import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { MarketPrice } from '../src/types/market'

const PORT = Number(process.env.LOCAL_MARKET_PORT ?? 8787)
const DATA_DIR = path.resolve(process.cwd(), 'local-data')
const PRICE_FILE = path.join(DATA_DIR, 'prices.json')
const NULL_DATE = '0001-01-01T00:00:00'

type PriceKey = string

type StoredPriceMap = Record<PriceKey, MarketPrice>

function keyOf(price: Pick<MarketPrice, 'item_id' | 'city' | 'quality'>): PriceKey {
  return `${price.item_id}|${price.city}|${price.quality}`
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true })
  if (!existsSync(PRICE_FILE)) await writeFile(PRICE_FILE, '{}', 'utf8')
}

async function readPrices(): Promise<StoredPriceMap> {
  await ensureStore()
  return JSON.parse(await readFile(PRICE_FILE, 'utf8')) as StoredPriceMap
}

async function writePrices(prices: StoredPriceMap) {
  await ensureStore()
  await writeFile(PRICE_FILE, JSON.stringify(prices, null, 2), 'utf8')
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  })
  res.end(JSON.stringify(body))
}

function parseQuery(url: URL, name: string): string[] {
  return (url.searchParams.get(name) ?? '')
    .split(',')
    .map((value) => decodeURIComponent(value.trim()))
    .filter(Boolean)
}

function emptyPrice(itemId: string, city: string, quality: number): MarketPrice {
  return {
    item_id: itemId,
    city,
    quality,
    sell_price_min: 0,
    sell_price_min_date: NULL_DATE,
    sell_price_max: 0,
    sell_price_max_date: NULL_DATE,
    buy_price_min: 0,
    buy_price_min_date: NULL_DATE,
    buy_price_max: 0,
    buy_price_max_date: NULL_DATE,
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function handlePricesGet(url: URL, res: ServerResponse) {
  const match = url.pathname.match(/^\/api\/v2\/stats\/prices\/(.+)\.json$/)
  if (!match) return false

  const itemIds = decodeURIComponent(match[1]).split(',').filter(Boolean)
  const locations = parseQuery(url, 'locations')
  const qualities = parseQuery(url, 'qualities').map(Number).filter(Boolean)
  const store = await readPrices()
  const result: MarketPrice[] = []

  for (const itemId of itemIds) {
    for (const city of locations) {
      for (const quality of qualities) {
        result.push(store[keyOf({ item_id: itemId, city, quality })] ?? emptyPrice(itemId, city, quality))
      }
    }
  }

  sendJson(res, 200, result)
  return true
}

async function handleIngest(req: IncomingMessage, res: ServerResponse) {
  const body = await readBody(req)
  const incoming = JSON.parse(body) as MarketPrice[]
  const store = await readPrices()

  for (const price of incoming) {
    store[keyOf(price)] = price
  }

  await writePrices(store)
  sendJson(res, 200, { ok: true, stored: incoming.length, total: Object.keys(store).length })
}

const server = createServer(async (req, res) => {
  try {
    res.setHeader('access-control-allow-origin', '*')
    res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS')
    res.setHeader('access-control-allow-headers', 'content-type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true, dataFile: PRICE_FILE })
      return
    }

    if (req.method === 'GET' && (await handlePricesGet(url, res))) return

    if (req.method === 'POST' && url.pathname === '/ingest/prices') {
      await handleIngest(req, res)
      return
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
  }
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying ${PORT + 1}...`)
    const nextPort = PORT + 1
    server.listen(nextPort, () => {
      console.log(`Local Albion market cache listening on http://localhost:${nextPort}`)
      console.log(`GET  /api/v2/stats/prices/{itemIds}.json?locations=...&qualities=...`)
      console.log(`POST /ingest/prices with Albion Data Project MarketPrice[] JSON`)
      console.log(`\nUpdate your app settings: Local API URL = http://localhost:${nextPort}`)
    })
    return
  }
  throw error
})

server.listen(PORT, () => {
  console.log(`Local Albion market cache listening on http://localhost:${PORT}`)
  console.log(`GET  /api/v2/stats/prices/{itemIds}.json?locations=...&qualities=...`)
  console.log(`POST /ingest/prices with Albion Data Project MarketPrice[] JSON`)
})
