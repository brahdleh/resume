import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  PlusIcon,
  Trash2Icon,
  ExternalLinkIcon,
  LinkIcon,
  UnlinkIcon,
  PencilIcon,
  WrenchIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleIcon,
  ClipboardListIcon,
} from "lucide-react"
import { useJobStore } from "@/store/jobStore"
import { useCVStore } from "@/store/cvStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JobDialog } from "@/components/jobs/JobDialog"
import { RequirementsPanel } from "@/components/jobs/RequirementsPanel"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Job, JobStatus } from "@/types/jobs"

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  applied: {
    label: "Applied",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  archived: {
    label: "Archived",
    className: "bg-muted/80 text-muted-foreground border-border",
  },
}

function EvidenceSummaryBar({ job }: { job: Job }) {
  const total = job.requirements.length
  if (total === 0) return <span className="text-xs text-muted-foreground">No requirements</span>

  const strong = job.requirements.filter((r) => r.evidenceLevel === "strong").length
  const weak = job.requirements.filter((r) => r.evidenceLevel === "weak").length
  const none = total - strong - weak

  return (
    <div className="flex items-center gap-2 text-xs">
      {strong > 0 && (
        <span className="flex items-center gap-0.5 text-green-600">
          <CheckCircle2Icon className="size-3" />
          {strong}
        </span>
      )}
      {weak > 0 && (
        <span className="flex items-center gap-0.5 text-amber-600">
          <CircleDashedIcon className="size-3" />
          {weak}
        </span>
      )}
      {none > 0 && (
        <span className="flex items-center gap-0.5 text-muted-foreground">
          <CircleIcon className="size-3" />
          {none}
        </span>
      )}
      <span className="text-muted-foreground">/ {total} reqs</span>
    </div>
  )
}

export function Jobs() {
  const navigate = useNavigate()
  const { jobs, addJob, updateJob, deleteJob, addRequirement, updateRequirement, deleteRequirement } =
    useJobStore()
  const { documents, createDocument, setActiveId } = useCVStore()

  const [selectedId, setSelectedId] = useState<string | null>(
    jobs.length > 0 ? jobs[0].id : null
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const selected = jobs.find((j) => j.id === selectedId) ?? null

  const handleAdd = (data: Parameters<typeof addJob>[0]) => {
    const id = addJob(data)
    setSelectedId(id)
    toast.success("Job added")
  }

  const handleDelete = (id: string) => {
    deleteJob(id)
    if (selectedId === id) {
      const remaining = jobs.filter((j) => j.id !== id)
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    }
    toast.success("Job removed")
  }

  const handleCreateAndLinkCV = () => {
    if (!selected) return
    const id = createDocument(
      `${selected.title} @ ${selected.company}`,
      selected.title
    )
    updateJob(selected.id, { linkedCVId: id })
    toast.success("New CV created and linked")
    setActiveId(id)
    navigate("/builder")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-base font-semibold">Jobs</h1>
          <p className="text-xs text-muted-foreground">
            Track applications and decompose requirements
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add Job
        </Button>
      </div>

      {/* Body */}
      {jobs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ClipboardListIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No jobs yet</p>
            <p className="text-xs text-muted-foreground">
              Add a job to start tracking requirements and evidence
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add Job
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Job list */}
          <div className="flex w-72 shrink-0 flex-col border-r">
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1 p-2">
                {jobs.map((job) => {
                  const statusCfg = STATUS_CONFIG[job.status]
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedId(job.id)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selectedId === job.id
                          ? "border-primary/30 bg-primary/5"
                          : "border-transparent bg-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-sm font-medium leading-tight">
                          {job.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 text-[10px]", statusCfg.className)}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {job.company}
                      </span>
                      <EvidenceSummaryBar job={job} />
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Job detail */}
          {selected ? (
            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-2xl px-6 py-6">
                {/* Detail header */}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">
                        {selected.title}
                      </h2>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-xs",
                          STATUS_CONFIG[selected.status].className
                        )}
                      >
                        {STATUS_CONFIG[selected.status].label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {selected.company}
                    </p>
                    {selected.url && (
                      <a
                        href={selected.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLinkIcon className="size-3" />
                        View posting
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditOpen(true)}
                      title="Edit job"
                    >
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(selected.id)}
                      title="Delete job"
                    >
                      <Trash2Icon className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Status quick-change */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={selected.status}
                    onValueChange={(v) =>
                      updateJob(selected.id, { status: v as JobStatus })
                    }
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                {selected.description && (
                  <>
                    <Separator className="mb-5" />
                    <div className="mb-5">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Job Description
                      </h3>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                        {selected.description}
                      </p>
                    </div>
                  </>
                )}

                <Separator className="mb-5" />

                {/* Linked CV */}
                <div className="mb-5">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Linked CV
                  </h3>
                  {selected.linkedCVId ? (
                    (() => {
                      const linkedDoc = documents.find(
                        (d) => d.id === selected.linkedCVId
                      )
                      return linkedDoc ? (
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                          <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate text-sm">
                            {linkedDoc.name}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setActiveId(linkedDoc.id)
                              navigate("/builder")
                            }}
                          >
                            <WrenchIcon className="size-3" />
                            Open
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() =>
                              updateJob(selected.id, { linkedCVId: undefined })
                            }
                            title="Unlink CV"
                          >
                            <UnlinkIcon className="size-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Linked CV was deleted.{" "}
                          <button
                            className="text-primary hover:underline"
                            onClick={() =>
                              updateJob(selected.id, { linkedCVId: undefined })
                            }
                          >
                            Clear link
                          </button>
                        </p>
                      )
                    })()
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {documents.length > 0 && (
                        <Select
                          onValueChange={(v) =>
                            updateJob(selected.id, { linkedCVId: v })
                          }
                        >
                          <SelectTrigger className="h-8 w-56 text-xs">
                            <SelectValue placeholder="Attach existing CV..." />
                          </SelectTrigger>
                          <SelectContent>
                            {documents.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={handleCreateAndLinkCV}
                      >
                        <PlusIcon className="size-3" />
                        Create new CV for this job
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="mb-5" />

                {/* Requirements */}
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Requirements
                  </h3>
                  <RequirementsPanel
                    requirements={selected.requirements}
                    onAdd={(text) => addRequirement(selected.id, text)}
                    onUpdate={(reqId, data) =>
                      updateRequirement(selected.id, reqId, data)
                    }
                    onDelete={(reqId) =>
                      deleteRequirement(selected.id, reqId)
                    }
                  />
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </div>
      )}

      {/* Dialogs */}
      <JobDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        mode="create"
      />

      {selected && (
        <JobDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={(data) => {
            updateJob(selected.id, data)
            toast.success("Job updated")
          }}
          initial={selected}
          mode="edit"
        />
      )}
    </div>
  )
}
