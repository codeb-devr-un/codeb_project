import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, FolderKanban, ClipboardList, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

export function QuickActionsWidget() {
    return (
        <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl border border-white/40">
            <CardHeader className="pb-4 border-b border-slate-100/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-lime-100 rounded-full">
                        <TrendingUp className="h-4 w-4 text-lime-700" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">빠른 실행</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
                <Link href="/projects" className="block">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700">
                        <FolderKanban className="mr-3 h-5 w-5" />
                        프로젝트 보기
                    </Button>
                </Link>
                <Link href="/tasks" className="block">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700">
                        <ClipboardList className="mr-3 h-5 w-5" />
                        내 작업 보기
                    </Button>
                </Link>
                <Link href="/kanban" className="block">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700">
                        <FileText className="mr-3 h-5 w-5" />
                        칸반 보드
                    </Button>
                </Link>
                <Link href="/gantt" className="block">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700">
                        <Calendar className="mr-3 h-5 w-5" />
                        간트 차트
                    </Button>
                </Link>
                <Link href="/files" className="block">
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 hover:bg-lime-50 hover:border-lime-200 hover:text-lime-700">
                        <FileText className="mr-3 h-5 w-5" />
                        파일 관리
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
