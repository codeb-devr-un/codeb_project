import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { User, UserPlus } from 'lucide-react'

const AvatarDemo = () => {
  const users = [
    { initials: 'JD', name: '김민지', team: '마케팅팀' },
    { initials: 'SH', name: '이수현', team: '개발팀' },
    { initials: 'YJ', name: '박영진', team: '디자인팀' },
    { initials: 'MK', name: '최민경', team: '인사팀' },
  ]

  return (
    <div className="p-8 space-y-10 max-w-4xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Avatar Components</h1>
        <p className="text-slate-500">Glass Morphism 스타일의 아바타 컴포넌트</p>
      </div>

      {/* Basic Avatars */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Basic Avatars</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <img src="/avatars/01.png" alt="User" className="aspect-square h-full w-full" />
          </div>
          <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
              JD
            </div>
          </div>
          <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-lime-400 font-bold text-xs">
              JD
            </div>
          </div>
        </div>
      </div>

      {/* Lime Theme Avatars */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Lime Theme Avatars</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-lime-400 font-bold text-xs">
              AB
            </div>
          </div>
          <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-lime-400 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-lime-400 text-black font-bold text-sm">
              CD
            </div>
          </div>
          <div className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-lime-500 text-black font-bold text-base">
              EF
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Avatar Sizes</h2>
        <div className="flex items-end gap-4">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-[10px] border-2 border-white shadow-sm">
              XS
            </div>
            <span className="text-xs text-slate-500 mt-2 block">xs (32px)</span>
          </div>
          <div className="text-center">
            <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              SM
            </div>
            <span className="text-xs text-slate-500 mt-2 block">sm (40px)</span>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
              MD
            </div>
            <span className="text-xs text-slate-500 mt-2 block">md (48px)</span>
          </div>
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-base border-2 border-white shadow-md">
              LG
            </div>
            <span className="text-xs text-slate-500 mt-2 block">lg (56px)</span>
          </div>
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xl border-2 border-white shadow-lg">
              XL
            </div>
            <span className="text-xs text-slate-500 mt-2 block">xl (80px)</span>
          </div>
        </div>
      </div>

      {/* Avatar with Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Avatar with Status</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              JD
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <div className="w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              AB
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
              CD
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
            온라인
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            자리비움
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            오프라인
          </span>
        </div>
      </div>

      {/* Avatar Group */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Avatar Group</h2>
        <div className="flex -space-x-3">
          {users.map((user, i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm hover:z-10 hover:scale-110 transition-transform cursor-pointer"
              title={`${user.name} (${user.team})`}
            >
              {user.initials}
            </div>
          ))}
          <div className="h-10 w-10 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
            +5
          </div>
        </div>
      </div>

      {/* Avatar in Context (List Item) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Avatar in Context</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden">
          {users.map((user, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-black text-lime-400 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  {user.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-lime-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.team}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Placeholder */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Avatar Placeholder</h2>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-10 w-10 rounded-full bg-lime-50 flex items-center justify-center border-2 border-white shadow-sm">
            <UserPlus className="h-5 w-5 text-lime-600" />
          </div>
          <button className="h-10 w-10 rounded-full bg-white/50 backdrop-blur border border-dashed border-slate-300 flex items-center justify-center hover:border-lime-400 hover:bg-lime-50 transition-colors">
            <span className="text-xl text-slate-400">+</span>
          </button>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
          <pre className="text-lime-400">
{`/* Lime Theme Avatar */
<div className="
  h-10 w-10 rounded-full
  bg-black text-lime-400
  flex items-center justify-center
  font-bold text-xs
  border-2 border-white shadow-sm
">
  JD
</div>

/* Avatar with Online Status */
<div className="relative">
  <div className="h-10 w-10 rounded-full bg-black text-lime-400 ...">
    JD
  </div>
  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
    <div className="w-2.5 h-2.5 bg-lime-500 rounded-full border-2 border-white" />
  </div>
</div>

/* Avatar Group (Stacked) */
<div className="flex -space-x-3">
  {users.map((user) => (
    <div className="h-10 w-10 rounded-full ... hover:z-10 hover:scale-110">
      {user.initials}
    </div>
  ))}
</div>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof AvatarDemo> = {
  title: 'Components/Avatar',
  component: AvatarDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 아바타 컴포넌트들입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof AvatarDemo>

export const Default: Story = {}
