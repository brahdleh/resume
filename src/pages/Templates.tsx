import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2Icon, PencilIcon, PlayIcon, CheckIcon } from "lucide-react"
import { useTemplateStore } from "@/store/templateStore"
import { useCVStore } from "@/store/cvStore"
import { useMasterStore } from "@/store/masterStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

function ApplyTemplateDialog({
  templateId,
  onClose,
}: {
  templateId: string
  onClose: () => void
}) {
  const { templates, buildDocumentPatch } = useTemplateStore()
  const { createDocument, applyTemplateToDocument } = useCVStore()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  const template = templates.find((t) => t.id === templateId)
  if (!template) return null

  const handleApply = () => {
    if (!name.trim()) return
    const docId = createDocument(name.trim(), role.trim() || undefined)
    applyTemplateToDocument(docId, buildDocumentPatch(template))
    toast.success(`CV "${name.trim()}" created from template`)
    onClose()
    navigate("/builder")
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Apply "{template.name}"</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apply-name">New CV name</Label>
            <Input
              id="apply-name"
              placeholder="e.g. Google Application"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apply-role">Target role (optional)</Label>
            <Input
              id="apply-role"
              placeholder="Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!name.trim()}>
            Create CV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditTemplateDialog({
  templateId,
  onClose,
}: {
  templateId: string
  onClose: () => void
}) {
  const { templates, updateTemplate } = useTemplateStore()
  const template = templates.find((t) => t.id === templateId)
  const [name, setName] = useState(template?.name ?? "")
  const [genre, setGenre] = useState(template?.genre ?? "")
  const [description, setDescription] = useState(template?.description ?? "")

  if (!template) return null

  const handleSave = () => {
    if (!name.trim()) return
    updateTemplate(templateId, {
      name: name.trim(),
      genre: genre.trim(),
      description: description.trim(),
    })
    toast.success("Template updated")
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Genre</Label>
            <Input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <CheckIcon data-icon="inline-start" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Templates() {
  const { templates, deleteTemplate } = useTemplateStore()
  const { experiences, skills } = useMasterStore()
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-base font-semibold">Templates</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Saved CV configurations for specific job genres — apply to create a
          pre-filled CV instantly
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-6">
          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <p className="text-sm font-medium">No templates yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Build a CV in the CV Builder and save it as a template using
                "Save as template".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => {
                const expCount = tpl.selectedExperienceIds.length
                const bulletCount = Object.values(
                  tpl.selectedAchievementsPerExperience
                ).flat().length
                const skillCount = tpl.selectedSkillIds.length

                return (
                  <Card key={tpl.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm">{tpl.name}</CardTitle>
                          {tpl.description && (
                            <CardDescription className="mt-0.5 text-xs">
                              {tpl.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {tpl.genre}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {expCount} roles
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {bulletCount} bullets
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {skillCount} skills
                        </Badge>
                      </div>

                      {expCount > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Includes:
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {tpl.selectedExperienceIds
                              .slice(0, 3)
                              .map((id) => {
                                const exp = experiences.find((e) => e.id === id)
                                return exp ? (
                                  <p key={id} className="text-xs truncate">
                                    {exp.role}{" "}
                                    <span className="text-muted-foreground">
                                      @ {exp.company}
                                    </span>
                                  </p>
                                ) : null
                              })}
                            {expCount > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{expCount - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(tpl.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>

                    <CardFooter className="gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setApplyingId(tpl.id)}
                      >
                        <PlayIcon data-icon="inline-start" />
                        Use template
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setEditingId(tpl.id)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          deleteTemplate(tpl.id)
                          toast.success("Template deleted")
                        }}
                      >
                        <Trash2Icon className="text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {applyingId && (
        <ApplyTemplateDialog
          templateId={applyingId}
          onClose={() => setApplyingId(null)}
        />
      )}
      {editingId && (
        <EditTemplateDialog
          templateId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
