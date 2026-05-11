import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Job, JobStatus } from "@/types/jobs"

interface JobDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    company: string
    url?: string
    description?: string
    status: JobStatus
  }) => void
  initial?: Partial<Job>
  mode?: "create" | "edit"
}

export function JobDialog({
  open,
  onClose,
  onSave,
  initial,
  mode = "create",
}: JobDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [company, setCompany] = useState(initial?.company ?? "")
  const [url, setUrl] = useState(initial?.url ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [status, setStatus] = useState<JobStatus>(initial?.status ?? "active")

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "")
      setCompany(initial?.company ?? "")
      setUrl(initial?.url ?? "")
      setDescription(initial?.description ?? "")
      setStatus(initial?.status ?? "active")
    }
  }, [open, initial])

  const handleSave = () => {
    if (!title.trim() || !company.trim()) return
    onSave({
      title: title.trim(),
      company: company.trim(),
      url: url.trim() || undefined,
      description: description.trim() || undefined,
      status,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Job" : "Edit Job"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-y-auto py-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-title">Job title</Label>
              <Input
                id="job-title"
                placeholder="Senior Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-company">Company</Label>
              <Input
                id="job-company"
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-url">Job posting URL (optional)</Label>
            <Input
              id="job-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as JobStatus)}
            >
              <SelectTrigger id="job-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-description">Job description (optional)</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="max-h-48 resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !company.trim()}
          >
            {mode === "create" ? "Add Job" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
