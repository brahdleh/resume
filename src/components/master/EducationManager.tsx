import { useState } from "react"
import { PlusIcon, Trash2Icon, PencilIcon, CheckIcon } from "lucide-react"
import { useMasterStore } from "@/store/masterStore"
import type { Education, Certification } from "@/types/cv"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const emptyEdu: Omit<Education, "id"> = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  grade: "",
}

const emptyCert: Omit<Certification, "id"> = {
  name: "",
  issuer: "",
  date: "",
  url: "",
}

function EducationSection() {
  const { education, addEducation, updateEducation, deleteEducation } =
    useMasterStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyEdu)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyEdu)

  const eduField = (key: keyof typeof form) => ({
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  })

  const editField = (key: keyof typeof editForm) => ({
    value: editForm[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((p) => ({ ...p, [key]: e.target.value })),
  })

  const handleAdd = () => {
    if (!form.institution.trim() || !form.degree.trim()) return
    addEducation(form)
    setForm(emptyEdu)
    setAdding(false)
    toast.success("Education added")
  }

  const handleSaveEdit = (id: string) => {
    updateEducation(id, editForm)
    setEditingId(null)
    toast.success("Education updated")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Education</h3>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Institution</Label>
              <Input placeholder="University of..." autoFocus {...eduField("institution")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Degree</Label>
              <Input placeholder="BSc, MEng, MBA..." {...eduField("degree")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Field of study</Label>
              <Input placeholder="Computer Science" {...eduField("field")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Grade / Classification</Label>
              <Input placeholder="First Class, 3.9 GPA..." {...eduField("grade")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Start year</Label>
              <Input placeholder="2018" {...eduField("startDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End year</Label>
              <Input placeholder="2022" {...eduField("endDate")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!form.institution.trim()}>
              <CheckIcon data-icon="inline-start" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm(emptyEdu) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {education.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No education entries yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {education.map((edu) =>
          editingId === edu.id ? (
            <div key={edu.id} className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {(["institution", "degree", "field", "grade", "startDate", "endDate"] as const).map((k) => (
                  <div key={k} className="flex flex-col gap-1.5">
                    <Label className="capitalize">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</Label>
                    <Input {...editField(k)} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveEdit(edu.id)}>
                  <CheckIcon data-icon="inline-start" />Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={edu.id} className="group flex items-start justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{edu.degree} in {edu.field}</p>
                <p className="text-xs text-muted-foreground">{edu.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {edu.startDate} – {edu.endDate}
                  {edu.grade && ` · ${edu.grade}`}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon-sm" variant="ghost" onClick={() => { setEditingId(edu.id); setEditForm({ institution: edu.institution, degree: edu.degree, field: edu.field, startDate: edu.startDate, endDate: edu.endDate, grade: edu.grade ?? "" }) }}>
                  <PencilIcon />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => { deleteEducation(edu.id); toast.success("Removed") }}>
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function CertificationsSection() {
  const { certifications, addCertification, updateCertification, deleteCertification } =
    useMasterStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyCert)

  const certField = (key: keyof typeof form) => ({
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    addCertification(form)
    setForm(emptyCert)
    setAdding(false)
    toast.success("Certification added")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Certifications</h3>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Certification name</Label>
              <Input placeholder="AWS Solutions Architect" autoFocus {...certField("name")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Issuer</Label>
              <Input placeholder="Amazon Web Services" {...certField("issuer")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Input placeholder="Mar 2024" {...certField("date")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL (optional)</Label>
              <Input placeholder="https://..." {...certField("url")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!form.name.trim()}>
              <CheckIcon data-icon="inline-start" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm(emptyCert) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {certifications.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No certifications yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {certifications.map((cert) => (
          <div key={cert.id} className="group flex items-start justify-between rounded-lg border bg-card p-3">
            <div>
              <p className="text-sm font-medium">{cert.name}</p>
              <p className="text-xs text-muted-foreground">
                {cert.issuer} · {cert.date}
              </p>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View certificate
                </a>
              )}
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => { deleteCertification(cert.id); toast.success("Removed") }}
            >
              <Trash2Icon className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EducationManager() {
  return (
    <div className="flex flex-col gap-8">
      <EducationSection />
      <Separator />
      <CertificationsSection />
    </div>
  )
}
