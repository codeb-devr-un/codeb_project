import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Clock, Sun, Coffee, CheckCircle2, Timer, AlertCircle, FileText, ChevronRight } from 'lucide-react'

const GlassCard = ({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <div className={`
    rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md
    border border-white/20 transition-all duration-300
    ${hover ? 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer' : ''}
    ${className}
  `}>
    {children}
  </div>
)

const CardStories = () => {
  return (
    <div className="p-8 space-y-10 max-w-5xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Card Components</h1>
        <p className="text-slate-500">Glass Morphism 스타일의 카드 컴포넌트</p>
      </div>

      {/* Basic Glass Card */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Basic Glass Card</h2>
        <div className="grid grid-cols-3 gap-6">
          <GlassCard>
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-2">Glass Card</h3>
              <p className="text-sm text-slate-500">기본 글래스 카드입니다.</p>
            </div>
          </GlassCard>
          <GlassCard className="bg-white/70">
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-2">Light Glass</h3>
              <p className="text-sm text-slate-500">더 투명한 글래스 카드입니다.</p>
            </div>
          </GlassCard>
          <GlassCard className="bg-white/90">
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-2">Solid Glass</h3>
              <p className="text-sm text-slate-500">거의 불투명한 글래스 카드입니다.</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Widget Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Widget Cards</h2>
        <div className="grid grid-cols-4 gap-6">
          {/* Time Widget */}
          <GlassCard>
            <div className="p-6 flex flex-col justify-between h-[160px] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-lime-50 rounded-full -mr-8 -mt-8 blur-2xl opacity-60"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="p-2.5 bg-black text-lime-400 rounded-full shadow-md">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="bg-lime-100 text-lime-800 text-xs font-medium px-3 py-1 rounded-full">Seoul</span>
              </div>
              <div className="relative z-10 mt-4">
                <span className="text-4xl font-bold tracking-tight text-slate-900">08:25</span>
                <p className="text-sm text-slate-500 mt-1 font-medium">오전 근무 시간입니다</p>
              </div>
            </div>
          </GlassCard>

          {/* Weather Widget */}
          <GlassCard>
            <div className="p-6 h-[160px] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 blur-2xl opacity-60"></div>
              <div className="flex justify-between h-full relative z-10">
                <div className="flex flex-col justify-between">
                  <div className="p-2.5 bg-orange-50 text-orange-500 rounded-full w-fit shadow-sm">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span>습도 65%</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div className="text-right mt-2">
                    <span className="text-4xl font-bold text-slate-900">18°</span>
                    <p className="text-sm text-slate-500 mt-1">맑음</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Stat Widget */}
          <GlassCard className="bg-white/60 backdrop-blur-xl">
            <div className="p-5 flex flex-col items-center justify-center text-center h-[160px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              <div className="p-3 rounded-full mb-3 bg-emerald-50/80 text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">34</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">승인 완료</p>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/60 backdrop-blur-xl">
            <div className="p-5 flex flex-col items-center justify-center text-center h-[160px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              <div className="p-3 rounded-full mb-3 bg-rose-50/80 text-rose-600 shadow-sm">
                <AlertCircle className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">1</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">반려됨</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Accent Card (Lime) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Accent Card (Lime)</h2>
        <div className="rounded-3xl bg-lime-400 text-slate-900 relative overflow-hidden group border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 p-32 bg-white opacity-20 blur-3xl rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 p-20 bg-lime-300 opacity-40 blur-3xl rounded-full -ml-10 -mb-10"></div>

          <div className="p-6 h-[160px] flex flex-col justify-between relative z-10">
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
              <span className="bg-black text-lime-400 px-3 py-1 rounded-full text-xs font-bold">정상 근무</span>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-2">
              <div>
                <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">출근 시간</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">08:55</span>
                  <span className="text-[10px] font-bold bg-white/40 text-slate-900 px-1.5 py-0.5 rounded-full">SAFE</span>
                </div>
              </div>
              <div>
                <p className="text-slate-800 text-xs font-medium mb-1 opacity-70">퇴근 예정</p>
                <span className="text-3xl font-bold tracking-tight text-slate-900 opacity-50">18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Card */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">List Card</h2>
        <GlassCard className="bg-white/70" hover={false}>
          <div className="pb-4 border-b border-slate-100/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-lime-100 rounded-full">
                  <Timer className="h-4 w-4 text-lime-700" />
                </div>
                <h3 className="text-base font-bold text-slate-900">최근 승인 활동</h3>
              </div>
              <button className="text-xs text-slate-400 hover:text-lime-600 font-medium flex items-center">
                전체보기 <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="p-0">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                    JD
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <div className="w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-lime-600 transition-colors">
                      지출 결의서 승인 요청 #{2025000 + i}
                    </p>
                    <span className="text-[10px] text-slate-400">2시간 전</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">김민지 (마케팅팀)</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>법인카드 사용 내역</span>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-slate-100/50 text-slate-400 group-hover:bg-lime-400 group-hover:text-slate-900 transition-colors flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
          <pre className="text-lime-400">
{`/* Basic Glass Card */
<div className="
  rounded-3xl border-0
  shadow-[0_8px_30px_rgb(0,0,0,0.04)]
  bg-white/80 backdrop-blur-md
  border border-white/20
  hover:-translate-y-1
  hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
  transition-all duration-300
">
  {children}
</div>

/* Lime Accent Card */
<div className="
  rounded-3xl bg-lime-400 text-slate-900
  relative overflow-hidden
">
  {/* Ambient Blob */}
  <div className="absolute top-0 right-0 p-32
    bg-white opacity-20 blur-3xl rounded-full" />
  {children}
</div>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof CardStories> = {
  title: 'Components/Card',
  component: CardStories,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 카드 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof CardStories>

export const Default: Story = {}
