import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coffee } from 'lucide-react'
import { format } from 'date-fns'

interface AttendanceWidgetProps {
    todayAttendance: any
}

export function AttendanceWidget({ todayAttendance }: AttendanceWidgetProps) {
    return (
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
                            <h3 className="font-bold text-lg tracking-tight text-slate-900">내 근태 현황</h3>
                            <p className="text-slate-800 text-xs font-medium opacity-80">오늘도 화이팅하세요!</p>
                        </div>
                    </div>
                    <Badge className="bg-black text-lime-400 hover:bg-slate-900 border-0 backdrop-blur-md px-3 py-1 shadow-lg rounded-full">
                        {todayAttendance?.checkIn ? '출근 완료' : '미출근'}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-2">
                    <div className="relative">
                        <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">출근 시간</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
                                {todayAttendance?.checkIn
                                    ? format(new Date(todayAttendance.checkIn), 'HH:mm')
                                    : '--:--'}
                            </span>
                            {todayAttendance?.checkIn && (
                                <span className="text-[10px] font-bold bg-white/40 text-slate-900 border border-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">정상</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">퇴근 시간</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900 opacity-50">
                                {todayAttendance?.checkOut
                                    ? format(new Date(todayAttendance.checkOut), 'HH:mm')
                                    : '18:00'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
