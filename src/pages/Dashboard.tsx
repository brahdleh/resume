import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  PlusIcon,
  FileTextIcon,
  WrenchIcon,
  BookmarkIcon,
  Trash2Icon,
  ArrowRightIcon,
  DownloadIcon,
  UploadIcon,
} from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import { useCVStore } from "@/store/cvStore"
import { useTemplateStore } from "@/store/templateStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function NewCVDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createDocument } = useCVStore()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  const handleCreate = () => {
    if (!name.trim()) return
    createDocument(name.trim(), role.trim() || undefined)
    toast.success(`"${name.trim()}" created`)
    setName("")
    setRole("")
    onClose()
    navigate("/builder")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>New CV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dash-name">CV name</Label>
            <Input
              id="dash-name"
              placeholder="e.g. Google SWE Application"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dash-role">Target role (optional)</Label>
            <Input
              id="dash-role"
              placeholder="Senior Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const masterStore = useMasterStore()
  const { personalInfo, experiences, summaries, skills, education } = masterStore
  const cvStore = useCVStore()
  const { documents, setActiveId, deleteDocument } = cvStore
  const templateStore = useTemplateStore()
  const { templates } = templateStore
  const [newCVOpen, setNewCVOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      master: {
        personalInfo: masterStore.personalInfo,
        summaries: masterStore.summaries,
        experiences: masterStore.experiences,
        education: masterStore.education,
        skills: masterStore.skills,
        certifications: masterStore.certifications,
      },
      documents: cvStore.documents,
      activeId: cvStore.activeId,
      templates: templateStore.templates,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cv-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported")
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        if (!json.master || !json.documents === undefined || !json.templates === undefined) {
          throw new Error("Unrecognised file format")
        }
        masterStore.loadAll(json.master)
        cvStore.loadAll({ documents: json.documents ?? [], activeId: json.activeId ?? null })
        templateStore.loadAll({ templates: json.templates ?? [] })
        toast.success("Data imported — your workspace has been restored")
      } catch {
        toast.error("Import failed — make sure you're uploading a valid CV Studio backup")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const totalAchievements = experiences.reduce(
    (sum, exp) => sum + exp.achievements.length,
    0
  )

  const recentDocs = [...documents]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6)

  const stats = [
    {
      label: "Roles",
      value: experiences.length,
      sub: "work experiences",
      to: "/master",
    },
    {
      label: "Achievements",
      value: totalAchievements,
      sub: "bullet points",
      to: "/master",
    },
    {
      label: "Summaries",
      value: summaries.length,
      sub: "variants",
      to: "/master",
    },
    { label: "Skills", value: skills.length, sub: "in library", to: "/master" },
  ]

  const isNewUser =
    !personalInfo.name &&
    experiences.length === 0 &&
    summaries.length === 0

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold">
            {personalInfo.name ? `Welcome back, ${personalInfo.name.split(" ")[0]}` : "CV Studio"}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your modular job application workspace
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <UploadIcon data-icon="inline-start" />
            Import
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-6 flex flex-col gap-8">
          {isNewUser && (
            <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6">
              <h2 className="text-sm font-semibold">Get started</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Start by building your Master CV — add all your experience,
                achievements, and skills. Then use the CV Builder to craft
                tailored applications.
              </p>
              <div className="mt-4 flex gap-3">
                <Button size="sm" onClick={() => navigate("/master")}>
                  <FileTextIcon data-icon="inline-start" />
                  Start Master CV
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Master CV
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => navigate(stat.to)}
                  className="flex flex-col rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="text-2xl font-bold tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium">{stat.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {stat.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => setNewCVOpen(true)}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <PlusIcon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">New CV</p>
                  <p className="text-xs text-muted-foreground">
                    Start a new application
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/master")}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileTextIcon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Master CV</p>
                  <p className="text-xs text-muted-foreground">
                    Add experience & skills
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/templates")}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <BookmarkIcon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Templates</p>
                  <p className="text-xs text-muted-foreground">
                    {templates.length} saved
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent CVs */}
          {documents.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent CVs
                </h2>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate("/builder")}
                >
                  View all
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentDocs.map((doc) => (
                  <Card key={doc.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm truncate">{doc.name}</CardTitle>
                      {doc.targetRole && (
                        <CardDescription className="text-xs truncate">
                          {doc.targetRole}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {doc.selectedExperienceIds.length} roles
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Object.values(
                            doc.selectedAchievementsPerExperience
                          ).flat().length}{" "}
                          bullets
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {doc.selectedSkillIds.length} skills
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated{" "}
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter className="gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setActiveId(doc.id)
                          navigate("/builder")
                        }}
                      >
                        <WrenchIcon data-icon="inline-start" />
                        Open
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          navigate(`/export/${doc.id}`)
                        }}
                      >
                        <FileTextIcon className="text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          deleteDocument(doc.id)
                          toast.success("CV deleted")
                        }}
                      >
                        <Trash2Icon className="text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <NewCVDialog open={newCVOpen} onClose={() => setNewCVOpen(false)} />
    </div>
  )
}
