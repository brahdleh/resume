import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusIcon, ChevronDownIcon, BookmarkIcon } from "lucide-react"
import { useCVStore } from "@/store/cvStore"
import { useMasterStore } from "@/store/masterStore"
import { useTemplateStore } from "@/store/templateStore"
import { MasterPanel } from "@/components/builder/MasterPanel"
import { CVCanvas } from "@/components/builder/CVCanvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

function SummaryPicker({ docId }: { docId: string }) {
  const { summaries } = useMasterStore()
  const { documents, setSummary } = useCVStore()
  const doc = documents.find((d) => d.id === docId)

  if (!doc) return null

  const selected = summaries.find((s) => s.id === doc.selectedSummaryId)

  return (
    <Select
      value={doc.selectedSummaryId || "none"}
      onValueChange={(val) => {
        if (val !== "none") setSummary(docId, val)
      }}
    >
      <SelectTrigger className="h-8 w-52 text-xs">
        <SelectValue placeholder="Pick a summary…">
          {selected ? (
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Summary:</span>
              {selected.label}
            </span>
          ) : (
            "Pick a summary…"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {summaries.length === 0 && (
          <SelectItem value="none" disabled>
            No summaries — add them in Master CV
          </SelectItem>
        )}
        {summaries.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SaveTemplateDialog({
  open,
  onClose,
  docId,
}: {
  open: boolean
  onClose: () => void
  docId: string
}) {
  const { documents } = useCVStore()
  const { createTemplate } = useTemplateStore()
  const [name, setName] = useState("")
  const [genre, setGenre] = useState("")
  const [description, setDescription] = useState("")

  const doc = documents.find((d) => d.id === docId)

  const handleSave = () => {
    if (!name.trim() || !doc) return
    createTemplate(name.trim(), description.trim(), genre.trim() || "General", doc)
    toast.success(`Template "${name.trim()}" saved`)
    setName("")
    setGenre("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-name">Template name</Label>
            <Input
              id="tpl-name"
              placeholder="e.g. Senior Backend Engineer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-genre">Job genre</Label>
            <Input
              id="tpl-genre"
              placeholder="e.g. Software Engineering, Product, Finance"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-desc">Description (optional)</Label>
            <Input
              id="tpl-desc"
              placeholder="What this template is optimised for"
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
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewCVDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { createDocument } = useCVStore()
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  const handleCreate = () => {
    if (!name.trim()) return
    createDocument(name.trim(), role.trim() || undefined)
    toast.success(`"${name.trim()}" created`)
    setName("")
    setRole("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>New CV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cv-name">CV name</Label>
            <Input
              id="cv-name"
              placeholder="e.g. Google SWE Application"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cv-role">Target role (optional)</Label>
            <Input
              id="cv-role"
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

export function CVBuilder() {
  const { documents, activeId, setActiveId, deleteDocument } = useCVStore()
  const { templates } = useTemplateStore()
  const { applyTemplateToDocument } = useCVStore()
  const navigate = useNavigate()
  const [newCVOpen, setNewCVOpen] = useState(false)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)

  const activeDoc = documents.find((d) => d.id === activeId) ?? documents[0] ?? null

  if (documents.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">No CVs yet.</p>
        <Button onClick={() => setNewCVOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Create your first CV
        </Button>
        <NewCVDialog open={newCVOpen} onClose={() => setNewCVOpen(false)} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
        {/* CV picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {activeDoc?.name ?? "Select CV"}
              <ChevronDownIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {documents.map((doc) => (
              <DropdownMenuItem
                key={doc.id}
                onClick={() => setActiveId(doc.id)}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate">{doc.name}</span>
                {doc.id === activeId && (
                  <Badge variant="secondary" className="text-xs">active</Badge>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setNewCVOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New CV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {activeDoc && (
          <>
            {/* Summary picker */}
            <SummaryPicker docId={activeDoc.id} />

            {/* Template picker */}
            {templates.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Apply template
                    <ChevronDownIcon className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {templates.map((tpl) => (
                    <DropdownMenuItem
                      key={tpl.id}
                      onClick={() => {
                        const { buildDocumentPatch } = useTemplateStore.getState()
                        applyTemplateToDocument(
                          activeDoc.id,
                          buildDocumentPatch(tpl)
                        )
                        toast.success(`Applied "${tpl.name}"`)
                      }}
                    >
                      {tpl.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {tpl.genre}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSaveTemplateOpen(true)}
              >
                <BookmarkIcon data-icon="inline-start" />
                Save as template
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/export/${activeDoc.id}`)}
              >
                Export PDF
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <ChevronDownIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      deleteDocument(activeDoc.id)
                      toast.success("CV deleted")
                    }}
                  >
                    Delete CV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      {/* Main two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {activeDoc && (
          <>
            <MasterPanel doc={activeDoc} />
            <CVCanvas doc={activeDoc} />
          </>
        )}
      </div>

      <NewCVDialog open={newCVOpen} onClose={() => setNewCVOpen(false)} />
      {activeDoc && (
        <SaveTemplateDialog
          open={saveTemplateOpen}
          onClose={() => setSaveTemplateOpen(false)}
          docId={activeDoc.id}
        />
      )}
    </div>
  )
}
