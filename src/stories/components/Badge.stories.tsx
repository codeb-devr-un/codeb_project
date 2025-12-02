import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bell, CheckCircle2, AlertCircle, Timer, FileText, Star } from 'lucide-react'

const BadgeDemo = () => {
  return (
    <div className="p-8 space-y-10 max-w-4xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Badge Components</h1>
        <p className="text-slate-500">Glass Morphism 스타일의 뱃지 컴포넌트</p>
      </div>

      {/* Lime Theme Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Lime Theme Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="bg-black text-lime-400 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            정상 근무
          </span>
          <span className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-medium">
            Seoul
          </span>
          <span className="bg-lime-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
            NEW
          </span>
          <span className="bg-lime-50 text-lime-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
            승인됨
          </span>
        </div>
      </div>

      {/* Status Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            완료
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
            <Timer className="h-3 w-3" />
            진행 중
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            대기 중
          </span>
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            반려됨
          </span>
        </div>
      </div>

      {/* Semantic Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Semantic Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
            필독
          </span>
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
            공지
          </span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
            보안
          </span>
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
            행사
          </span>
          <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
            업데이트
          </span>
        </div>
      </div>

      {/* Counter Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Counter Badges</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <div className="p-2.5 bg-white rounded-full shadow-md">
              <Bell className="h-5 w-5 text-slate-600" />
            </div>
            <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold h-5 min-w-5 px-1 rounded-full">
              5
            </span>
          </div>
          <div className="relative">
            <div className="p-2.5 bg-slate-100 rounded-full">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <span className="absolute -top-1 -right-1 flex items-center justify-center bg-lime-400 text-slate-900 text-[10px] font-bold h-5 min-w-5 px-1 rounded-full">
              12
            </span>
          </div>
          <span className="flex items-center justify-center bg-lime-50 text-lime-700 text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full">
            24
          </span>
        </div>
      </div>

      {/* New/Hot Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">New/Hot Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="border border-red-200 text-red-500 bg-red-50 px-1 h-4 text-[9px] font-bold rounded inline-flex items-center">
            N
          </span>
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Star className="h-2.5 w-2.5 fill-current" />
            HOT
          </span>
          <span className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            PRO
          </span>
          <span className="text-[10px] font-bold bg-white/40 text-slate-900 border border-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
            SAFE
          </span>
        </div>
      </div>

      {/* Glass Badge Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Glass Badge Variants</h2>
        <div className="bg-lime-400 rounded-2xl p-6">
          <div className="flex flex-wrap gap-3">
            <span className="bg-black text-lime-400 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Dark Glass
            </span>
            <span className="bg-white/40 text-slate-900 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-sm">
              Light Glass
            </span>
            <span className="bg-black/10 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-xs font-medium border border-black/5">
              Subtle Glass
            </span>
          </div>
        </div>
      </div>

      {/* Badge with Context */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Badge in Context</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
              필독
            </span>
            <span className="text-sm font-medium text-slate-800">
              11월 전사 회의 안내 및 자료 공유
            </span>
            <span className="border border-red-200 text-red-500 bg-red-50 px-1 h-4 text-[9px] font-bold rounded inline-flex items-center ml-1">
              N
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
              공지
            </span>
            <span className="text-sm font-medium text-slate-800">
              연말 휴가 신청 마감 안내
            </span>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
          <pre className="text-lime-400">
{`/* Lime Primary Badge */
<span className="
  bg-black text-lime-400
  px-3 py-1 rounded-full
  text-xs font-bold shadow-lg
">
  정상 근무
</span>

/* Status Badge with Icon */
<span className="
  inline-flex items-center gap-1.5
  bg-emerald-50 text-emerald-600
  px-3 py-1 rounded-full
  text-xs font-medium
">
  <CheckCircle2 className="h-3 w-3" />
  완료
</span>

/* Glass Badge on Colored Background */
<span className="
  bg-white/40 text-slate-900
  backdrop-blur-sm border border-white/20
  px-3 py-1 rounded-full
  text-xs font-bold shadow-sm
">
  Glass Badge
</span>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof BadgeDemo> = {
  title: 'Components/Badge',
  component: BadgeDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 뱃지 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BadgeDemo>

export const Default: Story = {}
