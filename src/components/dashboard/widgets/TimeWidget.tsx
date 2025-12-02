import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function TimeWidget() {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        // Hydration mismatch 방지를 위해 초기 렌더링 후 시간 설정
        setCurrentTime(new Date())
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
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
                    <span className="text-4xl font-bold tracking-tight text-slate-900">
                        {format(currentTime, 'HH:mm')}
                    </span>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        {format(currentTime, 'a', { locale: ko })} 근무 시간
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
