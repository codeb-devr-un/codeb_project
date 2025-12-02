
import * as React from "react"
import { 
  Search, 
  LayoutList, 
  LayoutGrid, 
  ChevronDown, 
  Star, 
  MoreHorizontal, 
  Filter,
  Plus
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Progress } from "../ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface Project {
  id: string
  title: string
  description: string
  status: string
  progress: number
  team: { name: string, image?: string, fallback: string }[]
  budget: string
  period: string
  isStarred: boolean
}

const projects: Project[] = [
  {
    id: "1",
    title: "웹페이지 제작",
    description: "새로운 웹페이지를 기획하고 개발하여 런칭하는 프로젝트입니다.",
    status: "개발",
    progress: 6,
    team: [
      { name: "Kim", fallback: "K" },
      { name: "Kang", fallback: "K" },
      { name: "Yoo", fallback: "Y" },
      { name: "Lee", fallback: "L" },
    ],
    budget: "₩50,000,000",
    period: "2025. 11. 28. - 2026. 2. 26.",
    isStarred: true
  },
  {
    id: "2",
    title: "모바일 앱 리뉴얼",
    description: "기존 앱의 UI/UX를 개선하고 새로운 기능을 추가합니다.",
    status: "기획",
    progress: 25,
    team: [
      { name: "Park", fallback: "P" },
      { name: "Choi", fallback: "C" },
    ],
    budget: "₩35,000,000",
    period: "2025. 12. 01. - 2026. 3. 15.",
    isStarred: false
  },
  {
    id: "3",
    title: "사내 어드민 고도화",
    description: "관리자 페이지의 성능을 개선하고 대시보드를 개편합니다.",
    status: "디자인",
    progress: 45,
    team: [
      { name: "Kim", fallback: "K" },
      { name: "Lee", fallback: "L" },
      { name: "Jung", fallback: "J" },
    ],
    budget: "₩20,000,000",
    period: "2025. 11. 15. - 2026. 1. 30.",
    isStarred: false
  },
  {
    id: "4",
    title: "마케팅 캠페인 웹사이트",
    description: "신제품 출시를 위한 프로모션 페이지 제작",
    status: "대기",
    progress: 0,
    team: [
      { name: "Kang", fallback: "K" },
    ],
    budget: "₩15,000,000",
    period: "2026. 1. 10. - 2026. 2. 10.",
    isStarred: true
  }
]

export function Projects() {
  const [view, setView] = React.useState<"list" | "grid">("list")
  
  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-sm font-medium text-slate-500">프로젝트</h2>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">프로젝트 관리</h1>
            </div>
            <Button className="rounded-xl bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300 font-bold shadow-lg shadow-black/20">
                <Plus className="mr-2 h-4 w-4" /> 새 프로젝트
            </Button>
        </div>
        <p className="text-slate-500 text-sm">전체 프로젝트를 관리하고 진행 상황을 확인합니다.</p>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col gap-6">
        {/* Top Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white/40 p-1 rounded-xl backdrop-blur-sm border border-white/40 w-fit">
                <Button variant="ghost" size="sm" className="rounded-lg text-sm font-bold bg-white shadow-sm text-slate-900 px-4">
                    전체 <span className="ml-1 text-xs text-slate-400 font-normal">(4)</span>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 px-4 hover:bg-white/50">
                    진행 중 <span className="ml-1 text-xs text-slate-400 font-normal">(3)</span>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 px-4 hover:bg-white/50">
                    완료 <span className="ml-1 text-xs text-slate-400 font-normal">(0)</span>
                </Button>
            </div>

            <div className="flex items-center gap-3 flex-1 md:justify-end">
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-lime-500 transition-colors" />
                    <Input 
                        placeholder="프로젝트 검색..." 
                        className="pl-9 bg-white/60 border-white/40 rounded-xl focus-visible:ring-1 focus-visible:ring-lime-500/50 backdrop-blur-sm"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white/40 p-1 rounded-xl backdrop-blur-sm border border-white/40">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-lg ${view === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-900"}`}
                        onClick={() => setView("list")}
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-lg ${view === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-900"}`}
                        onClick={() => setView("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Tag Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <Button size="sm" className="rounded-full bg-black text-lime-400 hover:bg-slate-800 hover:text-lime-300 font-bold px-4 shadow-md">
                    전체
                </Button>
                {["기획", "디자인", "개발", "테스트", "완료", "대기"].map((tag) => (
                    <Button key={tag} size="sm" variant="outline" className="rounded-full bg-white/50 border-white/40 text-slate-600 hover:bg-white hover:text-slate-900 font-medium px-4 hover:border-white">
                        {tag}
                    </Button>
                ))}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-fit rounded-lg bg-white/50 border-white/40 text-slate-600 gap-2 hover:bg-white">
                        <Filter className="h-3.5 w-3.5" />
                        최신순
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem>최신순</DropdownMenuItem>
                    <DropdownMenuItem>오래된순</DropdownMenuItem>
                    <DropdownMenuItem>이름순</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Projects Table / Grid */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
            {view === "list" ? (
                <div className="space-y-1">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-4">프로젝트</div>
                        <div className="col-span-1 text-center">상태</div>
                        <div className="col-span-2">진행률</div>
                        <div className="col-span-2">팀</div>
                        <div className="col-span-1">예산</div>
                        <div className="col-span-1">기간</div>
                        <div className="col-span-1 text-right">액션</div>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <div 
                                key={project.id}
                                className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 hover:bg-white/90 hover:shadow-lg hover:shadow-lime-500/5 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                            >
                                {/* Project Info */}
                                <div className="col-span-4 space-y-1">
                                    <h3 className="font-bold text-slate-900 text-base group-hover:text-lime-600 transition-colors">{project.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-1 pr-4">{project.description}</p>
                                </div>

                                {/* Status */}
                                <div className="col-span-1 flex justify-center">
                                    <Badge className="bg-black text-lime-400 hover:bg-slate-900 rounded-md px-2.5 py-0.5 font-bold text-xs shadow-sm">
                                        {project.status}
                                    </Badge>
                                </div>

                                {/* Progress */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <Progress value={project.progress} className="h-2 bg-slate-100" indicatorClassName="bg-lime-400" />
                                    <span className="text-xs font-bold text-slate-700 w-8">{project.progress}%</span>
                                </div>

                                {/* Team */}
                                <div className="col-span-2">
                                    <div className="flex items-center -space-x-2">
                                        {project.team.slice(0, 3).map((member, i) => (
                                            <Avatar key={i} className="h-8 w-8 border-2 border-white ring-1 ring-slate-100">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">{member.fallback}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {project.team.length > 3 && (
                                            <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-100">
                                                +{project.team.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="col-span-1">
                                    <span className="text-sm font-bold text-slate-900">{project.budget}</span>
                                </div>

                                {/* Period */}
                                <div className="col-span-1">
                                    <span className="text-xs text-slate-500 font-medium">{project.period}</span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end items-center gap-2">
                                    <Button size="icon" variant="ghost" className={`h-8 w-8 rounded-full hover:bg-white ${project.isStarred ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-amber-400"}`}>
                                        <Star className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-400 hover:text-slate-900 rounded-full px-3 hidden xl:flex">
                                        상세보기
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white xl:hidden text-slate-400">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Grid View Card Implementation */}
                    {projects.map((project) => (
                        <div 
                            key={project.id}
                            className="flex flex-col p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 hover:bg-white/90 hover:shadow-lg hover:shadow-lime-500/5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer space-y-6"
                        >
                             <div className="flex items-start justify-between">
                                <Badge className="bg-black text-lime-400 hover:bg-slate-900 rounded-md px-2.5 py-0.5 font-bold text-xs">
                                    {project.status}
                                </Badge>
                                <Button size="icon" variant="ghost" className={`h-8 w-8 -mr-2 -mt-2 rounded-full hover:bg-white ${project.isStarred ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-amber-400"}`}>
                                    <Star className="h-4 w-4" />
                                </Button>
                             </div>
                             
                             <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-lime-600 transition-colors">{project.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 h-10">{project.description}</p>
                             </div>

                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500">진행률</span>
                                    <span className="text-slate-900">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2 bg-slate-100" indicatorClassName="bg-lime-400" />
                             </div>

                             <div className="pt-4 border-t border-white/50 flex items-center justify-between">
                                <div className="flex items-center -space-x-2">
                                    {project.team.slice(0, 3).map((member, i) => (
                                        <Avatar key={i} className="h-7 w-7 border-2 border-white ring-1 ring-slate-100">
                                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[9px] font-bold">{member.fallback}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-slate-900">{project.budget}</span>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
