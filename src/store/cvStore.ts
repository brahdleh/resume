import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { DEFAULT_SECTION_ORDER, type CVDocument, type SectionType } from "@/types/cv"

interface CVState {
  documents: CVDocument[]
  activeId: string | null

  createDocument: (name: string, targetRole?: string) => string
  updateDocument: (id: string, data: Partial<CVDocument>) => void
  deleteDocument: (id: string) => void
  setActiveId: (id: string | null) => void
  duplicateDocument: (id: string) => string

  toggleExperience: (docId: string, expId: string, allAchievementIds: string[]) => void
  toggleAchievement: (docId: string, expId: string, achId: string) => void
  selectAllAchievements: (docId: string, expId: string, achIds: string[]) => void
  toggleSkill: (docId: string, skillId: string) => void
  toggleEducation: (docId: string, eduId: string) => void
  toggleCertification: (docId: string, certId: string) => void
  setSummary: (docId: string, summaryId: string) => void
  reorderSections: (docId: string, order: SectionType[]) => void
  reorderDocumentAchievements: (docId: string, expId: string, ids: string[]) => void
  applyTemplateToDocument: (docId: string, patch: Partial<CVDocument>) => void
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      documents: [],
      activeId: null,

      createDocument: (name, targetRole) => {
        const id = nanoid()
        const now = new Date().toISOString()
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id,
              name,
              targetRole,
              createdAt: now,
              updatedAt: now,
              selectedSummaryId: "",
              selectedExperienceIds: [],
              selectedAchievementsPerExperience: {},
              selectedEducationIds: [],
              selectedSkillIds: [],
              selectedCertificationIds: [],
              sectionOrder: [...DEFAULT_SECTION_ORDER],
            },
          ],
          activeId: id,
        }))
        return id
      },

      updateDocument: (id, data) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id
              ? { ...d, ...data, updatedAt: new Date().toISOString() }
              : d
          ),
        })),

      deleteDocument: (id) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),

      setActiveId: (id) => set({ activeId: id }),

      duplicateDocument: (id) => {
        const newId = nanoid()
        const now = new Date().toISOString()
        set((s) => {
          const original = s.documents.find((d) => d.id === id)
          if (!original) return s
          return {
            documents: [
              ...s.documents,
              {
                ...original,
                id: newId,
                name: `${original.name} (copy)`,
                createdAt: now,
                updatedAt: now,
                templateId: undefined,
              },
            ],
            activeId: newId,
          }
        })
        return newId
      },

      toggleExperience: (docId, expId, allAchievementIds) =>
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d
            const included = d.selectedExperienceIds.includes(expId)
            const { [expId]: _removed, ...restAch } =
              d.selectedAchievementsPerExperience
            return {
              ...d,
              updatedAt: new Date().toISOString(),
              selectedExperienceIds: included
                ? d.selectedExperienceIds.filter((x) => x !== expId)
                : [...d.selectedExperienceIds, expId],
              selectedAchievementsPerExperience: included
                ? restAch
                : {
                    ...d.selectedAchievementsPerExperience,
                    [expId]: allAchievementIds,
                  },
            }
          }),
        })),

      toggleAchievement: (docId, expId, achId) =>
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d
            const current =
              d.selectedAchievementsPerExperience[expId] ?? []
            const included = current.includes(achId)
            return {
              ...d,
              updatedAt: new Date().toISOString(),
              selectedAchievementsPerExperience: {
                ...d.selectedAchievementsPerExperience,
                [expId]: included
                  ? current.filter((x) => x !== achId)
                  : [...current, achId],
              },
            }
          }),
        })),

      selectAllAchievements: (docId, expId, achIds) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id !== docId
              ? d
              : {
                  ...d,
                  updatedAt: new Date().toISOString(),
                  selectedAchievementsPerExperience: {
                    ...d.selectedAchievementsPerExperience,
                    [expId]: achIds,
                  },
                }
          ),
        })),

      toggleSkill: (docId, skillId) =>
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d
            const included = d.selectedSkillIds.includes(skillId)
            return {
              ...d,
              updatedAt: new Date().toISOString(),
              selectedSkillIds: included
                ? d.selectedSkillIds.filter((x) => x !== skillId)
                : [...d.selectedSkillIds, skillId],
            }
          }),
        })),

      toggleEducation: (docId, eduId) =>
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d
            const included = d.selectedEducationIds.includes(eduId)
            return {
              ...d,
              updatedAt: new Date().toISOString(),
              selectedEducationIds: included
                ? d.selectedEducationIds.filter((x) => x !== eduId)
                : [...d.selectedEducationIds, eduId],
            }
          }),
        })),

      toggleCertification: (docId, certId) =>
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.id !== docId) return d
            const included = d.selectedCertificationIds.includes(certId)
            return {
              ...d,
              updatedAt: new Date().toISOString(),
              selectedCertificationIds: included
                ? d.selectedCertificationIds.filter((x) => x !== certId)
                : [...d.selectedCertificationIds, certId],
            }
          }),
        })),

      setSummary: (docId, summaryId) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  selectedSummaryId: summaryId,
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        })),

      reorderSections: (docId, order) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === docId
              ? { ...d, sectionOrder: order, updatedAt: new Date().toISOString() }
              : d
          ),
        })),

      reorderDocumentAchievements: (docId, expId, ids) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  updatedAt: new Date().toISOString(),
                  selectedAchievementsPerExperience: {
                    ...d.selectedAchievementsPerExperience,
                    [expId]: ids,
                  },
                }
              : d
          ),
        })),

      applyTemplateToDocument: (docId, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === docId
              ? { ...d, ...patch, updatedAt: new Date().toISOString() }
              : d
          ),
        })),
    }),
    { name: "cv-documents" }
  )
)
