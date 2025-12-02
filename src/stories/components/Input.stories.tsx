import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Search, Mail, Lock, Eye, EyeOff, Calendar, User, Phone, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'

const InputDemo = () => {
  return (
    <div className="p-8 space-y-10 max-w-4xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Input Components</h1>
        <p className="text-slate-500">Glass Morphism 스타일의 입력 컴포넌트</p>
      </div>

      {/* Basic Inputs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Basic Inputs</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">기본 입력</label>
            <input
              type="text"
              placeholder="입력해주세요"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">비활성화</label>
            <input
              type="text"
              placeholder="입력 불가"
              disabled
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-500 placeholder:text-slate-400 cursor-not-allowed opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Glass Style Inputs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Glass Style Inputs</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Glass Input</label>
            <input
              type="text"
              placeholder="Glass morphism style"
              className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Strong Glass Input</label>
            <input
              type="text"
              placeholder="More prominent glass style"
              className="flex h-11 w-full rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-md transition-all"
            />
          </div>
        </div>
      </div>

      {/* Input with Icons */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Input with Icons</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">검색</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="example@email.com"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 pl-10 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
              <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input States */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Input States</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">기본 상태</label>
            <input
              type="text"
              placeholder="기본 상태"
              className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-700">성공</label>
            <div className="relative">
              <input
                type="text"
                value="올바른 입력값"
                readOnly
                className="flex h-11 w-full rounded-2xl border border-emerald-300 bg-emerald-50/50 px-4 pr-10 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 shadow-sm transition-all"
              />
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs text-emerald-600">입력값이 유효합니다.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-rose-700">에러</label>
            <div className="relative">
              <input
                type="text"
                value="잘못된 입력값"
                readOnly
                className="flex h-11 w-full rounded-2xl border border-rose-300 bg-rose-50/50 px-4 pr-10 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 shadow-sm transition-all"
              />
              <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
            </div>
            <p className="text-xs text-rose-600">입력값을 확인해주세요.</p>
          </div>
        </div>
      </div>

      {/* Input Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Input Sizes</h2>
        <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Small (h-9)</label>
            <input
              type="text"
              placeholder="Small input"
              className="flex h-9 w-full rounded-xl border border-white/40 bg-white/50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Medium (h-11)</label>
            <input
              type="text"
              placeholder="Medium input"
              className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Large (h-12)</label>
            <input
              type="text"
              placeholder="Large input"
              className="flex h-12 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Input Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Input Types</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" /> 이름
              </label>
              <input
                type="text"
                placeholder="홍길동"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" /> 전화번호
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" /> 날짜
              </label>
              <input
                type="date"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" /> 카드번호
              </label>
              <input
                type="text"
                placeholder="0000-0000-0000-0000"
                className="flex h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Textarea</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">메모</label>
            <textarea
              placeholder="내용을 입력해주세요..."
              rows={4}
              className="flex w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 shadow-sm transition-all resize-none"
            ></textarea>
            <p className="text-xs text-slate-400 text-right">0 / 500</p>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
          <pre className="text-lime-400">
{`/* Glass Input */
<input
  type="text"
  placeholder="Glass morphism style"
  className="
    flex h-11 w-full
    rounded-2xl border border-white/40
    bg-white/50 backdrop-blur-sm
    px-4 py-2 text-sm text-slate-900
    placeholder:text-slate-400
    focus:border-lime-400
    focus:outline-none
    focus:ring-2 focus:ring-lime-400/20
    shadow-sm transition-all
  "
/>

/* Input with Icon */
<div className="relative">
  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <input
    type="text"
    placeholder="검색어를 입력하세요"
    className="... pl-10 pr-4 ..."
  />
</div>

/* Error State */
<input
  className="
    ... border-rose-300 bg-rose-50/50
    focus:border-rose-400
    focus:ring-rose-400/20
  "
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof InputDemo> = {
  title: 'Components/Input',
  component: InputDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 입력 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof InputDemo>

export const Default: Story = {}
