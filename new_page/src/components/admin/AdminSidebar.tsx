
import * as React from "react"
import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Folder,
  LayoutDashboard,
  Settings2,
  Star,
  User,
  Users,
  Briefcase,
  LayoutList,
  UserCog,
  DollarSign,
  Home,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  PanelLeft,
  Layers
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "../ui/sidebar"

// Sample data with IDs for navigation
const data = {
  user: {
    name: "천동은 (레오TV)",
    email: "팀원",
    avatar: "/avatars/shadcn.jpg",
  },
  workspaces: [
    {
      name: "CodeB HQ",
      logo: Layers,
      plan: "Enterprise",
    },
    {
      name: "Personal",
      logo: User,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "홈",
      id: "dashboard",
      icon: Home,
      isStarred: true,
    },
    {
      title: "내 작업",
      id: "tasks",
      icon: Briefcase,
      isStarred: true,
    },
    {
      title: "파일 보관함",
      id: "files",
      icon: FileText,
    },
  ],
  navGroups: [
    {
      title: "프로젝트",
      icon: Folder,
      items: [
        {
          title: "진행 중인 프로젝트",
          id: "projects",
          isStarred: true,
        },
        {
          title: "완료된 프로젝트",
          id: "projects-done",
        },
      ],
    },
    {
      title: "그룹웨어",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "공지사항",
          id: "notices",
          icon: Bell,
          isStarred: true,
        },
        {
          title: "전자 결재",
          id: "approvals",
          icon: FileText,
        },
        {
          title: "게시판",
          id: "board",
          icon: LayoutList,
          isStarred: true,
        },
        {
          title: "일정 (캘린더)",
          id: "calendar",
          icon: Calendar,
          isStarred: true,
        },
        {
          title: "조직 관리",
          id: "organization",
          icon: Users,
          isStarred: true,
        },
        {
          title: "근태 관리",
          id: "hr",
          icon: Briefcase,
          isStarred: true,
        },
        {
          title: "재무 관리",
          id: "finance",
          icon: DollarSign,
        },
      ],
    },
  ],
}

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
    currentPage?: string;
    onNavigate?: (page: string) => void;
    onDockModeToggle?: () => void;
}

export function AdminSidebar({ currentPage = "dashboard", onNavigate, onDockModeToggle, ...props }: AdminSidebarProps) {
  const [activeWorkspace, setActiveWorkspace] = React.useState(data.workspaces[0])
  const ActiveLogo = activeWorkspace.logo

  return (
    <Sidebar 
        collapsible="icon" 
        className="border-r border-slate-100 bg-white/80 backdrop-blur-2xl" 
        {...props}
    >
      <SidebarHeader className="pb-4 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 hover:bg-slate-50 transition-all duration-300 group ring-1 ring-transparent hover:ring-slate-100"
                >
                  <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-black text-lime-400 shadow-lg shadow-black/10 transition-all group-hover:scale-105">
                    <ActiveLogo className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-slate-900 group-hover:text-black transition-colors text-base">
                      {activeWorkspace.name}
                    </span>
                    <span className="truncate text-xs text-slate-500 font-medium">
                      {activeWorkspace.plan} Plan
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto opacity-50 text-slate-400 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl bg-white/90 backdrop-blur-2xl border-slate-100 shadow-2xl p-2"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-slate-400 px-2 py-1.5 font-medium uppercase tracking-wider">
                  Workspaces
                </DropdownMenuLabel>
                {data.workspaces.map((workspace) => {
                    const WorkspaceLogo = workspace.logo
                    return (
                  <DropdownMenuItem
                    key={workspace.name}
                    onClick={() => setActiveWorkspace(workspace)}
                    className="gap-3 p-2.5 rounded-xl focus:bg-lime-50 focus:text-black cursor-pointer group"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white group-focus:border-lime-300 group-focus:bg-lime-400 group-focus:text-black text-slate-600 transition-colors">
                      <WorkspaceLogo className="size-4 shrink-0" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">{workspace.name}</span>
                        <span className="text-[10px] text-slate-400 group-focus:text-slate-600">{workspace.plan}</span>
                    </div>
                  </DropdownMenuItem>
                )})}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => {
              const isActive = item.id === currentPage;
              return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={isActive}
                    onClick={() => item.id && onNavigate?.(item.id)}
                    className={`h-11 transition-all duration-300 rounded-2xl ${
                      isActive 
                        ? "bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20 hover:shadow-lime-400/30 font-bold" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium"
                    }`}
                >
                  {item.icon && <item.icon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />}
                  <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
                {item.isStarred && (
                   <SidebarMenuAction showOnHover className="hover:bg-transparent right-3">
                     <Star className="h-4 w-4 text-slate-300 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                   </SidebarMenuAction>
                )}
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Collapsible Groups */}
        <SidebarGroup className="mt-4 group-data-[collapsible=icon]:mt-0">
          <div className="px-3 py-2 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider opacity-60 group-data-[collapsible=icon]:hidden">
            Applications
          </div>
          <SidebarMenu className="gap-1">
            {data.navGroups.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive || item.items?.some(sub => sub.id === currentPage)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                        tooltip={item.title} 
                        className="h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:shadow-sm transition-all duration-300 rounded-xl font-medium"
                    >
                      {item.icon && <item.icon className="text-slate-400 group-hover:text-slate-600 h-4 w-4" />}
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-slate-300 group-hover:text-slate-500 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l-slate-200 ml-5 pl-3 my-1 space-y-1">
                      {item.items?.map((subItem) => {
                        const isSubActive = subItem.id === currentPage;
                        return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isSubActive}
                            onClick={() => subItem.id && onNavigate?.(subItem.id)}
                            className={`h-9 rounded-lg transition-all duration-200 cursor-pointer ${
                                isSubActive 
                                    ? "text-slate-900 font-bold bg-slate-100" 
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-2 w-full">
                                {subItem.icon && <subItem.icon className={`h-3.5 w-3.5 ${isSubActive ? "text-slate-900" : "opacity-60 group-hover:opacity-100 group-hover:text-slate-600"}`} />}
                                <span>{subItem.title}</span>
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )})}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3">
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-1 border border-white/40 shadow-sm group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:p-0">
            <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
                <div 
                    onClick={onDockModeToggle}
                    className="flex items-center gap-2 px-2 py-2 rounded-2xl hover:bg-white/80 cursor-pointer transition-colors group"
                >
                    <PanelLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 group-data-[collapsible=icon]:hidden">Dock Mode</span>
                </div>
            </div>
            <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-white/80 hover:bg-white/60 transition-all duration-300 rounded-2xl group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                    >
                    <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                        <AvatarImage src={data.user.avatar} alt={data.user.name} />
                        <AvatarFallback className="rounded-xl bg-black text-lime-400 font-bold">천</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-1 group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold text-slate-900">{data.user.name}</span>
                        <span className="truncate text-xs text-slate-500 font-medium">{data.user.email}</span>
                    </div>
                    <LogOut className="ml-auto size-4 opacity-40 text-slate-500 hover:text-rose-500 hover:opacity-100 transition-all group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-3xl bg-white/90 backdrop-blur-2xl border-white/50 shadow-2xl mb-2 p-2"
                    side="bottom"
                    align="end"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm">
                        <Avatar className="h-9 w-9 rounded-xl border border-white shadow-sm">
                        <AvatarImage src={data.user.avatar} alt={data.user.name} />
                        <AvatarFallback className="rounded-xl bg-black text-lime-400">천</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold text-slate-900">{data.user.name}</span>
                        <span className="truncate text-xs text-slate-500">{data.user.email}</span>
                        </div>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-xl focus:bg-lime-50 focus:text-black cursor-pointer py-2.5">
                        <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="font-medium">Upgrade Plan</span>
                    </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-xl focus:bg-slate-100 cursor-pointer py-2.5">
                        <UserCog className="mr-2 h-4 w-4 text-slate-500" />
                        Account
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl focus:bg-slate-100 cursor-pointer py-2.5">
                        <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                        Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl focus:bg-slate-100 cursor-pointer py-2.5">
                        <Settings2 className="mr-2 h-4 w-4 text-slate-500" />
                        Settings
                    </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem className="rounded-xl focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer py-2.5">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            </SidebarMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
