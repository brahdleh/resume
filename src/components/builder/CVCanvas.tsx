import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { GripVerticalIcon } from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import { useCVStore } from "@/store/cvStore"
import type { CVDocument, SectionType } from "@/types/cv"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SECTION_LABELS: Record<SectionType, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
}

interface SectionBlockProps {
  sectionType: SectionType
  doc: CVDocument
  isDragOverlay?: boolean
}

function SummarySection({ doc }: { doc: CVDocument }) {
  const { summaries } = useMasterStore()
  const summary = summaries.find((s) => s.id === doc.selectedSummaryId)
  if (!summary) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No summary selected. Use the picker above to choose one.
      </p>
    )
  }
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {summary.content}
    </p>
  )
}

interface ExpCardProps {
  exp: ReturnType<typeof useMasterStore.getState>["experiences"][number]
  doc: CVDocument
}

function ExperienceEntry({ exp, doc }: ExpCardProps) {
  const { reorderDocumentAchievements } = useCVStore()
  const sensors = useSensors(useSensor(PointerSensor))
  const selectedAchIds = doc.selectedAchievementsPerExperience[exp.id] ?? []
  const selectedAchs = selectedAchIds
    .map((id) => exp.achievements.find((a) => a.id === id))
    .filter(Boolean) as typeof exp.achievements

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = selectedAchIds.indexOf(active.id as string)
    const newIndex = selectedAchIds.indexOf(over.id as string)
    reorderDocumentAchievements(
      doc.id,
      exp.id,
      arrayMove(selectedAchIds, oldIndex, newIndex)
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold">{exp.role}</p>
      <p className="text-xs text-muted-foreground">
        {[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
      </p>
      {selectedAchs.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedAchIds}
            strategy={verticalListSortingStrategy}
          >
            <ul className="mt-1.5 flex flex-col gap-1">
              {selectedAchs.map((ach) => (
                <SortableAchievementItem
                  key={ach.id}
                  id={ach.id}
                  content={ach.content}
                  metrics={ach.metrics}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function ExperienceSection({ doc }: { doc: CVDocument }) {
  const { experiences } = useMasterStore()

  const selected = doc.selectedExperienceIds
    .map((id) => experiences.find((e) => e.id === id))
    .filter(Boolean) as typeof experiences

  if (selected.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No experience selected. Tick roles in the left panel.
      </p>
    )
  }

  // Group by company, preserving order
  const companyOrder: string[] = []
  const grouped: Record<string, typeof experiences> = {}
  for (const exp of selected) {
    if (!grouped[exp.company]) {
      grouped[exp.company] = []
      companyOrder.push(exp.company)
    }
    grouped[exp.company].push(exp)
  }

  return (
    <div className="flex flex-col gap-4">
      {companyOrder.map((company) => {
        const exps = grouped[company]
        return (
          <div key={company}>
            <p className="text-sm font-semibold mb-1.5">
              {company}{exps[0].location ? ` · ${exps[0].location}` : ""}
            </p>
            <div className="flex gap-3">
              <div className="w-px bg-muted-foreground/25 shrink-0 mt-1" />
              <div className="flex flex-col gap-3 flex-1">
                {exps.map((exp) => (
                  <ExperienceEntry key={exp.id} exp={exp} doc={doc} />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SortableAchievementItem({
  id,
  content,
  metrics,
}: {
  id: string
  content: string
  metrics?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-1.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-muted-foreground/30 hover:text-muted-foreground/70 shrink-0"
        tabIndex={-1}
      >
        <GripVerticalIcon className="size-3" />
      </button>
      <span className="text-xs leading-relaxed before:mr-1.5 before:content-['•']">
        {content}
        {metrics && <span> — {metrics}</span>}
      </span>
    </li>
  )
}

function SkillsSection({ doc }: { doc: CVDocument }) {
  const { skills } = useMasterStore()
  const selected = skills.filter((s) => doc.selectedSkillIds.includes(s.id))

  if (selected.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No skills selected.
      </p>
    )
  }

  const grouped = selected.reduce<Record<string, typeof skills>>(
    (acc, skill) => ({
      ...acc,
      [skill.category]: [...(acc[skill.category] ?? []), skill],
    }),
    {}
  )

  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} className="flex items-start gap-2 text-xs">
          <span className="font-medium w-36 shrink-0 text-muted-foreground">{cat}:</span>
          <span>{catSkills.map((s) => s.name).join(", ")}</span>
        </div>
      ))}
    </div>
  )
}

function EducationSectionContent({ doc }: { doc: CVDocument }) {
  const { education } = useMasterStore()
  const selected = education.filter((e) => doc.selectedEducationIds.includes(e.id))

  if (selected.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No education selected.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.map((edu) => (
        <div key={edu.id} className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{edu.degree} in {edu.field}</p>
            <p className="text-xs text-muted-foreground">{edu.institution}{edu.grade ? ` · ${edu.grade}` : ""}</p>
          </div>
          <p className="text-xs text-muted-foreground shrink-0">
            {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
          </p>
        </div>
      ))}
    </div>
  )
}

function CertificationsContent({ doc }: { doc: CVDocument }) {
  const { certifications } = useMasterStore()
  const selected = certifications.filter((c) =>
    doc.selectedCertificationIds.includes(c.id)
  )

  if (selected.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {selected.map((cert) => (
        <div key={cert.id} className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{cert.name}</p>
            <p className="text-xs text-muted-foreground">{cert.issuer}</p>
          </div>
          <p className="text-xs text-muted-foreground shrink-0">{cert.date}</p>
        </div>
      ))}
    </div>
  )
}

function SortableSectionBlock({ sectionType, doc }: SectionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sectionType })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SectionBlock
        sectionType={sectionType}
        doc={doc}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

function SectionBlock({
  sectionType,
  doc,
  isDragOverlay,
  dragHandleProps,
}: SectionBlockProps & { dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> }) {
  const content = (() => {
    switch (sectionType) {
      case "summary":
        return <SummarySection doc={doc} />
      case "experience":
        return <ExperienceSection doc={doc} />
      case "skills":
        return <SkillsSection doc={doc} />
      case "education":
        return <EducationSectionContent doc={doc} />
      case "certifications":
        return <CertificationsContent doc={doc} />
    }
  })()

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card",
        isDragOverlay && "shadow-lg ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <button
          {...(isDragOverlay ? {} : dragHandleProps)}
          className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground/70"
          tabIndex={-1}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {SECTION_LABELS[sectionType]}
        </span>
      </div>
      <div className="p-4">{content}</div>
    </div>
  )
}

interface CVCanvasProps {
  doc: CVDocument
}

export function CVCanvas({ doc }: CVCanvasProps) {
  const { reorderSections } = useCVStore()
  const [activeSection, setActiveSection] = useState<SectionType | null>(null)
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveSection(null)
    if (!over || active.id === over.id) return
    const oldIndex = doc.sectionOrder.indexOf(active.id as SectionType)
    const newIndex = doc.sectionOrder.indexOf(over.id as SectionType)
    reorderSections(doc.id, arrayMove(doc.sectionOrder, oldIndex, newIndex))
  }

  const { personalInfo } = useMasterStore()

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-6">
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="border-b px-8 py-6 text-center">
            <h2 className="text-xl font-bold">
              {personalInfo.name || "Your Name"}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.github && <span>{personalInfo.github}</span>}
              {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
            {personalInfo.title && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {personalInfo.title}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e) => setActiveSection(e.active.id as SectionType)}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveSection(null)}
            >
              <SortableContext
                items={doc.sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {doc.sectionOrder.map((section) => (
                  <SortableSectionBlock
                    key={section}
                    sectionType={section}
                    doc={doc}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeSection && (
                  <SectionBlock
                    sectionType={activeSection}
                    doc={doc}
                    isDragOverlay
                  />
                )}
              </DragOverlay>
            </DndContext>

            {doc.sectionOrder.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Your CV is empty. Select items from the left panel to get started.
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {doc.selectedExperienceIds.length} roles
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {Object.values(doc.selectedAchievementsPerExperience).flat().length} bullets
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {doc.selectedSkillIds.length} skills
          </Badge>
        </div>
      </div>
    </ScrollArea>
  )
}
