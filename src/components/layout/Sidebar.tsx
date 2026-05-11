import { NavLink } from "react-router-dom"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  WrenchIcon,
  BookmarkIcon,
  BriefcaseIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", icon: LayoutDashboardIcon, label: "Dashboard", end: true },
  { to: "/master", icon: FileTextIcon, label: "Master CV" },
  { to: "/builder", icon: WrenchIcon, label: "CV Builder" },
  { to: "/templates", icon: BookmarkIcon, label: "Templates" },
]

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r bg-muted/20">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <BriefcaseIcon className="size-4 text-primary" />
        <span className="text-sm font-semibold tracking-tight">CV Studio</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">All data stored locally</p>
      </div>
    </aside>
  )
}
