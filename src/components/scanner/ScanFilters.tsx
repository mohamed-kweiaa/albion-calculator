import { CITIES, ENCHANTMENTS, QUALITY_NAMES, TIERS } from '@/lib/constants'
import { useScanPresetsStore } from '@/store/scanPresetsStore'
import type { CityName, QualityLevel } from '@/types/market'

interface ScanFiltersProps {
  buyCities: CityName[]; setBuyCities: (value: CityName[]) => void
  sellCities: CityName[]; setSellCities: (value: CityName[]) => void
  tiers: number[]; setTiers: (value: number[]) => void
  enchantments: number[]; setEnchantments: (value: number[]) => void
  qualities: QualityLevel[]; setQualities: (value: QualityLevel[]) => void
  minProfit: number; setMinProfit: (value: number) => void
  minMargin: number; setMinMargin: (value: number) => void
  maxDataAgeHours: number | null; setMaxDataAgeHours: (value: number | null) => void
}

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value]
}

export function ScanFilters(props: ScanFiltersProps) {
  const presets = useScanPresetsStore((state) => state.presets)
  const addPreset = useScanPresetsStore((state) => state.addPreset)

  const applyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId)
    if (!preset) return
    props.setBuyCities(preset.buyCities)
    props.setSellCities(preset.sellCities)
    props.setTiers(preset.tiers)
    props.setEnchantments(preset.enchantments)
    props.setQualities(preset.qualities)
    props.setMinProfit(preset.minProfit)
    props.setMinMargin(preset.minMargin)
  }

  const saveCurrent = () => {
    const name = window.prompt('Preset name')?.trim()
    if (!name) return
    addPreset({
      name,
      buyCities: props.buyCities,
      sellCities: props.sellCities,
      tiers: props.tiers,
      enchantments: props.enchantments,
      qualities: props.qualities,
      minProfit: props.minProfit,
      minMargin: props.minMargin,
      itemCategory: 'equipment',
    })
  }

  return (
    <details open className="rounded-lg border border-border bg-card p-4">
      <summary className="cursor-pointer font-semibold">Filters & Presets</summary>
      <div className="mt-4 space-y-5">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => <button key={preset.id} onClick={() => applyPreset(preset.id)} className="rounded bg-secondary px-3 py-1 text-xs hover:bg-accent">{preset.name}</button>)}
          <button onClick={saveCurrent} className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground">Save Current</button>
        </div>
        <CityPicker title="Buy From Cities" values={props.buyCities} setValues={props.setBuyCities} />
        <CityPicker title="Sell To Cities" values={props.sellCities} setValues={props.setSellCities} />
        <ToggleGroup title="Tiers" values={props.tiers} options={[...TIERS]} label={(value) => `T${value}`} setValues={props.setTiers} />
        <ToggleGroup title="Enchantments" values={props.enchantments} options={[...ENCHANTMENTS]} label={(value) => `.${value}`} setValues={props.setEnchantments} />
        <ToggleGroup title="Qualities" values={props.qualities} options={[1, 2, 3, 4, 5] as QualityLevel[]} label={(value) => QUALITY_NAMES[value]} setValues={props.setQualities} />
        <div>
          <div className="mb-2 text-sm font-medium">Max Data Age</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '1h', value: 1 },
              { label: '6h', value: 6 },
              { label: '24h', value: 24 },
              { label: 'Any age', value: null },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => props.setMaxDataAgeHours(option.value)}
                className={props.maxDataAgeHours === option.value ? 'rounded bg-primary px-2 py-1 text-xs text-primary-foreground' : 'rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground'}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Both buy and sell prices must be newer than this.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Min Profit<input type="number" value={props.minProfit} onChange={(event) => props.setMinProfit(Number(event.target.value) || 0)} className="mt-2 h-9 w-full rounded border border-input bg-background px-3" /></label>
          <label className="text-sm font-medium">Min Margin %<input type="number" value={props.minMargin} onChange={(event) => props.setMinMargin(Number(event.target.value) || 0)} className="mt-2 h-9 w-full rounded border border-input bg-background px-3" /></label>
        </div>
      </div>
    </details>
  )
}

function CityPicker({ title, values, setValues }: { title: string; values: CityName[]; setValues: (value: CityName[]) => void }) {
  return <div><div className="mb-2 flex items-center gap-2 text-sm font-medium">{title}<button className="text-xs text-muted-foreground underline" onClick={() => setValues([...CITIES])}>Select All</button><button className="text-xs text-muted-foreground underline" onClick={() => setValues([])}>Clear</button></div><div className="flex flex-wrap gap-2">{CITIES.map((city) => <label key={city} className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"><input type="checkbox" checked={values.includes(city)} onChange={() => setValues(toggle(values, city))} />{city}</label>)}</div></div>
}

function ToggleGroup<T>({ title, values, options, label, setValues }: { title: string; values: T[]; options: T[]; label: (value: T) => string; setValues: (value: T[]) => void }) {
  return <div><div className="mb-2 text-sm font-medium">{title}</div><div className="flex flex-wrap gap-2">{options.map((option) => <button key={String(option)} onClick={() => setValues(toggle(values, option))} className={values.includes(option) ? 'rounded bg-primary px-2 py-1 text-xs text-primary-foreground' : 'rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground'}>{label(option)}</button>)}</div></div>
}
