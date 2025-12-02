
import * as React from "react"
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Building2, 
  Wifi, 
  Play, 
  Square, 
  History,
  Coffee,
  Briefcase,
  CheckCircle2,
  XCircle,
  Plane,
  AlertCircle
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Badge } from "../ui/badge"

export function HR() {
  const [workType, setWorkType] = React.useState<"office" | "remote">("office")
  const [isWorking, setIsWorking] = React.useState(false)
  const [startTime, setStartTime] = React.useState<string>("--:--")
  const [endTime, setEndTime] = React.useState<string>("--:--")
  const [elapsedTime, setElapsedTime] = React.useState("0h 0m")

  const handleClockIn = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    setStartTime(timeString)
    setIsWorking(true)
    setEndTime("--:--")
  }

  const handleClockOut = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    setEndTime(timeString)
    setIsWorking(false)
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-slate-500">인사 관리</h2>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">HR & 근태 관리</h1>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/40 w-auto inline-flex h-auto shadow-sm">
          <TabsTrigger 
            value="attendance"
            className="rounded-xl px-6 py-2.5 text-sm font-bold data-[state=active]:bg-black data-[state=active]:text-lime-400 data-[state=active]:shadow-lg data-[state=active]:shadow-lime-400/20 transition-all"
          >
            <Clock className="w-4 h-4 mr-2" />
            출근 관리
          </TabsTrigger>
          <TabsTrigger 
            value="vacation"
            className="rounded-xl px-6 py-2.5 text-sm font-bold data-[state=active]:bg-black data-[state=active]:text-lime-400 data-[state=active]:shadow-lg data-[state=active]:shadow-lime-400/20 transition-all"
          >
            <Plane className="w-4 h-4 mr-2" />
            휴가 관리
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          
          {/* Status Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-600 mb-1">
                    <Coffee className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">출근 시간</span>
                <span className="text-2xl font-bold text-slate-900">{startTime}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
                    <History className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">퇴근 시간</span>
                <span className="text-2xl font-bold text-slate-900">{endTime}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-1">
                    <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">근무 시간</span>
                <span className="text-2xl font-bold text-slate-900">{elapsedTime}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mb-1">
                    <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">근무 위치</span>
                <span className="text-lg font-bold text-slate-900 truncate w-full">서울 강남구</span>
              </CardContent>
            </Card>
          </div>

          {/* Control Section */}
          <Card className="bg-white/70 backdrop-blur-2xl border-white/50 shadow-lg shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 md:p-10">
                <div className="space-y-8 flex flex-col items-center">
                    {/* Work Type Selector */}
                    <div className="space-y-4 w-full max-w-2xl">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">근무 형태 선택</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setWorkType("office")}
                                className={`relative group flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    workType === "office"
                                    ? "bg-black border-black text-lime-400 shadow-xl shadow-lime-400/10 scale-[1.02]"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                                    workType === "office" ? "bg-lime-400 text-black" : "bg-slate-100 text-slate-400"
                                }`}>
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg">사무실 출근</div>
                                    <div className={`text-xs ${workType === "office" ? "text-lime-400/60" : "text-slate-400"}`}>오피스 근무</div>
                                </div>
                                {workType === "office" && (
                                    <div className="absolute top-4 right-4 w-3 h-3 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.8)] animate-pulse" />
                                )}
                            </button>

                            <button
                                onClick={() => setWorkType("remote")}
                                className={`relative group flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                                    workType === "remote"
                                    ? "bg-black border-black text-lime-400 shadow-xl shadow-lime-400/10 scale-[1.02]"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                                    workType === "remote" ? "bg-lime-400 text-black" : "bg-slate-100 text-slate-400"
                                }`}>
                                    <Wifi className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg">재택 근무</div>
                                    <div className={`text-xs ${workType === "remote" ? "text-lime-400/60" : "text-slate-400"}`}>원격 근무</div>
                                </div>
                                {workType === "remote" && (
                                    <div className="absolute top-4 right-4 w-3 h-3 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.8)] animate-pulse" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-6 pt-4 w-full">
                        <button 
                            onClick={handleClockIn}
                            disabled={isWorking}
                            className={`group relative flex flex-col items-center justify-center w-32 h-32 rounded-full transition-all duration-500 ${
                                isWorking 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed scale-95 opacity-50" 
                                : "bg-lime-400 text-black shadow-[0_10px_40px_-10px_rgba(163,230,53,0.6)] hover:scale-105 hover:shadow-[0_20px_50px_-10px_rgba(163,230,53,0.8)]"
                            }`}
                        >
                            <Play className="w-10 h-10 mb-2 fill-current" />
                            <span className="font-bold text-sm">출근</span>
                        </button>

                        <button 
                            onClick={handleClockOut}
                            disabled={!isWorking}
                            className={`group relative flex flex-col items-center justify-center w-32 h-32 rounded-full transition-all duration-500 ${
                                !isWorking 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed scale-95 opacity-50" 
                                : "bg-black text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hover:bg-slate-900"
                            }`}
                        >
                            <Square className="w-10 h-10 mb-2 fill-current" />
                            <span className="font-bold text-sm">퇴근</span>
                        </button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Recent Records */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">최근 출근 기록</h3>
             <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm rounded-3xl overflow-hidden">
                 <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <History className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">최근 출근 기록이 없습니다.</p>
                 </div>
             </Card>
          </div>
        </TabsContent>

        {/* Vacation Tab */}
        <TabsContent value="vacation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vacation Request Form */}
                <Card className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border-white/50 shadow-lg rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-2">
                        <CardTitle className="text-2xl font-bold text-slate-900">휴가 신청</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">휴가 종류</Label>
                                <Select>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-lime-100 font-medium">
                                        <SelectValue placeholder="선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                        <SelectItem value="annual">연차</SelectItem>
                                        <SelectItem value="half">반차</SelectItem>
                                        <SelectItem value="sick">병가</SelectItem>
                                        <SelectItem value="special">경조사</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">승인자</Label>
                                <Select>
                                    <SelectTrigger className="h-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-lime-100 font-medium">
                                        <SelectValue placeholder="선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                        <SelectItem value="manager">김부장 (인사팀)</SelectItem>
                                        <SelectItem value="lead">이팀장 (개발팀)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">시작일</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                                    <Input 
                                        type="date"
                                        className="pl-12 h-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-lime-100"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">종료일</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                                    <Input 
                                        type="date"
                                        className="pl-12 h-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-lime-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">사유</Label>
                            <Textarea 
                                className="min-h-[150px] rounded-3xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-lime-100 resize-none p-6 text-slate-700"
                                placeholder="휴가 사유를 입력해주세요."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button className="rounded-full h-12 px-8 bg-black text-lime-400 hover:bg-lime-400 hover:text-black shadow-xl shadow-black/10 transition-all font-bold">
                                휴가 신청하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Vacation Stats */}
                <div className="space-y-6">
                    <Card className="bg-black text-white border-0 shadow-xl shadow-black/20 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 text-center space-y-2">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                                <span className="text-3xl">🏖️</span>
                            </div>
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">남은 연차</h3>
                            <div className="text-5xl font-bold text-lime-400 tracking-tight">12.5<span className="text-2xl text-lime-400/60 ml-2">일</span></div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm rounded-[2.5rem] overflow-hidden h-fit">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">휴가 사용 내역</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {[
                                        { date: "2025.10.15", type: "연차", days: "-1.0", status: "approved" },
                                        { date: "2025.09.20", type: "반차", days: "-0.5", status: "approved" },
                                        { date: "2025.08.01", type: "여름휴가", days: "-3.0", status: "approved" },
                                    ].map((item, i) => (
                                        <TableRow key={i} className="border-b border-slate-100 hover:bg-white/50">
                                            <TableCell className="pl-6 py-4 font-medium text-slate-700">{item.date}</TableCell>
                                            <TableCell className="text-slate-500">{item.type}</TableCell>
                                            <TableCell className="text-rose-500 font-bold text-right pr-6">{item.days}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
