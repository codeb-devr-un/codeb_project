
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import { AdminSidebar } from "./AdminSidebar"
import { AdminDock } from "./AdminDock"
import { Separator } from "../ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import { Bell, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string) => void
  isDockMode?: boolean
  onDockModeToggle?: () => void
}

export default function AdminLayout({ 
    children, 
    currentPage = "dashboard", 
    onNavigate,
    isDockMode = false,
    onDockModeToggle
}: AdminLayoutProps) {
  const getPageName = (page: string) => {
      switch(page) {
          case "dashboard": return "Dashboard";
          case "tasks": return "My Tasks";
          case "projects": return "Project Management";
          case "projects-done": return "Completed Projects";
          case "notices": return "Notices";
          case "approvals": return "Approvals";
          case "board": return "Board";
          case "calendar": return "Calendar";
          case "hr": return "HR & Org Chart";
          case "finance": return "Finance";
          case "files": return "Files";
          default: return "Dashboard";
      }
  }

  return (
    <SidebarProvider>
      {/* Conditionally render Sidebar or Dock */}
      {!isDockMode ? (
        <AdminSidebar 
            currentPage={currentPage} 
            onNavigate={onNavigate} 
            onDockModeToggle={onDockModeToggle}
        />
      ) : (
        <AdminDock 
            currentTab={currentPage} 
            onNavigate={(page) => onNavigate?.(page)} 
            onExitDockMode={() => onDockModeToggle?.()} 
        />
      )}

      <SidebarInset className="bg-[#F8F9FA] relative overflow-hidden transition-all duration-500">
        {/* Ambient Background Blobs for Glass Effect - Lime Theme */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />
        
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/50 backdrop-blur-md border-b border-white/40 sticky top-0 z-10">
          <div className="flex items-center gap-2 px-4 w-full">
            {!isDockMode && <SidebarTrigger className="-ml-1 hover:bg-white/60 text-slate-500 hover:text-slate-900" />}
            {!isDockMode && <Separator orientation="vertical" className="mr-2 h-4 bg-slate-300" />}
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" onClick={() => onNavigate?.("dashboard")} className="text-slate-500 hover:text-lime-600 transition-colors font-medium">groupware</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-slate-400" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold text-slate-900">{getPageName(currentPage)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto flex items-center gap-4">
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="검색..." 
                        className="pl-8 h-9 bg-white/60 border-white/40 focus-visible:ring-1 focus-visible:ring-lime-500/50 placeholder:text-slate-400 shadow-sm backdrop-blur-sm rounded-xl" 
                    />
                </div>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/60 rounded-full text-slate-600">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </Button>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer">
                    <AvatarImage src="/avatars/shadcn.jpg" />
                    <AvatarFallback className="bg-black text-lime-400 font-bold">CN</AvatarFallback>
                </Avatar>
            </div>
          </div>
        </header>
        <div className={`flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 relative z-0 ${isDockMode ? "pb-24" : ""}`}>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
