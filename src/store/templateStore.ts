import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import {
  DEFAULT_SECTION_ORDER,
  type CVDocument,
  type CVTemplate,
} from "@/types/cv"

interface TemplateState {
  templates: CVTemplate[]
  createTemplate: (
    name: string,
    description: string,
    genre: string,
    from: Partial<CVDocument>
  ) => string
  updateTemplate: (id: string, data: Partial<Omit<CVTemplate, "id" | "createdAt">>) => void
  deleteTemplate: (id: string) => void
  buildDocumentPatch: (template: CVTemplate) => Partial<CVDocument>
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],

      createTemplate: (name, description, genre, from) => {
        const id = nanoid()
        set((s) => ({
          templates: [
            ...s.templates,
            {
              id,
              name,
              description,
              genre,
              createdAt: new Date().toISOString(),
              selectedExperienceIds: from.selectedExperienceIds ?? [],
              selectedAchievementsPerExperience:
                from.selectedAchievementsPerExperience ?? {},
              selectedSkillIds: from.selectedSkillIds ?? [],
              selectedCertificationIds: from.selectedCertificationIds ?? [],
              sectionOrder: from.sectionOrder ?? [...DEFAULT_SECTION_ORDER],
            },
          ],
        }))
        return id
      },

      updateTemplate: (id, data) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),

      buildDocumentPatch: (template) => ({
        selectedExperienceIds: [...template.selectedExperienceIds],
        selectedAchievementsPerExperience: {
          ...template.selectedAchievementsPerExperience,
        },
        selectedSkillIds: [...template.selectedSkillIds],
        selectedCertificationIds: [...template.selectedCertificationIds],
        sectionOrder: [...template.sectionOrder],
        templateId: template.id,
      }),
    }),
    { name: "cv-templates" }
  )
)
