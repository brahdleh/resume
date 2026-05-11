import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PersonalInfoForm } from "@/components/master/PersonalInfoForm"
import { SummaryManager } from "@/components/master/SummaryManager"
import { ExperienceManager } from "@/components/master/ExperienceManager"
import { SkillsManager } from "@/components/master/SkillsManager"
import { EducationManager } from "@/components/master/EducationManager"

export function MasterEditor() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-base font-semibold">Master CV</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your complete career record — add everything; choose what to include per application
        </p>
      </div>

      <Tabs defaultValue="personal" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-6">
          <TabsList className="h-10 gap-0 rounded-none bg-transparent p-0">
            {[
              { value: "personal", label: "Personal" },
              { value: "summaries", label: "Summaries" },
              { value: "experience", label: "Experience" },
              { value: "skills", label: "Skills" },
              { value: "education", label: "Education & Certs" },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 text-sm font-normal text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {[
          { value: "personal", component: <PersonalInfoForm /> },
          { value: "summaries", component: <SummaryManager /> },
          { value: "experience", component: <ExperienceManager /> },
          { value: "skills", component: <SkillsManager /> },
          { value: "education", component: <EducationManager /> },
        ].map(({ value, component }) => (
          <TabsContent
            key={value}
            value={value}
            className="m-0 flex-1 overflow-hidden"
          >
            <ScrollArea className="h-full">
              <div className="mx-auto max-w-3xl px-6 py-6">{component}</div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
