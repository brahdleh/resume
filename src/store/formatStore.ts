import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface FormatSettings {
  // Page margins (pt — 1 cm ≈ 28.35 pt)
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number

  // Font sizes (pt)
  fontSizeName: number
  fontSizeBody: number
  fontSizeContact: number

  // Colours
  colorText: string
  colorMuted: string
  colorSectionRule: string

  // Spacing (pt)
  sectionGap: number          // gap between sections
  sectionHeaderGap: number    // gap below each section header title
  summaryTopGap: number       // extra gap before summary header
  expItemGap: number          // gap between experience entries
  bulletLineHeight: number    // line height multiplier for bullet text
  lineHeight: number          // line height for summary / general body
}

export const DEFAULT_FORMAT: FormatSettings = {
  marginTop: 42,
  marginBottom: 37,
  marginLeft: 37,
  marginRight: 57,

  fontSizeName: 25,
  fontSizeBody: 11,
  fontSizeContact: 11,

  colorText: "#1a1a1a",
  colorMuted: "#555555",
  colorSectionRule: "#999999",

  sectionGap: 10,
  sectionHeaderGap: 5,
  summaryTopGap: 10,
  expItemGap: 9,
  bulletLineHeight: 1.35,
  lineHeight: 1.4,
}

interface FormatState {
  settings: FormatSettings
  update: (patch: Partial<FormatSettings>) => void
  reset: () => void
}

export const useFormatStore = create<FormatState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_FORMAT },
      update: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      reset: () => set({ settings: { ...DEFAULT_FORMAT } }),
    }),
    { name: "cv-format" }
  )
)
