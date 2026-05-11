import { useFormatStore, DEFAULT_FORMAT, type FormatSettings } from "@/store/formatStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable controls
// ─────────────────────────────────────────────────────────────────────────────

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step = 0.5,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
        className="w-24 text-right tabular-nums"
      />
    </div>
  )
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 font-mono text-xs"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
      {children}
    </h2>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function Formatting() {
  const { settings, update, reset } = useFormatStore()

  function set<K extends keyof FormatSettings>(key: K, value: FormatSettings[K]) {
    update({ [key]: value })
  }

  function handleReset() {
    reset()
    toast.success("Formatting reset to defaults")
  }

  // Convert pt to cm for margin display (1 cm = 28.3465 pt)
  const ptToCm = (pt: number) => +(pt / 28.3465).toFixed(2)
  const cmToPt = (cm: number) => +(cm * 28.3465).toFixed(1)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Formatting</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Controls how exported PDFs look. Changes take effect immediately on the next export.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcwIcon data-icon="inline-start" />
          Reset defaults
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-6 flex flex-col gap-4">

          {/* ── Margins ──────────────────────────────────────────────────── */}
          <SectionHeading>Page margins (cm)</SectionHeading>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <NumberField
              label="Top"
              value={ptToCm(settings.marginTop)}
              min={0} max={5} step={0.05}
              onChange={(v) => set("marginTop", cmToPt(v))}
            />
            <NumberField
              label="Bottom"
              value={ptToCm(settings.marginBottom)}
              min={0} max={5} step={0.05}
              onChange={(v) => set("marginBottom", cmToPt(v))}
            />
            <NumberField
              label="Left"
              value={ptToCm(settings.marginLeft)}
              min={0} max={5} step={0.05}
              onChange={(v) => set("marginLeft", cmToPt(v))}
            />
            <NumberField
              label="Right"
              value={ptToCm(settings.marginRight)}
              min={0} max={5} step={0.05}
              onChange={(v) => set("marginRight", cmToPt(v))}
            />
          </div>

          <Separator />

          {/* ── Font sizes ───────────────────────────────────────────────── */}
          <SectionHeading>Font sizes (pt)</SectionHeading>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <NumberField
              label="Name / title"
              hint="Large name at the top of the CV"
              value={settings.fontSizeName}
              min={14} max={40} step={0.5}
              onChange={(v) => set("fontSizeName", v)}
            />
            <NumberField
              label="Body text"
              hint="Section headers, role titles, bullets, and all body copy"
              value={settings.fontSizeBody}
              min={7} max={14} step={0.5}
              onChange={(v) => set("fontSizeBody", v)}
            />
            <NumberField
              label="Contact / header details"
              hint="Email, phone, location shown under your name"
              value={settings.fontSizeContact}
              min={7} max={14} step={0.5}
              onChange={(v) => set("fontSizeContact", v)}
            />
          </div>

          <Separator />

          {/* ── Colours ──────────────────────────────────────────────────── */}
          <SectionHeading>Colours</SectionHeading>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <ColorField
              label="Primary text"
              hint="Name, section headers, body copy"
              value={settings.colorText}
              onChange={(v) => set("colorText", v)}
            />
            <ColorField
              label="Muted text"
              hint="Dates, company names, contact details"
              value={settings.colorMuted}
              onChange={(v) => set("colorMuted", v)}
            />
            <ColorField
              label="Section rule"
              hint="Underline drawn below section header titles"
              value={settings.colorSectionRule}
              onChange={(v) => set("colorSectionRule", v)}
            />
          </div>

          <Separator />

          {/* ── Spacing ──────────────────────────────────────────────────── */}
          <SectionHeading>Spacing (pt)</SectionHeading>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <NumberField
              label="Gap between sections"
              value={settings.sectionGap}
              min={0} max={30} step={1}
              onChange={(v) => set("sectionGap", v)}
            />
            <NumberField
              label="Gap before Summary"
              hint="Extra top spacing before the Summary section header"
              value={settings.summaryTopGap}
              min={0} max={30} step={1}
              onChange={(v) => set("summaryTopGap", v)}
            />
            <NumberField
              label="Gap between experience entries"
              value={settings.expItemGap}
              min={0} max={20} step={0.5}
              onChange={(v) => set("expItemGap", v)}
            />
            <NumberField
              label="Bullet line height"
              hint="Multiplier — 1.0 = single spaced, 1.5 = one-and-a-half"
              value={settings.bulletLineHeight}
              min={1} max={2.5} step={0.05}
              onChange={(v) => set("bulletLineHeight", v)}
            />
            <NumberField
              label="Body line height"
              hint="Applies to the Summary paragraph"
              value={settings.lineHeight}
              min={1} max={2.5} step={0.05}
              onChange={(v) => set("lineHeight", v)}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
