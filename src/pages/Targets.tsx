import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CircleIcon,
  CircleDashedIcon,
  CrosshairIcon,
  ArrowRightIcon,
} from "lucide-react"
import { useJobStore } from "@/store/jobStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { JobRequirement } from "@/types/jobs"

interface TargetItem {
  req: JobRequirement
  jobId: string
  jobTitle: string
  company: string
}

function TargetCard({ item, onViewJob }: { item: TargetItem; onViewJob: () => void }) {
  const isNone = item.req.evidenceLevel === "none"
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.req.text}</p>
          {item.req.notes && (
            <p className="text-xs text-muted-foreground">{item.req.notes}</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[10px]",
            isNone
              ? "bg-muted/60 text-muted-foreground border-border"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}
        >
          {isNone ? "No evidence" : "Weak evidence"}
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {item.jobTitle} · {item.company}
        </span>
        <button
          onClick={onViewJob}
          className="ml-auto flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          View job
          <ArrowRightIcon className="size-3" />
        </button>
      </div>
    </div>
  )
}

export function Targets() {
  const navigate = useNavigate()
  const { jobs } = useJobStore()
  const [tab, setTab] = useState<"none" | "weak">("none")

  const allTargets: TargetItem[] = jobs.flatMap((job) =>
    job.requirements
      .filter((r) => r.evidenceLevel !== "strong")
      .map((req) => ({
        req,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      }))
  )

  const gaps = allTargets.filter((t) => t.req.evidenceLevel === "none")
  const developing = allTargets.filter((t) => t.req.evidenceLevel === "weak")

  const displayed = tab === "none" ? gaps : developing

  const isEmpty = gaps.length === 0 && developing.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-base font-semibold">Targets</h1>
          <p className="text-xs text-muted-foreground">
            Requirements you're yet to meet or only have weak evidence for
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <CrosshairIcon className="size-5 text-muted-foreground" />
          </div>
          {jobs.length === 0 ? (
            <div>
              <p className="text-sm font-medium">No jobs tracked yet</p>
              <p className="text-xs text-muted-foreground">
                Add jobs and decompose their requirements to see targets here
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => navigate("/jobs")}
              >
                Go to Jobs
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">All requirements evidenced</p>
              <p className="text-xs text-muted-foreground">
                Every tracked requirement has strong evidence — great work!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b px-6 py-2">
            <button
              onClick={() => setTab("none")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "none"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <CircleIcon className="size-3.5" />
              Gaps
              {gaps.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-xs">
                  {gaps.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setTab("weak")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "weak"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <CircleDashedIcon className="size-3.5" />
              Developing
              {developing.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-xs">
                  {developing.length}
                </Badge>
              )}
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-2xl px-6 py-5">
              {displayed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  {tab === "none"
                    ? "No gaps — all tracked requirements have at least weak evidence."
                    : "No developing requirements — mark some as weak to see them here."}
                </p>
              ) : (
                <>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {tab === "none"
                      ? "These requirements have no evidence. Focus on gaining experience or documentation for these."
                      : "These requirements have some evidence but could be stronger. Look for opportunities to demonstrate these skills."}
                  </p>

                  {/* Group by job */}
                  {jobs
                    .filter((job) =>
                      displayed.some((t) => t.jobId === job.id)
                    )
                    .map((job, i, arr) => {
                      const items = displayed.filter((t) => t.jobId === job.id)
                      return (
                        <div key={job.id}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {job.title} · {job.company}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              {items.length}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            {items.map((item) => (
                              <TargetCard
                                key={item.req.id}
                                item={item}
                                onViewJob={() => navigate("/jobs")}
                              />
                            ))}
                          </div>
                          {i < arr.length - 1 && (
                            <Separator className="my-5" />
                          )}
                        </div>
                      )
                    })}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
