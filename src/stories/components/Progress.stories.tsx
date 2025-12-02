import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CheckCircle2, Clock, Target, TrendingUp, Users, FileText } from 'lucide-react'

const ProgressDemo = () => {
  return (
    <div className="p-8 space-y-10 max-w-4xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Progress Components</h1>
        <p className="text-slate-500">Glass Morphism 스타일의 프로그레스 컴포넌트</p>
      </div>

      {/* Basic Progress */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Basic Progress</h2>
        <div className="space-y-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">진행률</span>
              <span className="text-slate-500">75%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full transition-all" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">완료</span>
              <span className="text-slate-500">100%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full transition-all" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">시작</span>
              <span className="text-slate-500">25%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full transition-all" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lime Theme Progress */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Lime Theme Progress</h2>
        <div className="space-y-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">프로젝트 진행률</span>
              <span className="text-lime-600 font-bold">68%</span>
            </div>
            <div className="h-3 w-full bg-lime-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full transition-all" style={{ width: '68%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 font-medium">Dark Progress</span>
              <span className="text-slate-600 font-bold">85%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full transition-all" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Progress Sizes</h2>
        <div className="space-y-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <span className="text-xs text-slate-500">xs (2px)</span>
            <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-slate-500">sm (4px)</span>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-slate-500">md (8px)</span>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-slate-500">lg (12px)</span>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-slate-500">xl (16px)</span>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Progress */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Semantic Progress</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> 완료
              </span>
              <span className="text-emerald-600 font-bold">100%</span>
            </div>
            <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> 진행 중
              </span>
              <span className="text-blue-600 font-bold">65%</span>
            </div>
            <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium flex items-center gap-1.5">
                <Target className="h-4 w-4" /> 목표
              </span>
              <span className="text-amber-600 font-bold">45%</span>
            </div>
            <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-rose-700 font-medium flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> 위험
              </span>
              <span className="text-rose-600 font-bold">15%</span>
            </div>
            <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Circular Progress</h2>
        <div className="flex flex-wrap gap-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          {/* Small Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${75 * 1.76} 176`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">75%</span>
            </div>
            <span className="text-xs text-slate-500">Small</span>
          </div>

          {/* Medium Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${85 * 2.51} 251`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">85%</span>
            </div>
            <span className="text-xs text-slate-500">Medium</span>
          </div>

          {/* Large Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#ecfccb" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r="56"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${68 * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">68%</span>
                <span className="text-xs text-slate-500">완료</span>
              </div>
            </div>
            <span className="text-xs text-slate-500">Large</span>
          </div>
        </div>
      </div>

      {/* Progress in Context */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Progress in Context</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Project Progress Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-100 rounded-full">
                <FileText className="h-4 w-4 text-lime-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">프로젝트 A</h3>
                <p className="text-xs text-slate-500">마감: 2025.12.15</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">진행률</span>
                <span className="text-lime-600 font-bold">72%</span>
              </div>
              <div className="h-2 w-full bg-lime-100 rounded-full overflow-hidden">
                <div className="h-full bg-lime-400 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>

          {/* Team Progress Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-full">
                <Users className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">팀 목표</h3>
                <p className="text-xs text-slate-500">4분기 KPI</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">달성률</span>
                <span className="text-slate-700 font-bold">89%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
          <pre className="text-lime-400">
{`/* Basic Lime Progress */
<div className="h-2 w-full bg-lime-100 rounded-full overflow-hidden">
  <div
    className="h-full bg-lime-400 rounded-full transition-all"
    style={{ width: '75%' }}
  />
</div>

/* Dark Progress */
<div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-black rounded-full transition-all"
    style={{ width: '85%' }}
  />
</div>

/* Circular Progress (SVG) */
<div className="relative w-24 h-24">
  <svg className="w-full h-full -rotate-90">
    <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
    <circle
      cx="48" cy="48" r="40"
      fill="none"
      stroke="#a3e635"
      strokeWidth="6"
      strokeLinecap="round"
      strokeDasharray="213 251"  /* (85% * 251) 251 */
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center font-bold">
    85%
  </span>
</div>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof ProgressDemo> = {
  title: 'Components/Progress',
  component: ProgressDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 프로그레스 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ProgressDemo>

export const Default: Story = {}
