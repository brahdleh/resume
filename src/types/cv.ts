export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  github?: string
}

export interface Summary {
  id: string
  label: string
  content: string
  createdAt: string
}

export interface Achievement {
  id: string
  content: string
  metrics?: string
  tags: string[]
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  achievements: Achievement[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
}

export interface Skill {
  id: string
  name: string
  category: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url?: string
}

export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"

export const DEFAULT_SECTION_ORDER: SectionType[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
]

export interface CVDocument {
  id: string
  name: string
  targetRole?: string
  templateId?: string
  createdAt: string
  updatedAt: string
  selectedSummaryId: string
  selectedExperienceIds: string[]
  selectedAchievementsPerExperience: Record<string, string[]>
  selectedEducationIds: string[]
  selectedSkillIds: string[]
  selectedCertificationIds: string[]
  sectionOrder: SectionType[]
}

export interface CVTemplate {
  id: string
  name: string
  description: string
  genre: string
  createdAt: string
  selectedExperienceIds: string[]
  selectedAchievementsPerExperience: Record<string, string[]>
  selectedSkillIds: string[]
  selectedCertificationIds: string[]
  sectionOrder: SectionType[]
}
