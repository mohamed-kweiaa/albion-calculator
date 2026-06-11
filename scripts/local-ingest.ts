import { readFile } from 'node:fs/promises'

const filePath = process.argv[2]
const localApiUrl = process.env.LOCAL_MARKET_URL ?? 'http://localhost:8787'

if (!filePath) {
  console.error('Usage: npm run local-ingest -- path/to/prices.json')
  process.exit(1)
}

const body = await readFile(filePath, 'utf8')
const response = await fetch(`${localApiUrl.replace(/\/$/, '')}/ingest/prices`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body,
})

if (!response.ok) {
  console.error(`Ingest failed: ${response.status} ${response.statusText}`)
  console.error(await response.text())
  process.exit(1)
}

console.log(await response.text())
