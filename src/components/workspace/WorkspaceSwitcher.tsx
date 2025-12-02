'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspace } from '@/lib/workspace-context'

export default function WorkspaceSwitcher({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter()
    const { currentWorkspace, workspaces, switchWorkspace, loading } = useWorkspace()
    const [open, setOpen] = React.useState(false)

    if (loading) {
        return (
            <Button
                variant="outline"
                className={cn("w-full justify-between h-12 px-3 border-dashed", className)}
                disabled
            >
                <span className="truncate">로딩 중...</span>
            </Button>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a workspace"
                    className={cn(
                        "w-full justify-between h-auto px-2 py-2 hover:bg-slate-50 transition-all duration-300 group ring-1 ring-transparent hover:ring-slate-100 rounded-xl",
                        className
                    )}
                >
                    <div className="flex items-center gap-3 truncate">
                        <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-black text-lime-400 shadow-lg shadow-black/10 transition-all group-hover:scale-105">
                            <span className="text-sm font-bold">
                                {currentWorkspace?.name?.[0]?.toUpperCase() || 'W'}
                            </span>
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-bold text-slate-900 group-hover:text-black transition-colors text-base">
                                {currentWorkspace?.name || "워크스페이스 선택"}
                            </span>
                            <span className="truncate text-xs text-slate-500 font-medium">
                                Enterprise Plan
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] min-w-56 rounded-2xl bg-white/90 backdrop-blur-2xl border-slate-100 shadow-2xl p-2">
                <Command>
                    <CommandList>
                        <CommandInput placeholder="워크스페이스 검색..." />
                        <CommandEmpty>워크스페이스를 찾을 수 없습니다.</CommandEmpty>
                        <CommandGroup heading={<span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">Workspaces</span>}>
                            {workspaces.map((workspace) => (
                                <CommandItem
                                    key={workspace.id}
                                    onSelect={() => {
                                        switchWorkspace(workspace.id)
                                        setOpen(false)
                                    }}
                                    className="gap-3 p-2.5 rounded-xl focus:bg-lime-50 focus:text-black cursor-pointer group"
                                >
                                    <div className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white group-aria-selected:border-lime-300 group-aria-selected:bg-lime-400 group-aria-selected:text-black text-slate-600 transition-colors">
                                        <span className="text-xs font-bold">
                                            {workspace.name?.[0]?.toUpperCase() || 'W'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <span className="font-semibold text-sm">{workspace.name}</span>
                                        <span className="text-[10px] text-slate-400 group-aria-selected:text-slate-600">Enterprise</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 text-lime-500",
                                            currentWorkspace?.id === workspace.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false)
                                    router.push('/workspace/create')
                                }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                새 워크스페이스 생성
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
