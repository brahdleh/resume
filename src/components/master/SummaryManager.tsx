import { useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface EditState {
  id: string
  label: string
  content: string
}

export function SummaryManager() {
  const { summaries, addSummary, updateSummary, deleteSummary } =
    useMasterStore()

  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newContent, setNewContent] = useState("")
  const [editing, setEditing] = useState<EditState | null>(null)

  const handleAdd = () => {
    if (!newLabel.trim() || !newContent.trim()) return
    addSummary(newLabel.trim(), newContent.trim())
    setNewLabel("")
    setNewContent("")
    setAdding(false)
    toast.success("Summary added")
  }

  const handleSaveEdit = () => {
    if (!editing || !editing.label.trim() || !editing.content.trim()) return
    updateSummary(editing.id, {
      label: editing.label.trim(),
      content: editing.content.trim(),
    })
    setEditing(null)
    toast.success("Summary updated")
  }

  const handleDelete = (id: string, label: string) => {
    deleteSummary(id)
    toast.success(`"${label}" deleted`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Professional summaries</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Store multiple variants to swap in for different roles
          </p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Add summary
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-label">Label</Label>
            <Input
              id="new-label"
              placeholder='e.g. "General", "Senior Eng", "Startup Focus"'
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-content">Summary text</Label>
            <Textarea
              id="new-content"
              placeholder="Write your professional summary here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newLabel.trim() || !newContent.trim()}>
              <CheckIcon data-icon="inline-start" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false)
                setNewLabel("")
                setNewContent("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {summaries.length === 0 && !adding && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No summaries yet. Add your first professional summary.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {summaries.map((summary) =>
          editing?.id === summary.id ? (
            <div
              key={summary.id}
              className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label>Label</Label>
                <Input
                  value={editing.label}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, label: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Summary text</Label>
                <Textarea
                  value={editing.content}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, content: e.target.value })
                  }
                  rows={5}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <CheckIcon data-icon="inline-start" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  <XIcon data-icon="inline-start" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={summary.id}
              className="group rounded-lg border bg-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="text-xs">
                  {summary.label}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      setEditing({
                        id: summary.id,
                        label: summary.label,
                        content: summary.content,
                      })
                    }
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDelete(summary.id, summary.label)}
                  >
                    <Trash2Icon className="text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {summary.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(summary.createdAt).toLocaleDateString()}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
