
import * as React from "react"
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Eye, 
  Folder, 
  Pencil, 
  Trash2, 
  LayoutList, 
  KanbanSquare,
  Plus,
  ArrowUp,
  Calendar,
  X
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "../ui/dialog"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Badge } from "../ui/badge"

type TaskStatus = "todo" | "in-progress" | "review" | "done" | "paused"

interface Task {
  id: string
  title: string
  description: string
  project: string
  date: string
  status: TaskStatus
}

const tasks: Task[] = [
  {
    id: "1",
    title: "반응형 모바일 검토",
    description: "웹페이지 제작",
    project: "웹페이지 제작",
    date: "2025. 11. 29.",
    status: "in-progress"
  },
  {
    id: "2",
    title: "개발 환경 셋팅",
    description: "웹페이지 제작",
    project: "개인 작업",
    date: "2025. 12. 1.",
    status: "paused"
  },
  {
    id: "3",
    title: "프론트엔드 개발",
    description: "기능 구현 및 API 연동",
    project: "웹페이지 제작",
    date: "2025. 12. 4.",
    status: "done"
  },
  {
    id: "4",
    title: "프로젝트 킥오프",
    description: "프로젝트 목표 및 일정 공유",
    project: "웹페이지 제작",
    date: "2025. 12. 12.",
    status: "in-progress"
  },
  {
    id: "5",
    title: "요구사항 분석",
    description: "고객 요구사항 및 기능 명세서 작성",
    project: "웹페이지 제작",
    date: "2025. 12. 14.",
    status: "review"
  },
  {
    id: "6",
    title: "UI/UX 디자인",
    description: "와이어프레임 및 디자인 시스템 구축",
    project: "웹페이지 제작",
    date: "2025. 12. 18.",
    status: "in-progress"
  },
  {
    id: "7",
    title: "퍼블리싱",
    description: "HTML/CSS 마크업 작업",
    project: "웹페이지 제작",
    date: "2026. 1. 2.",
    status: "in-progress"
  }
]

export function MyTasks() {
  const [view, setView] = React.useState<"list" | "board">("list")
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "in-progress": return <Play className="h-4 w-4 text-orange-500 fill-orange-500/20" />
      case "paused": return <Pause className="h-4 w-4 text-slate-400" />
      case "done": return <CheckCircle2 className="h-4 w-4 text-lime-500 fill-lime-500/20" />
      case "review": return <Eye className="h-4 w-4 text-purple-500" />
      default: return <Folder className="h-4 w-4 text-slate-400" />
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsEditOpen(true)
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-slate-500">작업 관리</h2>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">내 작업</h1>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-1 rounded-2xl flex items-center shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView("list")}
            className={`rounded-xl text-xs font-medium px-3 ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            <LayoutList className="mr-2 h-3.5 w-3.5" /> 리스트
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView("board")}
            className={`rounded-xl text-xs font-medium px-3 ${view === "board" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            <KanbanSquare className="mr-2 h-3.5 w-3.5" /> 칸반 보드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white hover:text-slate-900 text-slate-400"><Folder className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white hover:text-orange-500 text-slate-400"><Play className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white hover:text-purple-500 text-slate-400"><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white hover:text-lime-500 text-slate-400"><CheckCircle2 className="h-4 w-4" /></Button>
            </div>
        </div>
        <Separator orientation="vertical" className="hidden sm:block h-6 bg-slate-200" />
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Project:</span>
             <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full bg-black text-lime-400 hover:bg-slate-800 hover:text-lime-300 text-xs font-bold px-4 shadow-lg shadow-black/10"
                >
                    전체
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full bg-white/50 text-slate-600 hover:bg-white hover:text-slate-900 text-xs font-medium px-4"
                >
                    개인 작업
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full bg-white/50 text-slate-600 hover:bg-white hover:text-slate-900 text-xs font-medium px-4"
                >
                    웹페이지 제작
                </Button>
             </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, i) => (
            <div 
                key={task.id}
                onDoubleClick={() => handleTaskClick(task)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 hover:bg-white/90 hover:shadow-lg hover:shadow-lime-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer gap-4"
            >
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {getStatusIcon(task.status)}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-lime-600 transition-colors text-base">{task.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Folder className="h-3 w-3" />
                            <span>{task.project}</span>
                            <span className="text-slate-300">|</span>
                            <Calendar className="h-3 w-3" />
                            <span>{task.date}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 pl-14 sm:pl-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white">
                        <Pause className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-purple-500 hover:bg-white">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task);
                        }}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-lime-600 hover:bg-white"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        ))}
      </div>

      {/* Floating Input */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
        <div className="w-full max-w-2xl pointer-events-auto">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-lime-300 to-emerald-300 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl shadow-slate-200/50 p-2 pr-2.5">
                    <div className="pl-4 pr-2 text-slate-400">
                        <Plus className="h-5 w-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="새 작업을 입력하세요..." 
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400 h-10 outline-none text-sm font-medium"
                    />
                    <Button 
                        size="icon" 
                        className="h-10 w-10 rounded-full bg-black text-lime-400 hover:bg-lime-400 hover:text-black transition-colors shadow-md"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/80 backdrop-blur-2xl border-white/40 shadow-2xl rounded-3xl p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100/50">
                <DialogTitle className="text-xl font-bold text-slate-900">작업 수정</DialogTitle>
            </DialogHeader>
            
            {selectedTask && (
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">작업명</Label>
                        <Input 
                            id="title" 
                            defaultValue={selectedTask.title} 
                            className="bg-white/50 border-slate-200/50 focus:bg-white focus:border-lime-300 rounded-xl h-11 font-bold text-slate-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-xs font-bold text-slate-500 uppercase tracking-wider">설명</Label>
                        <Input 
                            id="desc" 
                            defaultValue={selectedTask.description} 
                            className="bg-white/50 border-slate-200/50 focus:bg-white focus:border-lime-300 rounded-xl h-11 text-slate-700"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">상태</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "todo", icon: Folder, label: "할 일" },
                                { id: "in-progress", icon: Play, label: "진행중" },
                                { id: "review", icon: Eye, label: "검토" },
                                { id: "done", icon: CheckCircle2, label: "완료" }
                            ].map(status => {
                                const isSelected = selectedTask.status === status.id;
                                const Icon = status.icon;
                                return (
                                    <Button
                                        key={status.id}
                                        type="button"
                                        variant="ghost"
                                        className={`rounded-xl h-10 px-4 border transition-all ${
                                            isSelected 
                                            ? "bg-black text-lime-400 border-black shadow-md shadow-lime-400/20 hover:bg-slate-900 hover:text-lime-300" 
                                            : "bg-white border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {status.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">프로젝트</Label>
                        <Select defaultValue={selectedTask.project}>
                            <SelectTrigger className="h-11 rounded-xl bg-white/50 border-slate-200/50 focus:ring-lime-300/50">
                                <SelectValue placeholder="프로젝트 선택" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="웹페이지 제작">웹페이지 제작</SelectItem>
                                <SelectItem value="개인 작업">개인 작업</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">시작일</Label>
                            <div className="relative">
                                <Input 
                                    type="date"
                                    defaultValue="2025-11-27" 
                                    className="bg-white/50 border-slate-200/50 focus:bg-white focus:border-lime-300 rounded-xl h-11 pl-10"
                                />
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">마감일</Label>
                            <div className="relative">
                                <Input 
                                    type="date"
                                    defaultValue="2025-11-28"
                                    className="bg-white/50 border-slate-200/50 focus:bg-white focus:border-lime-300 rounded-xl h-11 pl-10"
                                />
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100/50 flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl h-11 px-6 hover:bg-slate-200/50 text-slate-500 hover:text-slate-900">
                    취소
                </Button>
                <Button className="rounded-xl h-11 px-8 bg-black text-lime-400 hover:bg-lime-400 hover:text-black shadow-lg shadow-black/20 transition-all font-bold">
                    저장
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
