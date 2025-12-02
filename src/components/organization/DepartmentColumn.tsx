'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import MemberCard from './MemberCard'

interface DepartmentColumnProps {
    department: {
        id: string
        name: string
        color: string
    }
    members: any[]
}

export default function DepartmentColumn({ department, members }: DepartmentColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: department.id,
    })

    return (
        <div
            ref={setNodeRef}
            className={`
                flex flex-col h-full min-h-[200px] rounded-3xl border transition-all duration-300
                ${isOver
                    ? 'bg-lime-50/50 border-lime-400 shadow-lg shadow-lime-400/10'
                    : 'bg-white/40 border-white/60 hover:bg-white/60 backdrop-blur-sm'
                }
            `}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100/50">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: department.color }}
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{department.name}</h3>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-white/50 border border-slate-200 text-slate-500 rounded-lg">
                    {members.length}명
                </span>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2 flex-1">
                <SortableContext
                    items={members.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {members.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[100px]">
                            <span className="text-xs">멤버 없음</span>
                        </div>
                    ) : (
                        members.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    )
}
