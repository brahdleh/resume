import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const COMMON_CATEGORIES = [
  "Languages",
  "Frameworks",
  "Tools",
  "Cloud & Infrastructure",
  "Databases",
  "Methodologies",
  "Other",
]

export function SkillsManager() {
  const { skills, addSkill, deleteSkill } = useMasterStore()
  const [name, setName] = useState("")
  const [category, setCategory] = useState(COMMON_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState("")

  const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || "Other"
    return { ...acc, [cat]: [...(acc[cat] ?? []), skill] }
  }, {})

  const effectiveCategory =
    category === "Other" && customCategory.trim()
      ? customCategory.trim()
      : category

  const handleAdd = () => {
    if (!name.trim()) return
    addSkill(name.trim(), effectiveCategory)
    setName("")
    toast.success(`"${name.trim()}" added`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-medium">Skills</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add skills grouped by category. Select which to include per CV.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
        <h4 className="text-sm font-medium">Add a skill</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5 col-span-2">
            <Label htmlFor="skill-name">Skill name</Label>
            <Input
              id="skill-name"
              placeholder="TypeScript"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skill-cat">Category</Label>
            <select
              id="skill-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {COMMON_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {category === "Other" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-cat">Custom category name</Label>
            <Input
              id="custom-cat"
              placeholder="e.g. Design, Soft Skills"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>
        )}

        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="self-start"
        >
          <PlusIcon data-icon="inline-start" />
          Add skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No skills added yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([cat, catSkills]) => (
            <div key={cat}>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {cat}
              </p>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="gap-1.5 pr-1.5 text-sm"
                  >
                    {skill.name}
                    <button
                      onClick={() => {
                        deleteSkill(skill.id)
                        toast.success(`"${skill.name}" removed`)
                      }}
                      className="rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
