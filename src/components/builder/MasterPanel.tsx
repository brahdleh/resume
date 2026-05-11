import { useState } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import { useCVStore } from "@/store/cvStore"
import type { CVDocument } from "@/types/cv"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Props {
  doc: CVDocument
}

function ExperiencePanel({ doc }: Props) {
  const { experiences } = useMasterStore()
  const { toggleExperience, toggleAchievement, selectAllAchievements } =
    useCVStore()
  const [openExpIds, setOpenExpIds] = useState<Set<string>>(new Set())

  const toggleOpen = (id: string) =>
    setOpenExpIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Experience
      </p>
      {experiences.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          No experience in Master CV yet.
        </p>
      )}
      {experiences.map((exp) => {
        const expSelected = doc.selectedExperienceIds.includes(exp.id)
        const selectedAchs =
          doc.selectedAchievementsPerExperience[exp.id] ?? []
        const isOpen = openExpIds.has(exp.id)

        return (
          <div key={exp.id}>
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-muted/50 group">
              <input
                type="checkbox"
                checked={expSelected}
                onChange={() =>
                  toggleExperience(
                    doc.id,
                    exp.id,
                    exp.achievements.map((a) => a.id)
                  )
                }
                className="size-3.5 accent-primary cursor-pointer"
              />
              <span
                className="flex-1 cursor-pointer text-xs font-medium"
                onClick={() =>
                  toggleExperience(
                    doc.id,
                    exp.id,
                    exp.achievements.map((a) => a.id)
                  )
                }
              >
                {exp.role}
                <span className="text-muted-foreground font-normal">
                  {" "}
                  @ {exp.company}
                </span>
              </span>
              {exp.achievements.length > 0 && (
                <button
                  onClick={() => toggleOpen(exp.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isOpen ? (
                    <ChevronDownIcon className="size-3.5" />
                  ) : (
                    <ChevronRightIcon className="size-3.5" />
                  )}
                </button>
              )}
            </div>

            {isOpen && exp.achievements.length > 0 && (
              <div className="ml-5 flex flex-col gap-0.5 border-l pl-2 py-1">
                <div className="flex items-center gap-2 py-0.5">
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      const allSelected =
                        exp.achievements.every((a) =>
                          selectedAchs.includes(a.id)
                        )
                      selectAllAchievements(
                        doc.id,
                        exp.id,
                        allSelected ? [] : exp.achievements.map((a) => a.id)
                      )
                    }}
                  >
                    {exp.achievements.every((a) => selectedAchs.includes(a.id))
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                  <Badge variant="secondary" className="text-xs">
                    {selectedAchs.length}/{exp.achievements.length}
                  </Badge>
                </div>
                {exp.achievements.map((ach) => {
                  const achSelected = selectedAchs.includes(ach.id)
                  return (
                    <label
                      key={ach.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-1.5 rounded py-0.5 px-1 hover:bg-muted/50",
                        !expSelected && "opacity-40 pointer-events-none"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={achSelected}
                        disabled={!expSelected}
                        onChange={() =>
                          toggleAchievement(doc.id, exp.id, ach.id)
                        }
                        className="mt-0.5 size-3 accent-primary"
                      />
                      <span className="text-xs leading-relaxed line-clamp-2">
                        {ach.content}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SkillsPanel({ doc }: Props) {
  const { skills } = useMasterStore()
  const { toggleSkill } = useCVStore()

  const grouped = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => ({
      ...acc,
      [skill.category]: [...(acc[skill.category] ?? []), skill],
    }),
    {}
  )

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Skills
      </p>
      {skills.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          No skills in Master CV yet.
        </p>
      )}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} className="flex flex-col gap-0.5">
          <p className="px-3 py-1 text-xs text-muted-foreground">{cat}</p>
          {catSkills.map((skill) => {
            const selected = doc.selectedSkillIds.includes(skill.id)
            return (
              <label
                key={skill.id}
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleSkill(doc.id, skill.id)}
                  className="size-3.5 accent-primary"
                />
                <span className="text-xs">{skill.name}</span>
              </label>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function EducationPanel({ doc }: Props) {
  const { education, certifications } = useMasterStore()
  const { toggleEducation, toggleCertification } = useCVStore()

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Education
      </p>
      {education.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">No education entries.</p>
      )}
      {education.map((edu) => {
        const selected = doc.selectedEducationIds.includes(edu.id)
        return (
          <label
            key={edu.id}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/50"
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleEducation(doc.id, edu.id)}
              className="size-3.5 accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{edu.institution}</span>
              <span className="text-xs text-muted-foreground">
                {edu.degree} · {edu.endDate}
              </span>
            </div>
          </label>
        )
      })}

      {certifications.length > 0 && (
        <>
          <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">
            Certifications
          </p>
          {certifications.map((cert) => {
            const selected = doc.selectedCertificationIds.includes(cert.id)
            return (
              <label
                key={cert.id}
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleCertification(doc.id, cert.id)}
                  className="size-3.5 accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{cert.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {cert.issuer} · {cert.date}
                  </span>
                </div>
              </label>
            )
          })}
        </>
      )}
    </div>
  )
}

export function MasterPanel({ doc }: Props) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/10">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold">Master CV</p>
        <p className="text-xs text-muted-foreground">Tick items to include</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 py-3">
          <ExperiencePanel doc={doc} />
          <SkillsPanel doc={doc} />
          <EducationPanel doc={doc} />
        </div>
      </ScrollArea>
    </div>
  )
}
