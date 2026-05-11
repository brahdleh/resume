import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type {
  PersonalInfo,
  Summary,
  Experience,
  Achievement,
  Skill,
  Education,
  Certification,
} from "@/types/cv"

interface MasterState {
  personalInfo: PersonalInfo
  summaries: Summary[]
  experiences: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]

  updatePersonalInfo: (info: Partial<PersonalInfo>) => void

  addSummary: (label: string, content: string) => string
  updateSummary: (id: string, data: Partial<Omit<Summary, "id" | "createdAt">>) => void
  deleteSummary: (id: string) => void

  addExperience: (data: Omit<Experience, "id" | "achievements">) => string
  updateExperience: (id: string, data: Partial<Omit<Experience, "id" | "achievements">>) => void
  deleteExperience: (id: string) => void
  reorderExperiences: (ids: string[]) => void

  addAchievement: (experienceId: string, content: string, metrics?: string) => string
  updateAchievement: (experienceId: string, id: string, data: Partial<Omit<Achievement, "id">>) => void
  deleteAchievement: (experienceId: string, id: string) => void
  reorderAchievements: (experienceId: string, ids: string[]) => void

  addSkill: (name: string, category: string) => void
  updateSkill: (id: string, data: Partial<Omit<Skill, "id">>) => void
  deleteSkill: (id: string) => void

  addEducation: (data: Omit<Education, "id">) => void
  updateEducation: (id: string, data: Partial<Omit<Education, "id">>) => void
  deleteEducation: (id: string) => void

  addCertification: (data: Omit<Certification, "id">) => void
  updateCertification: (id: string, data: Partial<Omit<Certification, "id">>) => void
  deleteCertification: (id: string) => void
}

const defaultPersonalInfo: PersonalInfo = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set) => ({
      personalInfo: defaultPersonalInfo,
      summaries: [],
      experiences: [],
      education: [],
      skills: [],
      certifications: [],

      updatePersonalInfo: (info) =>
        set((s) => ({ personalInfo: { ...s.personalInfo, ...info } })),

      addSummary: (label, content) => {
        const id = nanoid()
        set((s) => ({
          summaries: [
            ...s.summaries,
            { id, label, content, createdAt: new Date().toISOString() },
          ],
        }))
        return id
      },
      updateSummary: (id, data) =>
        set((s) => ({
          summaries: s.summaries.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteSummary: (id) =>
        set((s) => ({ summaries: s.summaries.filter((x) => x.id !== id) })),

      addExperience: (data) => {
        const id = nanoid()
        set((s) => ({
          experiences: [...s.experiences, { ...data, id, achievements: [] }],
        }))
        return id
      },
      updateExperience: (id, data) =>
        set((s) => ({
          experiences: s.experiences.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteExperience: (id) =>
        set((s) => ({
          experiences: s.experiences.filter((x) => x.id !== id),
        })),
      reorderExperiences: (ids) =>
        set((s) => ({
          experiences: ids
            .map((id) => s.experiences.find((e) => e.id === id))
            .filter(Boolean) as Experience[],
        })),

      addAchievement: (experienceId, content, metrics) => {
        const id = nanoid()
        set((s) => ({
          experiences: s.experiences.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  achievements: [
                    ...exp.achievements,
                    { id, content, metrics: metrics ?? "", tags: [] },
                  ],
                }
              : exp
          ),
        }))
        return id
      },
      updateAchievement: (experienceId, id, data) =>
        set((s) => ({
          experiences: s.experiences.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  achievements: exp.achievements.map((a) =>
                    a.id === id ? { ...a, ...data } : a
                  ),
                }
              : exp
          ),
        })),
      deleteAchievement: (experienceId, id) =>
        set((s) => ({
          experiences: s.experiences.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  achievements: exp.achievements.filter((a) => a.id !== id),
                }
              : exp
          ),
        })),
      reorderAchievements: (experienceId, ids) =>
        set((s) => ({
          experiences: s.experiences.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  achievements: ids
                    .map((id) => exp.achievements.find((a) => a.id === id))
                    .filter(Boolean) as Achievement[],
                }
              : exp
          ),
        })),

      addSkill: (name, category) =>
        set((s) => ({
          skills: [...s.skills, { id: nanoid(), name, category }],
        })),
      updateSkill: (id, data) =>
        set((s) => ({
          skills: s.skills.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteSkill: (id) =>
        set((s) => ({ skills: s.skills.filter((x) => x.id !== id) })),

      addEducation: (data) =>
        set((s) => ({
          education: [...s.education, { ...data, id: nanoid() }],
        })),
      updateEducation: (id, data) =>
        set((s) => ({
          education: s.education.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteEducation: (id) =>
        set((s) => ({ education: s.education.filter((x) => x.id !== id) })),

      addCertification: (data) =>
        set((s) => ({
          certifications: [...s.certifications, { ...data, id: nanoid() }],
        })),
      updateCertification: (id, data) =>
        set((s) => ({
          certifications: s.certifications.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteCertification: (id) =>
        set((s) => ({
          certifications: s.certifications.filter((x) => x.id !== id),
        })),
    }),
    { name: "cv-master" }
  )
)
