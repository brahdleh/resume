import { useState } from "react"
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
  XIcon,
  GripVerticalIcon,
  ChevronDownIcon,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMasterStore } from "@/store/masterStore"
import type { Experience, Achievement } from "@/types/cv"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function AchievementRow({
  ach,
  expId,
}: {
  ach: Achievement
  expId: string
}) {
  const { updateAchievement, deleteAchievement } = useMasterStore()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(ach.content)
  const [metrics, setMetrics] = useState(ach.metrics ?? "")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ach.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleSave = () => {
    if (!content.trim()) return
    updateAchievement(expId, ach.id, {
      content: content.trim(),
      metrics: metrics.trim() || undefined,
    })
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-md border bg-background p-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
        tabIndex={-1}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      {editing ? (
        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            autoFocus
            className="text-sm"
          />
          <Input
            value={metrics}
            onChange={(e) => setMetrics(e.target.value)}
            placeholder="Metrics (optional) — e.g. reduced load time by 40%"
            className="text-xs"
          />
          <div className="flex gap-1.5">
            <Button size="xs" onClick={handleSave}>
              <CheckIcon data-icon="inline-start" />
              Save
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setContent(ach.content)
                setMetrics(ach.metrics ?? "")
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm leading-relaxed">{ach.content}</span>
          {ach.metrics && (
            <span className="text-xs text-muted-foreground">{ach.metrics}</span>
          )}
        </div>
      )}

      {!editing && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setEditing(true)}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => deleteAchievement(expId, ach.id)}
          >
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface ExperienceCardProps {
  exp: Experience
}

function ExperienceCard({ exp }: ExperienceCardProps) {
  const {
    updateExperience,
    deleteExperience,
    addAchievement,
    reorderAchievements,
  } = useMasterStore()

  const [open, setOpen] = useState(false)
  const [editingHeader, setEditingHeader] = useState(false)
  const [header, setHeader] = useState({
    company: exp.company,
    role: exp.role,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
  })
  const [newAch, setNewAch] = useState("")
  const [newMetrics, setNewMetrics] = useState("")

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = exp.achievements.findIndex((a) => a.id === active.id)
    const newIndex = exp.achievements.findIndex((a) => a.id === over.id)
    const newOrder = arrayMove(exp.achievements, oldIndex, newIndex).map(
      (a) => a.id
    )
    reorderAchievements(exp.id, newOrder)
  }

  const handleAddAchievement = () => {
    if (!newAch.trim()) return
    addAchievement(exp.id, newAch.trim(), newMetrics.trim() || undefined)
    setNewAch("")
    setNewMetrics("")
    toast.success("Achievement added")
  }

  const handleSaveHeader = () => {
    updateExperience(exp.id, header)
    setEditingHeader(false)
  }

  return (
    <div className="rounded-lg border bg-card">
      <div
        className="flex cursor-pointer items-start justify-between gap-3 p-4"
        onClick={() => !editingHeader && setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          {editingHeader ? (
            <div
              className="flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Role</Label>
                  <Input
                    value={header.role}
                    onChange={(e) =>
                      setHeader((h) => ({ ...h, role: e.target.value }))
                    }
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Company</Label>
                  <Input
                    value={header.company}
                    onChange={(e) =>
                      setHeader((h) => ({ ...h, company: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={header.location}
                    onChange={(e) =>
                      setHeader((h) => ({ ...h, location: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Start date</Label>
                  <Input
                    value={header.startDate}
                    placeholder="Jan 2022"
                    onChange={(e) =>
                      setHeader((h) => ({ ...h, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">End date</Label>
                  <Input
                    value={header.endDate}
                    placeholder="Present"
                    onChange={(e) =>
                      setHeader((h) => ({ ...h, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="xs" onClick={handleSaveHeader}>
                  <CheckIcon data-icon="inline-start" />
                  Save
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setHeader({
                      company: exp.company,
                      role: exp.role,
                      location: exp.location,
                      startDate: exp.startDate,
                      endDate: exp.endDate,
                    })
                    setEditingHeader(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-medium text-sm">{exp.role}</p>
              <p className="text-xs text-muted-foreground">
                {exp.company} · {exp.location}
              </p>
              <p className="text-xs text-muted-foreground">
                {exp.startDate} — {exp.endDate}
              </p>
            </>
          )}
        </div>

        {!editingHeader && (
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {exp.achievements.length} bullets
            </Badge>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setEditingHeader(true)
                setOpen(true)
              }}
            >
              <PencilIcon />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                deleteExperience(exp.id)
                toast.success("Experience deleted")
              }}
            >
              <Trash2Icon className="text-destructive" />
            </Button>
            <ChevronDownIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        )}
      </div>

      {open && !editingHeader && (
        <>
          <Separator />
          <div className="p-4 flex flex-col gap-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exp.achievements.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {exp.achievements.map((ach) => (
                  <AchievementRow key={ach.id} ach={ach} expId={exp.id} />
                ))}
              </SortableContext>
            </DndContext>

            {exp.achievements.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No achievements yet. Add your first bullet below.
              </p>
            )}

            <div className="flex flex-col gap-2 rounded-md border border-dashed p-3">
              <Textarea
                placeholder="Describe an achievement or responsibility..."
                value={newAch}
                onChange={(e) => setNewAch(e.target.value)}
                rows={2}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleAddAchievement()
                  }
                }}
              />
              <Input
                placeholder="Metrics (optional) — e.g. Increased conversion by 15%"
                value={newMetrics}
                onChange={(e) => setNewMetrics(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddAchievement}
                disabled={!newAch.trim()}
              >
                <PlusIcon data-icon="inline-start" />
                Add bullet
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface NewExpForm {
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
}

const emptyForm: NewExpForm = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "Present",
}

export function ExperienceManager() {
  const { experiences, addExperience } = useMasterStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<NewExpForm>(emptyForm)

  const f = (key: keyof NewExpForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const handleAdd = () => {
    if (!form.company.trim() || !form.role.trim()) return
    addExperience(form)
    setForm(emptyForm)
    setAdding(false)
    toast.success("Experience added")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Work experience</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add all your roles. You'll select which ones to include per CV.
          </p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Add role
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
          <h4 className="text-sm font-medium">New role</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Role / Title</Label>
              <Input placeholder="Senior Engineer" autoFocus {...f("role")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Company</Label>
              <Input placeholder="Acme Corp" {...f("company")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Location</Label>
              <Input placeholder="London, UK" {...f("location")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Start date</Label>
              <Input placeholder="Jan 2022" {...f("startDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End date</Label>
              <Input placeholder="Present" {...f("endDate")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!form.company.trim() || !form.role.trim()}
            >
              <CheckIcon data-icon="inline-start" />
              Add role
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false)
                setForm(emptyForm)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {experiences.length === 0 && !adding && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No experience added yet.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    </div>
  )
}
