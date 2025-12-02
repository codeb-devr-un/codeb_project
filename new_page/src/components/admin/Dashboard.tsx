
import { 
  Clock, 
  Sun, 
  Coffee, 
  LogOut, 
  CheckCircle2, 
  Timer, 
  AlertCircle, 
  FileText, 
  ChevronRight,
  Plus,
  Calendar,
  Folder,
  UserCheck,
  MoreHorizontal,
  ArrowUpRight,
  Bell,
  Settings2,
  ChevronUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Progress } from "../ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            반가워요, 천동은님 👋
          </h1>
          <p className="text-slate-500 font-medium">
            오늘도 활기찬 하루 되세요! 2025년 11월 29일 토요일
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl bg-white/50 hover:bg-white/80 text-slate-700 border-white/40 backdrop-blur-sm shadow-sm">
                <Calendar className="mr-2 h-4 w-4" /> 일정 관리
            </Button>
            <Button className="rounded-xl bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 font-bold">
                <Plus className="mr-2 h-4 w-4" /> 새 업무 작성
            </Button>
        </div>
      </div>

      {/* Top Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Time Widget */}
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md hover:-translate-y-1 transition-all duration-300 border border-white/20">
          <CardContent className="p-6 flex flex-col justify-between h-[160px] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-lime-50 rounded-full -mr-8 -mt-8 blur-2xl opacity-60"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="p-2.5 bg-black text-lime-400 rounded-full shadow-md">
                <Clock className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-lime-100 text-lime-800 hover:bg-lime-200 border-0 rounded-full px-3">
                Seoul
              </Badge>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-4xl font-bold tracking-tight text-slate-900">08:25</span>
              <p className="text-sm text-slate-500 mt-1 font-medium">오전 근무 시간입니다</p>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md hover:-translate-y-1 transition-all duration-300 group border border-white/20">
          <CardContent className="p-6 h-[160px] relative overflow-hidden">
             <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 blur-2xl opacity-60"></div>
             <div className="flex justify-between h-full relative z-10">
                <div className="flex flex-col justify-between">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-full w-fit shadow-sm">
                        <Sun className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            습도 65%
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            바람 12m/s
                        </span>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <div className="text-right mt-2">
                        <span className="text-4xl font-bold text-slate-900">18°</span>
                        <p className="text-sm text-slate-500 mt-1">맑음</p>
                    </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Commute Status Widget - Lime Green Theme */}
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-lime-400 text-slate-900 hover:-translate-y-1 transition-all duration-300 col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-32 bg-white opacity-20 blur-3xl rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 p-20 bg-lime-300 opacity-40 blur-3xl rounded-full -ml-10 -mb-10"></div>
            
            <CardContent className="p-6 h-[160px] flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-black/10 backdrop-blur-md rounded-full border border-black/5 shadow-sm">
                             <Coffee className="h-5 w-5 text-slate-900" />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg tracking-tight text-slate-900">근태 현황</h3>
                             <p className="text-slate-800 text-xs font-medium opacity-80">오늘도 화이팅하세요!</p>
                         </div>
                    </div>
                    <Badge className="bg-black text-lime-400 hover:bg-slate-900 border-0 backdrop-blur-md px-3 py-1 shadow-lg rounded-full">
                        정상 근무
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-2">
                    <div className="relative">
                        <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">출근 시간</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900 drop-shadow-sm">08:55</span>
                            <span className="text-[10px] font-bold bg-white/40 text-slate-900 border border-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">SAFE</span>
                        </div>
                    </div>
                    <div>
                         <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">퇴근 예정</p>
                         <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900 opacity-50">18:00</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Stats & Metrics Area - "Liquid Glass" Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Approval Stats Widgets + Activity Widget */}
        <div className="lg:col-span-2 space-y-6">
            {/* 4 Independent Widget Cards - Liquid Glass Style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "대기 문서", count: 5, icon: FileText, color: "text-slate-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-slate-100/80" },
                    { label: "진행 중", count: 12, icon: Timer, color: "text-blue-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-blue-50/80" },
                    { label: "반려됨", count: 1, icon: AlertCircle, color: "text-rose-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-rose-50/80" },
                    { label: "승인 완료", count: 34, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-white/60 backdrop-blur-xl", iconBg: "bg-emerald-50/80" },
                ].map((stat, index) => (
                    <Card 
                        key={index} 
                        className={`rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative overflow-hidden ${stat.bg}`}
                    >
                        {/* Gloss Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                        
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center h-[140px] relative z-10">
                            <div className={`p-3 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm backdrop-blur-sm ${stat.iconBg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-bold text-slate-800 tracking-tight drop-shadow-sm">{stat.count}</span>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Widget - Glass Style */}
            <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40">
                <CardHeader className="pb-4 border-b border-slate-100/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-lime-100 rounded-full">
                                <Timer className="h-4 w-4 text-lime-700" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900">최근 승인 활동</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-lime-600 rounded-full">
                            전체보기 <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                    <AvatarImage src={`/avatars/0${i+1}.png`} />
                                    <AvatarFallback className="bg-black text-lime-400 font-bold text-xs">JD</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                    <div className="w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white"></div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-lime-600 transition-colors">지출 결의서 승인 요청 #{2025000 + i}</p>
                                    <span className="text-[10px] text-slate-400">2시간 전</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">김민지 (마케팅팀)</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>법인카드 사용 내역 승인 건</span>
                                </div>
                            </div>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-slate-100/50 text-slate-400 group-hover:bg-lime-400 group-hover:text-slate-900 transition-colors">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Quick Actions Grid - Glass Style */}
        <div className="space-y-6">
             <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40 h-full flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">빠른 실행</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-5">
                    <div className="grid grid-cols-2 gap-3 h-full content-start">
                        {[
                          { label: "일정 추가", icon: Calendar, color: "bg-rose-50 text-rose-600", border: "hover:border-rose-100 hover:bg-rose-50/50" },
                          { label: "프로젝트", icon: Folder, color: "bg-violet-50 text-violet-600", border: "hover:border-violet-100 hover:bg-violet-50/50" },
                          { label: "증명서 발급", icon: FileText, color: "bg-amber-50 text-amber-600", border: "hover:border-amber-100 hover:bg-amber-50/50" },
                          { label: "휴가 신청", icon: Sun, color: "bg-sky-50 text-sky-600", border: "hover:border-sky-100 hover:bg-sky-50/50" },
                          { label: "조직도", icon: UserCheck, color: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-100 hover:bg-emerald-50/50" },
                          { label: "설정", icon: Settings2, color: "bg-slate-100 text-slate-600", border: "hover:border-slate-200 hover:bg-slate-100/50" },
                        ].map((action, i) => (
                            <Button 
                                key={i} 
                                variant="ghost" 
                                className={`h-[5.5rem] flex flex-col gap-3 items-center justify-center bg-white/50 rounded-3xl border border-white/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm ${action.border}`}
                            >
                                <div className={`p-2.5 rounded-full ${action.color} transition-transform group-hover:scale-110 shadow-sm`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>

      {/* Notices & Board Row - Glass Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notices */}
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40">
          <CardHeader className="pb-3 border-b border-slate-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500">
                    <Bell className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">공지사항</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-slate-900 rounded-full">
                더보기 <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50/50">
              {[
                { title: "11월 전사 회의 안내 및 자료 공유", date: "2025.11.23", tag: "필독", tagColor: "bg-red-50 text-red-600" },
                { title: "연말 휴가 신청 마감 안내 (12/15까지)", date: "2025.11.22", tag: "공지", tagColor: "bg-blue-50 text-blue-600" },
                { title: "사내 보안 정책 업데이트 안내", date: "2025.11.20", tag: "보안", tagColor: "bg-slate-100 text-slate-600" },
                { title: "4분기 우수 사원 시상식 안내", date: "2025.11.18", tag: "행사", tagColor: "bg-amber-50 text-amber-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/60 transition-colors cursor-pointer group">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-bold border-0 ${item.tagColor}`}>
                        {item.tag}
                      </Badge>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-lime-600 transition-colors truncate max-w-[240px] sm:max-w-md">
                        {item.title}
                      </span>
                      {i === 0 && <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] border-red-200 text-red-500 bg-red-50">N</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:block font-medium">{item.date}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-lime-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40">
          <CardHeader className="pb-3 border-b border-slate-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-100 text-lime-700">
                    <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">최근 게시글</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-slate-900 rounded-full">
                더보기 <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50/50">
              {[
                { title: "이번 주 점심 메뉴 추천 받습니다! 🍔", author: "김철수", team: "개발팀", date: "11.29", comments: 12 },
                { title: "프론트엔드 스터디 멤버 모집합니다 (React)", author: "이영희", team: "디자인팀", date: "11.28", comments: 5 },
                { title: "사내 동호회 가입 신청서 양식", author: "박민수", team: "인사팀", date: "11.27", comments: 3 },
                { title: "다음 주 워크샵 장소 투표해주세요", author: "정수진", team: "경영지원팀", date: "11.26", comments: 24 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/60 transition-colors cursor-pointer group">
                  <div className="flex items-center flex-1 min-w-0 gap-3 mr-4">
                     <span className="text-sm font-medium text-slate-800 group-hover:text-lime-600 transition-colors truncate">
                        {item.title}
                     </span>
                     {item.comments > 0 && (
                         <span className="flex items-center justify-center bg-lime-50 text-lime-700 text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full shrink-0">
                            {item.comments}
                         </span>
                     )}
                     
                     <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-slate-400 shrink-0">
                        <span className="text-slate-600 font-medium">{item.team}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500">{item.author}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400">{item.date}</span>
                     </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 group-hover:text-lime-600 hover:bg-lime-50 rounded-full shrink-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
