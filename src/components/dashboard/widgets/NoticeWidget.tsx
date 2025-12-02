import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface NoticeWidgetProps {
    announcements: any[]
}

export function NoticeWidget({ announcements }: NoticeWidgetProps) {
    return (
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40">
            <CardHeader className="pb-3 border-b border-slate-100/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500">
                            <Bell className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">공지사항</h3>
                    </div>
                    <Link href="/groupware/announcements">
                        <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-slate-900 rounded-full">
                            더보기 <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50/50">
                    {announcements.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/60 transition-colors cursor-pointer group">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-bold border-0 ${item.isNew ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {item.isNew ? '필독' : '공지'}
                                    </Badge>
                                    <span className="text-sm font-medium text-slate-800 group-hover:text-lime-600 transition-colors truncate max-w-[240px] sm:max-w-md">
                                        {item.title}
                                    </span>
                                    {item.isNew && <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] border-red-200 text-red-500 bg-red-50">N</Badge>}
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
    )
}
