import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Home, Briefcase, Folder, Bell, Calendar, Users, Settings,
  FileText, PanelLeft
} from 'lucide-react'

const DockDemo = () => {
  const dockItems = [
    { id: 'dashboard', icon: Home, label: '홈', active: true },
    { id: 'tasks', icon: Briefcase, label: '내 작업' },
    { id: 'projects', icon: Folder, label: '프로젝트' },
    { id: 'files', icon: FileText, label: '파일함' },
    { id: 'notices', icon: Bell, label: '알림' },
    { id: 'calendar', icon: Calendar, label: '일정' },
    { id: 'organization', icon: Users, label: '조직' },
    { id: 'hr', icon: Briefcase, label: '근태' },
    { id: 'settings', icon: Settings, label: '설정' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative pb-32">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8 space-y-10 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dock Navigation</h1>
          <p className="text-slate-500">macOS 스타일의 하단 Dock 네비게이션</p>
        </div>

        {/* Dock Preview Card */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Dock Preview</h2>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-8 flex items-center justify-center min-h-[300px]">
            {/* Centered Dock */}
            <div className="flex items-end gap-3 px-4 py-3 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform duration-500">
              {dockItems.map((item) => (
                <button
                  key={item.id}
                  className={`group relative flex items-center justify-center transition-all duration-300 ease-out origin-bottom ${
                    item.active ? '-translate-y-2' : 'hover:-translate-y-2'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-black text-lime-400 scale-110 shadow-lime-500/20'
                      : 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:shadow-lime-400/30'
                  }`}>
                    <item.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  {item.active && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                  )}
                </button>
              ))}

              {/* Separator */}
              <div className="w-[1px] h-8 bg-slate-300/50 mx-1 self-center" />

              {/* Exit Dock Mode */}
              <button className="group relative flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-md hover:bg-slate-800 hover:text-white hover:scale-110 transition-all">
                  <PanelLeft className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Dock Item States */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Dock Item States</h2>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
            <div className="flex items-end gap-8 justify-center">
              {/* Active */}
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-black text-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/20 scale-110 -translate-y-2">
                    <Home className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Active</span>
              </div>

              {/* Default */}
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Default</span>
              </div>

              {/* Hover */}
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/30 scale-110 -translate-y-2">
                    <Folder className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Hover</span>
              </div>

              {/* Exit Button */}
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg scale-110">
                    <PanelLeft className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">Exit (Hover)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Features</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Glass Container', desc: 'bg-white/70 backdrop-blur-2xl rounded-[2rem]' },
              { title: 'Hover Animation', desc: 'hover:-translate-y-2 hover:scale-110' },
              { title: 'Active Indicator', desc: 'Bottom dot + permanent lift' },
              { title: 'Shadow Effects', desc: 'shadow-2xl + colored shadows' },
              { title: 'Icon Buttons', desc: 'w-12 h-12 rounded-2xl' },
              { title: 'Smooth Transitions', desc: 'transition-all duration-300' },
            ].map((item, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tooltip Style</h2>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 flex items-center justify-center gap-8">
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1.5 bg-black text-lime-400 rounded-lg text-xs font-bold">
                홈
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black text-lime-400 flex items-center justify-center shadow-lg mx-auto">
                <Home className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1.5 bg-black text-lime-400 rounded-lg text-xs font-bold">
                내 작업
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-lg mx-auto">
                <Briefcase className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Code Reference */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
          <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
            <pre className="text-lime-400">
{`/* Dock Container */
<div className="
  fixed bottom-8 left-1/2 -translate-x-1/2 z-50
">
  <div className="
    flex items-end gap-3
    px-4 py-3
    bg-white/70 backdrop-blur-2xl
    rounded-[2rem]
    border border-white/50
    shadow-2xl shadow-black/5
    hover:scale-[1.02]
    transition-transform duration-500
  ">

/* Active Dock Item */
<button className="transition-all -translate-y-2">
  <div className="
    w-12 h-12 rounded-2xl
    bg-black text-lime-400
    scale-110 shadow-lg shadow-lime-500/20
  ">
    <Icon className="w-5 h-5" strokeWidth={2.5} />
  </div>
  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
</button>

/* Default Dock Item */
<button className="hover:-translate-y-2">
  <div className="
    w-12 h-12 rounded-2xl
    bg-white text-slate-400
    hover:bg-lime-400 hover:text-black
    hover:scale-110 hover:shadow-lime-400/30
    shadow-lg transition-all duration-300
  ">

/* Tooltip */
<div className="
  px-3 py-1.5 rounded-lg
  bg-black text-lime-400
  text-xs font-bold
">`}
            </pre>
          </div>
        </div>
      </div>

      {/* Fixed Dock Demo */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-end gap-3 px-4 py-3 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl shadow-black/5">
          {dockItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              className={`group relative flex items-center justify-center transition-all duration-300 ease-out origin-bottom ${
                item.active ? '-translate-y-2' : 'hover:-translate-y-2'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                item.active
                  ? 'bg-black text-lime-400 scale-110 shadow-lime-500/20'
                  : 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:shadow-lime-400/30'
              }`}>
                <item.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              {item.active && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
              )}
            </button>
          ))}
          <div className="w-[1px] h-8 bg-slate-300/50 mx-1 self-center" />
          <button className="group relative flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-md hover:bg-slate-800 hover:text-white hover:scale-110 transition-all">
              <PanelLeft className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof DockDemo> = {
  title: 'Layout/Dock',
  component: DockDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'macOS 스타일의 하단 Dock 네비게이션 컴포넌트입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DockDemo>

export const Default: Story = {}
