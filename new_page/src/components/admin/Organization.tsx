
import * as React from "react"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  Users, 
  MoreHorizontal, 
  Plus,
  Search,
  GripVertical,
  Mail
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"

// Types
type DepartmentId = "planning" | "dev" | "design" | "ops" | "marketing" | "sales" | "hr" | "unassigned"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  departmentId: DepartmentId
}

interface Department {
  id: DepartmentId
  name: string
  color: string // tailwind class for text/bg
  colorHex: string
}

const DEPARTMENTS: Department[] = [
  { id: "planning", name: "기획", color: "text-purple-500 bg-purple-500", colorHex: "#a855f7" },
  { id: "dev", name: "개발", color: "text-blue-500 bg-blue-500", colorHex: "#3b82f6" },
  { id: "design", name: "디자인", color: "text-pink-500 bg-pink-500", colorHex: "#ec4899" },
  { id: "ops", name: "운영", color: "text-emerald-500 bg-emerald-500", colorHex: "#10b981" },
  { id: "marketing", name: "마케팅", color: "text-orange-500 bg-orange-500", colorHex: "#f97316" },
  { id: "sales", name: "영업", color: "text-red-500 bg-red-500", colorHex: "#ef4444" },
  { id: "hr", name: "인사", color: "text-indigo-500 bg-indigo-500", colorHex: "#6366f1" },
]

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "천동은 (레오TV)", email: "cdokym77@gmail.com", role: "기획", avatar: "/avatars/01.png", departmentId: "planning" },
  { id: "2", name: "양마케팅", email: "yang.marketing@example.com", role: "개발", avatar: "/avatars/02.png", departmentId: "dev" },
  { id: "3", name: "유운영", email: "yoo.ops@example.com", role: "디자인", avatar: "/avatars/03.png", departmentId: "design" },
  { id: "4", name: "김기획", email: "kim.planning@example.com", role: "운영", avatar: "/avatars/04.png", departmentId: "ops" },
  { id: "5", name: "김개발", email: "kang.dev@example.com", role: "마케팅", avatar: "/avatars/05.png", departmentId: "marketing" },
  { id: "6", name: "한디자인", email: "han.design@example.com", role: "닷컴", avatar: "/avatars/06.png", departmentId: "sales" },
  { id: "7", name: "박인사", email: "park.hr@example.com", role: "인사", avatar: "/avatars/07.png", departmentId: "unassigned" },
  { id: "8", name: "최신입", email: "choi.new@example.com", role: "인턴", avatar: "/avatars/08.png", departmentId: "unassigned" },
]

// Drag Item Type
const ItemTypes = {
  MEMBER: 'member'
}

// Draggable Member Card Component
const MemberCard = ({ member, isCompact = false }: { member: Member, isCompact?: boolean }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MEMBER,
    item: { id: member.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Find department color
  const dept = DEPARTMENTS.find(d => d.id === member.departmentId)
  const colorClass = dept ? dept.color.split(" ")[0] : "text-slate-500"
  const bgClass = dept ? dept.color.split(" ")[1] : "bg-slate-500"

  return (
    <div
      ref={drag}
      className={`
        relative group bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-lime-300 transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isCompact ? "p-3" : "p-4"}
      `}
    >
      <div className="flex items-center gap-3">
         {/* Color Indicator Dot */}
         <div className={`w-1.5 h-8 rounded-full ${member.departmentId === 'unassigned' ? 'bg-slate-200' : bgClass}`} />
         
         <Avatar className={`${isCompact ? "h-8 w-8" : "h-10 w-10"} rounded-lg border border-slate-100`}>
            <AvatarImage src={member.avatar} />
            <AvatarFallback className={`rounded-lg ${colorClass} bg-slate-50 font-bold`}>{member.name.charAt(0)}</AvatarFallback>
         </Avatar>
         
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <p className={`font-bold text-slate-900 truncate ${isCompact ? "text-xs" : "text-sm"}`}>{member.name}</p>
                <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 bg-slate-50 text-slate-500`}>
                    {member.role}
                </Badge>
            </div>
            <p className={`text-slate-400 truncate ${isCompact ? "text-[10px]" : "text-xs"}`}>{member.email}</p>
         </div>
      </div>
    </div>
  )
}

// Droppable Department Column Component
const DepartmentColumn = ({ 
    department, 
    members, 
    onDrop 
}: { 
    department: Department, 
    members: Member[], 
    onDrop: (memberId: string, deptId: DepartmentId) => void 
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.MEMBER,
    drop: (item: { id: string }) => onDrop(item.id, department.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const colorText = department.color.split(" ")[0]
  const colorBg = department.color.split(" ")[1]

  return (
    <div 
        ref={drop}
        className={`
            flex flex-col h-full min-h-[200px] rounded-3xl border transition-all duration-300
            ${isOver ? "bg-lime-50/50 border-lime-400 shadow-lg shadow-lime-400/10" : "bg-white/40 border-white/60 hover:bg-white/60"}
        `}
    >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100/50">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${colorBg}`} />
                <h3 className="font-bold text-slate-900 text-sm">{department.name}</h3>
            </div>
            <Badge variant="outline" className="bg-white/50 border-slate-200 text-slate-500 text-xs font-medium">
                {members.length}명
            </Badge>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 flex-1">
            {members.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[100px]">
                    <span className="text-xs">멤버 없음</span>
                </div>
            ) : (
                members.map(member => (
                    <MemberCard key={member.id} member={member} isCompact={true} />
                ))
            )}
        </div>
    </div>
  )
}

export function Organization() {
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS)

  const handleDrop = (memberId: string, targetDeptId: DepartmentId) => {
    setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, departmentId: targetDeptId } : m
    ))
  }

  const unassignedMembers = members.filter(m => m.departmentId === 'unassigned')

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="max-w-[1600px] mx-auto w-full space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    <span>Workspace</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">조직 관리</h1>
                <p className="text-slate-500">팀원을 부서별로 관리합니다</p>
            </div>
            
            <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl h-10 bg-white border-slate-200 hover:bg-slate-50">
                    <Users className="w-4 h-4 mr-2" />
                    부서 관리
                </Button>
                <Button className="rounded-xl h-10 bg-black text-lime-400 hover:bg-lime-400 hover:text-black transition-colors font-bold shadow-lg shadow-black/10">
                    <Mail className="w-4 h-4 mr-2" />
                    멤버 초대
                </Button>
            </div>
        </div>

        {/* Unassigned / All Members Area */}
        <Card className="bg-white/70 backdrop-blur-2xl border-white/50 shadow-lg rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100/50 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            가입된 멤버 ({members.length}명)
                        </CardTitle>
                        <p className="text-xs text-slate-500 font-medium">💡 멤버 카드를 드래그하여 아래 부서로 배정할 수 있습니다</p>
                    </div>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="멤버 검색..." className="pl-9 rounded-xl bg-white/50 border-slate-200 focus:bg-white transition-all" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {/* Show unassigned first, then others? No, usually strictly unassigned here if it's a "staging area". 
                         But the prompt implies dragging FROM here. 
                         Let's just show 'unassigned' ones here as "Unassigned Members" or show ALL?
                         Screenshot shows "Joined Members" at top. Some have roles.
                         Let's show only Unassigned here to make it useful, OR show specific list.
                         Screenshot implies all cards are here initially or just a list. 
                         Let's show UNASSIGNED members here primarily so you can drag them down.
                         Wait, screenshot has filled cards in top area. "Kim Planning", "Lee Dev".
                         It seems top area is "All Members" or "Unassigned". 
                         Actually, usually in these UIs, top is "Pool" and bottom is "Buckets".
                         I'll show 'unassigned' members in the top pool for clarity, otherwise duplication is confusing.
                         Re-reading screenshot: Top cards have roles like "Development", "Design". They seem assigned.
                         Maybe the top view is just "Member List" and bottom is "Org Chart View".
                         Dragging from top list to bottom bucket updates the department.
                         I will show ALL members in the top list for now, but maybe filter?
                         Let's show UNASSIGNED members in a distinct way or just all.
                         If I show all, and I drag one that is already in 'dev' to 'sales', it updates.
                         Let's show ALL members in the top section.
                     */}
                     {members.map(member => (
                         <MemberCard key={member.id} member={member} />
                     ))}
                </div>
            </CardContent>
        </Card>

        {/* Department Columns */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 px-2">부서별 조직도</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                {DEPARTMENTS.map(dept => (
                    <DepartmentColumn 
                        key={dept.id} 
                        department={dept} 
                        members={members.filter(m => m.departmentId === dept.id)}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </div>

        {/* Footer Tip */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-amber-800/80 text-sm">
            <div className="mt-0.5 bg-amber-100 p-1 rounded-full">
                <Search className="w-3 h-3 text-amber-600" />
            </div>
            <p>
                <span className="font-bold text-amber-900">Tip:</span> 멤버 카드를 드래그하여 다른 부서로 이동할 수 있습니다. 칸반, 간트, 마인드맵에서 담당자를 지정할 때 부서별로 그룹화되어 표시됩니다.
            </p>
        </div>
        </div>
    </DndProvider>
  )
}
