import { useState } from "react"
import { useMasterStore } from "@/store/masterStore"
import type { PersonalInfo } from "@/types/cv"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function PersonalInfoForm() {
  const { personalInfo, updatePersonalInfo } = useMasterStore()
  const [form, setForm] = useState<PersonalInfo>(personalInfo)

  const field = (key: keyof PersonalInfo) => ({
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const handleSave = () => {
    updatePersonalInfo(form)
    toast.success("Personal info saved")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium">Identity</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your name and professional title
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Smith" {...field("name")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Job title</Label>
          <Input
            id="title"
            placeholder="Senior Software Engineer"
            {...field("title")}
          />
        </div>
      </div>

      <Separator />

      <h3 className="text-sm font-medium">Contact</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            {...field("email")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+44 7700 000000"
            {...field("phone")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="London, UK"
            {...field("location")}
          />
        </div>
      </div>

      <Separator />

      <h3 className="text-sm font-medium">Links</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="linkedin.com/in/janesmith"
            {...field("linkedin")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            placeholder="github.com/janesmith"
            {...field("github")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="janesmith.dev"
            {...field("website")}
          />
        </div>
      </div>

      <div>
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  )
}
