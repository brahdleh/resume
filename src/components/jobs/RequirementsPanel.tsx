import { useEffect, useRef, useState } from "react"
import {
  PlusIcon,
  Trash2Icon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { JobRequirement, EvidenceLevel } from "@/types/jobs"

const EVIDENCE_CONFIG: Record<
  EvidenceLevel,
  {
    label: string
    Icon: React.ComponentType<{ className?: string }>
    className: string
  }
> = {
  strong: {
    label: "Strong",
    Icon: CheckCircle2Icon,
    className:
      "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  },
  weak: {
    label: "Weak",
    Icon: CircleDashedIcon,
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  },
  none: {
    label: "None",
    Icon: CircleIcon,
    className:
      "bg-muted/60 text-muted-foreground border-border hover:bg-muted",
  },
}

const CYCLE: EvidenceLevel[] = ["none", "weak", "strong"]

interface RequirementRowProps {
  req: JobRequirement
  onChange: (data: Partial<Omit<JobRequirement, "id">>) => void
  onDelete: () => void
}

function RequirementRow({ req, onChange, onDelete }: RequirementRowProps) {
  const cfg = EVIDENCE_CONFIG[req.evidenceLevel]
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    if (textareaRef.current) resize(textareaRef.current)
  }, [req.text])

  const cycleEvidence = () => {
    const idx = CYCLE.indexOf(req.evidenceLevel)
    onChange({ evidenceLevel: CYCLE[(idx + 1) % CYCLE.length] })
  }

  return (
    <div className="group flex items-start gap-2 rounded-lg border bg-card px-3 py-2.5">
      <button
        onClick={cycleEvidence}
        title="Click to cycle evidence level"
        className={cn(
          "mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
          cfg.className
        )}
      >
        <cfg.Icon className="size-3" />
        {cfg.label}
      </button>

      <textarea
        ref={textareaRef}
        className="flex-1 resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        placeholder="Requirement or skill..."
        value={req.text}
        rows={1}
        onChange={(e) => {
          onChange({ text: e.target.value })
          resize(e.target)
        }}
      />

      <Button
        size="icon-sm"
        variant="ghost"
        className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2Icon className="size-3.5 text-destructive" />
      </Button>
    </div>
  )
}

interface RequirementsPanelProps {
  requirements: JobRequirement[]
  onAdd: (text: string) => void
  onUpdate: (reqId: string, data: Partial<Omit<JobRequirement, "id">>) => void
  onDelete: (reqId: string) => void
}

export function RequirementsPanel({
  requirements,
  onAdd,
  onUpdate,
  onDelete,
}: RequirementsPanelProps) {
  const [newText, setNewText] = useState("")

  const handleAdd = () => {
    if (!newText.trim()) return
    onAdd(newText.trim())
    setNewText("")
  }

  const strong = requirements.filter((r) => r.evidenceLevel === "strong").length
  const weak = requirements.filter((r) => r.evidenceLevel === "weak").length
  const none = requirements.filter((r) => r.evidenceLevel === "none").length

  return (
    <div className="flex flex-col gap-3">
      {requirements.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-medium text-green-600">
            <CheckCircle2Icon className="size-3.5" />
            {strong} strong
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-600">
            <CircleDashedIcon className="size-3.5" />
            {weak} weak
          </span>
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <CircleIcon className="size-3.5" />
            {none} none
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {requirements.length === 0 && (
          <p className="py-2 text-xs text-muted-foreground">
            No requirements added yet. Add them below — click the evidence badge
            to cycle between None / Weak / Strong.
          </p>
        )}
        {requirements.map((req) => (
          <RequirementRow
            key={req.id}
            req={req}
            onChange={(data) => onUpdate(req.id, data)}
            onDelete={() => onDelete(req.id)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a requirement, skill, or competency..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newText.trim()}>
          <PlusIcon className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  )
}
