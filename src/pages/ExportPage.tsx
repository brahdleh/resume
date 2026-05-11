import { useParams, useNavigate } from "react-router-dom"
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { ArrowLeftIcon, DownloadIcon } from "lucide-react"
import { useCVStore } from "@/store/cvStore"
import { useMasterStore } from "@/store/masterStore"
import { useFormatStore } from "@/store/formatStore"
import { CVPDFDocument } from "@/components/pdf/CVDocument"
import { Button } from "@/components/ui/button"

export function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { documents } = useCVStore()
  const master = useMasterStore()
  const { settings: fmt } = useFormatStore()

  const doc = documents.find((d) => d.id === id)

  if (!doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">CV not found.</p>
        <Button variant="outline" onClick={() => navigate("/builder")}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Builder
        </Button>
      </div>
    )
  }

  const filename = `${doc.name.replace(/\s+/g, "_")}.pdf`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/builder")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <div className="flex-1">
          <span className="text-sm font-medium">{doc.name}</span>
          {doc.targetRole && (
            <span className="ml-2 text-xs text-muted-foreground">
              — {doc.targetRole}
            </span>
          )}
        </div>
        <PDFDownloadLink
          document={<CVPDFDocument cv={doc} master={master} fmt={fmt} />}
          fileName={filename}
        >
          {({ loading }) => (
            <Button size="sm" disabled={loading}>
              <DownloadIcon data-icon="inline-start" />
              {loading ? "Generating…" : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="flex-1 overflow-hidden bg-muted/30">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <CVPDFDocument cv={doc} master={master} fmt={fmt} />
        </PDFViewer>
      </div>
    </div>
  )
}
