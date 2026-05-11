import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { Dashboard } from "@/pages/Dashboard"
import { MasterEditor } from "@/pages/MasterEditor"
import { CVBuilder } from "@/pages/CVBuilder"
import { Templates } from "@/pages/Templates"
import { ExportPage } from "@/pages/ExportPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "master", element: <MasterEditor /> },
      { path: "builder", element: <CVBuilder /> },
      { path: "templates", element: <Templates /> },
      { path: "export/:id", element: <ExportPage /> },
    ],
  },
])

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </>
  )
}
