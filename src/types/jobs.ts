export type EvidenceLevel = "strong" | "weak" | "none"

export type JobStatus = "active" | "applied" | "archived"

export interface JobRequirement {
  id: string
  text: string
  evidenceLevel: EvidenceLevel
}

export interface Job {
  id: string
  title: string
  company: string
  url?: string
  description?: string
  linkedCVId?: string
  requirements: JobRequirement[]
  status: JobStatus
  createdAt: string
  updatedAt: string
}
