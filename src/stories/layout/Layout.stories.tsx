import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Home, Briefcase, Folder, Bell, Calendar, Users, Settings,
  FileText, ChevronRight, Star, Layers, ChevronsUpDown,
  Search, PanelLeft
} from 'lucide-react'

const LayoutDemo = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-[280px] border-r border-slate-100 bg-white/80 backdrop-blur-2xl flex flex-col shrink-0">
          {/* Header */}
          <div className="pb-4 pt-4 px-4">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-black text-lime-400 shadow-lg shadow-black/10">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <span className="block truncate font-bold text-slate-900 text-base">CodeB HQ</span>
                <span className="block truncate text-xs text-slate-500 font-medium">Enterprise Plan</span>
              </div>
              <ChevronsUpDown className="w-4 h-4 opacity-50 text-slate-400" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-auto px-2">
            <nav className="space-y-2">
              {[
                { icon: Home, label: '홈', active: true },
                { icon: Briefcase, label: '내 작업' },
                { icon: FileText, label: '파일 보관함' },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 h-11 px-3 rounded-2xl transition-all ${
                    item.active
                      ? 'bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-3">
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-3 border border-white/40 shadow-sm">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/60">
                <div className="h-9 w-9 rounded-xl border-2 border-white shadow-sm bg-black text-lime-400 flex items-center justify-center font-bold">
                  천
                </div>
                <div className="flex-1 text-left">
                  <span className="block truncate font-bold text-slate-900 text-sm">천동은</span>
                  <span className="block truncate text-xs text-slate-500">팀원</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Ambient Background */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 bg-white/50 backdrop-blur-md border-b border-white/40 sticky top-0 z-10">
            <div className="flex items-center gap-2 px-4 w-full">
              <button className="p-2 hover:bg-white/60 rounded-lg text-slate-500 hover:text-slate-900">
                <PanelLeft className="h-5 w-5" />
              </button>
              <div className="h-4 w-px bg-slate-300 mx-2" />

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hover:text-lime-600 cursor-pointer font-medium">groupware</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-900">Dashboard</span>
              </nav>

              {/* Search */}
              <div className="ml-auto flex items-center gap-4">
                <div className="relative hidden md:block w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    placeholder="검색..."
                    className="pl-9 h-9 w-full bg-white/60 border border-white/40 rounded-xl text-sm placeholder:text-slate-400 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400"
                  />
                </div>
                <button className="relative p-2 hover:bg-white/60 rounded-full text-slate-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>
                <div className="h-9 w-9 rounded-full border-2 border-white shadow-sm bg-black text-lime-400 flex items-center justify-center font-bold text-xs">
                  CN
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 relative z-0">
            <div className="max-w-4xl mx-auto space-y-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Layout</h1>
                <p className="text-slate-500">Glass Morphism 스타일의 관리자 레이아웃 구조</p>
              </div>

              {/* Layout Structure */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Layout Structure</h2>
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-48 bg-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
                        Sidebar
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="h-12 bg-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
                          Header (Glass)
                        </div>
                        <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium relative">
                          Content Area
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-2 left-2 w-16 h-16 bg-lime-200/60 rounded-full blur-xl" />
                            <div className="absolute bottom-2 right-2 w-20 h-20 bg-emerald-100/60 rounded-full blur-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Layout Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: 'Sidebar', desc: 'w-[280px], bg-white/80 backdrop-blur-2xl' },
                    { title: 'Header', desc: 'h-16, bg-white/50 backdrop-blur-md, sticky top-0' },
                    { title: 'Ambient Blobs', desc: 'bg-lime-200/40, blur-[100px], pointer-events-none' },
                    { title: 'Content Container', desc: 'flex-1 overflow-auto p-8' },
                    { title: 'Glass Search', desc: 'bg-white/60 backdrop-blur-sm rounded-xl' },
                    { title: 'Breadcrumb', desc: 'text-slate-500 → font-bold text-slate-900' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar vs Dock */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Navigation Modes</h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* Sidebar Mode */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Sidebar Mode</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex h-32">
                        <div className="w-12 bg-white/80 border-r border-slate-100 flex flex-col items-center py-2 gap-2">
                          <div className="w-6 h-6 rounded-lg bg-black" />
                          <div className="w-6 h-6 rounded-lg bg-lime-400" />
                          <div className="w-6 h-6 rounded-lg bg-slate-100" />
                        </div>
                        <div className="flex-1 bg-[#F8F9FA] p-2">
                          <div className="h-4 bg-white/60 rounded w-full mb-2" />
                          <div className="h-16 bg-white/40 rounded" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">전통적인 사이드바 네비게이션</p>
                  </div>

                  {/* Dock Mode */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Dock Mode</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="h-32 bg-[#F8F9FA] p-2 relative">
                        <div className="h-4 bg-white/60 rounded w-full mb-2" />
                        <div className="h-12 bg-white/40 rounded" />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 px-2 py-1 bg-white/70 rounded-xl">
                          <div className="w-4 h-4 rounded bg-black" />
                          <div className="w-4 h-4 rounded bg-slate-100" />
                          <div className="w-4 h-4 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">macOS 스타일 하단 Dock</p>
                  </div>
                </div>
              </div>

              {/* Code Reference */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
                <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
                  <pre className="text-lime-400">
{`/* Layout Container */
<div className="flex h-screen bg-[#F8F9FA]">
  {/* Sidebar */}
  <aside className="w-[280px] border-r border-slate-100 bg-white/80 backdrop-blur-2xl" />

  {/* Main Area */}
  <main className="flex-1 flex flex-col overflow-hidden relative">
    {/* Ambient Background Blobs */}
    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

    {/* Header */}
    <header className="
      flex h-16 items-center
      bg-white/50 backdrop-blur-md
      border-b border-white/40
      sticky top-0 z-10
    ">
      {/* Breadcrumb + Search + Avatar */}
    </header>

    {/* Content */}
    <div className="flex-1 overflow-auto p-8 relative z-0">
      {children}
    </div>
  </main>
</div>

/* Conditional Dock Mode */
{isDockMode ? (
  <AdminDock />
) : (
  <AdminSidebar />
)}

/* Dock Mode Content Padding */
<div className={\`... \${isDockMode ? "pb-24" : ""}\`}>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const meta: Meta<typeof LayoutDemo> = {
  title: 'Layout/AdminLayout',
  component: LayoutDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 관리자 레이아웃 시스템입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LayoutDemo>

export const Default: Story = {}
