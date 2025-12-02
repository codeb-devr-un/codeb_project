
import * as React from "react"
import { 
  Home, 
  Briefcase, 
  Folder, 
  Bell, 
  Calendar, 
  Users, 
  Settings, 
  PanelLeft,
  FileText,
  LayoutDashboard
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface AdminDockProps {
  currentTab: string
  onNavigate: (tab: string) => void
  onExitDockMode: () => void
}

const dockItems = [
  { id: "dashboard", icon: Home, label: "홈" },
  { id: "tasks", icon: Briefcase, label: "내 작업" },
  { id: "projects", icon: Folder, label: "프로젝트" },
  { id: "files", icon: FileText, label: "파일함" },
  { id: "notices", icon: Bell, label: "알림" },
  { id: "calendar", icon: Calendar, label: "일정" },
  { id: "organization", icon: Users, label: "조직" },
  { id: "hr", icon: Briefcase, label: "근태" },
  { id: "settings", icon: Settings, label: "설정" },
]

export function AdminDock({ currentTab, onNavigate, onExitDockMode }: AdminDockProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end gap-3 px-4 py-3 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform duration-500">
        <TooltipProvider delayDuration={0}>
          {/* Dock Items */}
          {dockItems.map((item) => {
            const isActive = currentTab === item.id
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`
                      group relative flex items-center justify-center 
                      transition-all duration-300 ease-out origin-bottom
                      ${isActive ? "-translate-y-2" : "hover:-translate-y-2"}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                      ${isActive 
                        ? "bg-black text-lime-400 scale-110 shadow-lime-500/20" 
                        : "bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:shadow-lime-400/30"
                      }
                    `}>
                      <item.icon className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2 font-bold bg-black text-lime-400 border-none">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Separator */}
          <div className="w-[1px] h-8 bg-slate-300/50 mx-1 self-center" />

          {/* Exit Dock Mode Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onExitDockMode}
                className="group relative flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-md hover:bg-slate-800 hover:text-white hover:scale-110 transition-all">
                  <PanelLeft className="w-5 h-5" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2 font-bold">
              <p>사이드바 열기</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
