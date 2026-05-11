import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Job, JobRequirement, EvidenceLevel, JobStatus } from "@/types/jobs"

interface JobState {
  jobs: Job[]

  addJob: (data: { title: string; company: string; url?: string; description?: string; status: JobStatus }) => string
  updateJob: (id: string, data: Partial<Omit<Job, "id" | "requirements" | "createdAt" | "updatedAt">>) => void
  deleteJob: (id: string) => void

  addRequirement: (jobId: string, text: string, evidenceLevel?: EvidenceLevel) => string
  updateRequirement: (jobId: string, reqId: string, data: Partial<Omit<JobRequirement, "id">>) => void
  deleteRequirement: (jobId: string, reqId: string) => void
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobs: [],

      addJob: (data) => {
        const id = nanoid()
        const now = new Date().toISOString()
        set((s) => ({
          jobs: [
            ...s.jobs,
            { ...data, id, requirements: [], createdAt: now, updatedAt: now },
          ],
        }))
        return id
      },

      updateJob: (id, data) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id
              ? { ...j, ...data, updatedAt: new Date().toISOString() }
              : j
          ),
        })),

      deleteJob: (id) =>
        set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),

      addRequirement: (jobId, text, evidenceLevel = "none") => {
        const id = nanoid()
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  updatedAt: new Date().toISOString(),
                  requirements: [
                    ...j.requirements,
                    { id, text, evidenceLevel, notes: "" },
                  ],
                }
              : j
          ),
        }))
        return id
      },

      updateRequirement: (jobId, reqId, data) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  updatedAt: new Date().toISOString(),
                  requirements: j.requirements.map((r) =>
                    r.id === reqId ? { ...r, ...data } : r
                  ),
                }
              : j
          ),
        })),

      deleteRequirement: (jobId, reqId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  updatedAt: new Date().toISOString(),
                  requirements: j.requirements.filter((r) => r.id !== reqId),
                }
              : j
          ),
        })),
    }),
    { name: "cv-jobs" }
  )
)
