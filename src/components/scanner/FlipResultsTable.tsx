import { useMemo, useState } from 'react'
import { BookOpen, Check, Copy, Star } from 'lucide-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ItemIcon } from '@/components/shared/ItemIcon'
import { SilverDisplay } from '@/components/shared/SilverDisplay'
import { CityBadge } from '@/components/shared/CityBadge'
import { EnchantmentBadge } from '@/components/shared/EnchantmentBadge'
import { QualityBadge } from '@/components/shared/QualityBadge'
import { TransportRiskBadge } from '@/components/shared/TransportRiskBadge'
import { FreshnessBadge } from '@/components/shared/FreshnessBadge'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useFlipHistoryStore } from '@/store/flipHistoryStore'
import type { FlipResult } from '@/types/flip'

interface FlipResultsTableProps {
  results: FlipResult[]
}

const columnHelper = createColumnHelper<FlipResult>()

export function FlipResultsTable({ results }: FlipResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'profit', desc: true }])
  const addWatch = useWatchlistStore((state) => state.addItem)
  const addHistory = useFlipHistoryStore((state) => state.addEntry)

  const columns = useMemo(
    () => [
      columnHelper.accessor('item.name', {
        header: 'Item',
        cell: ({ row }) => {
          const result = row.original
          const searchableName = buildMarketSearchName(result.item.name, result.enchantment)

          return (
            <div className="flex min-w-64 items-center gap-3">
              <ItemIcon itemId={result.itemId} quality={result.quality} size={40} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium" title={searchableName}>
                    {searchableName}
                  </span>
                  <CopyNameButton value={searchableName} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <TierBadge tier={result.item.tier} />
                  <EnchantmentBadge enchantment={result.enchantment} />
                  <QualityBadge quality={result.quality} />
                </div>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('buyPrice', {
        header: 'Buy',
        cell: ({ row }) => (
          <div>
            <CityBadge city={row.original.buyCity} />
            <div>
              <SilverDisplay amount={row.original.buyPrice} />
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('sellPrice', {
        header: 'Sell',
        cell: ({ row }) => (
          <div>
            <CityBadge city={row.original.sellCity} />
            <div>
              <SilverDisplay amount={row.original.sellPrice} />
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('profit', {
        header: 'Profit',
        cell: ({ getValue }) => <SilverDisplay amount={getValue()} showSign className="font-semibold" />,
      }),
      columnHelper.accessor('profitMargin', {
        header: 'Margin',
        cell: ({ getValue }) => (
          <span className={getValue() >= 0 ? 'text-profit' : 'text-loss'}>
            {getValue().toFixed(1)}%
          </span>
        ),
      }),
      columnHelper.accessor('transportRisk', {
        header: 'Risk',
        cell: ({ row }) => <TransportRiskBadge fromCity={row.original.buyCity} toCity={row.original.sellCity} />,
      }),
      columnHelper.accessor('sellDate', {
        header: 'Updated',
        cell: ({ row }) => (
          <FreshnessBadge date={row.original.buyDate < row.original.sellDate ? row.original.buyDate : row.original.sellDate} />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              title="Add to watchlist"
              onClick={() =>
                addWatch({
                  itemId: row.original.item.id,
                  enchantment: row.original.enchantment,
                  quality: row.original.quality,
                  addedAt: Date.now(),
                })
              }
              className="rounded bg-secondary p-1 hover:bg-accent"
            >
              <Star className="h-4 w-4" />
            </button>
            <button
              title="Log flip"
              onClick={() =>
                addHistory({
                  itemId: row.original.itemId,
                  itemName: row.original.item.name,
                  buyCity: row.original.buyCity,
                  sellCity: row.original.sellCity,
                  buyPrice: row.original.buyPrice,
                  sellPrice: row.original.sellPrice,
                  quantity: 1,
                  profit: row.original.profit,
                  totalProfit: row.original.profit,
                })
              }
              className="rounded bg-secondary p-1 hover:bg-accent"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    [addWatch, addHistory],
  )

  const table = useReactTable({
    data: results,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        No profitable flips found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer px-3 py-2 text-left text-xs uppercase text-muted-foreground"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                    {header.column.getIsSorted() === 'asc'
                      ? '↑'
                      : header.column.getIsSorted() === 'desc'
                        ? '↓'
                        : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr key={row.id} className={index % 2 ? 'border-t border-border' : 'border-t border-border bg-muted/20'}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded bg-secondary px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded bg-secondary px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: number }) {
  return (
    <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-300">
      T{tier}
    </span>
  )
}

function CopyNameButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy "${value}"`}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function buildMarketSearchName(name: string, enchantment: number): string {
  const trimmedName = name.replace(
    /\s+(Staff|Bow|Crossbow|Sword|Axe|Dagger|Hammer|Mace|Spear|Quarterstaff|Gloves|Armor|Helmet|Hood|Cowl|Shoes|Boots|Sandals|Cape|Bag|Shield|Torch|Book|Orb|Horn|Totem)$/i,
    '',
  )
  return `${trimmedName}${enchantment > 0 ? ` .${enchantment}` : ''}`
}
