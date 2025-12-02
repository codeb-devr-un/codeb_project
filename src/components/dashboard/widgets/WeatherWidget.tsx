import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sun, Cloud, CloudRain } from 'lucide-react'

interface WeatherData {
    temp: number
    condition: string
    humidity: number
    wind: number
}

interface WeatherWidgetProps {
    weather: WeatherData
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
    return (
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md hover:-translate-y-1 transition-all duration-300 group border border-white/20">
            <CardContent className="p-6 h-[160px] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 blur-2xl opacity-60"></div>
                <div className="flex justify-between h-full relative z-10">
                    <div className="flex flex-col justify-between">
                        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-full w-fit shadow-sm">
                            {weather.condition === 'sunny' ? <Sun className="h-5 w-5" /> :
                                weather.condition === 'cloudy' ? <Cloud className="h-5 w-5" /> :
                                    <CloudRain className="h-5 w-5" />}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                습도 {weather.humidity}%
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                바람 {weather.wind}m/s
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                        <div className="text-right mt-2">
                            <span className="text-4xl font-bold text-slate-900">{weather.temp}°</span>
                            <p className="text-sm text-slate-500 mt-1">
                                {weather.condition === 'sunny' ? '맑음' : weather.condition === 'cloudy' ? '흐림' : '비'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
