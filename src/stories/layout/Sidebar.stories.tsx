import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Home, Briefcase, Folder, Bell, Calendar, Users, Settings,
  FileText, ChevronRight, Star, Layers, User, ChevronsUpDown,
  LogOut, Sparkles, CreditCard, PanelLeft
} from 'lucide-react'

const SidebarDemo = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar Preview */}
      <aside className="w-[280px] border-r border-slate-100 bg-white/80 backdrop-blur-2xl flex flex-col h-screen">
        {/* Header */}
        <div className="pb-4 pt-4 px-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-300 group ring-1 ring-transparent hover:ring-slate-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-black text-lime-400 shadow-lg shadow-black/10 transition-all group-hover:scale-105">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <span className="block truncate font-bold text-slate-900 group-hover:text-black transition-colors text-base">
                CodeB HQ
              </span>
              <span className="block truncate text-xs text-slate-500 font-medium">
                Enterprise Plan
              </span>
            </div>
            <ChevronsUpDown className="w-4 h-4 opacity-50 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-2">
          {/* Main Nav */}
          <nav className="space-y-2 mb-6">
            {[
              { icon: Home, label: '홈', active: true, starred: true },
              { icon: Briefcase, label: '내 작업', starred: true },
              { icon: FileText, label: '파일 보관함' },
            ].map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 h-11 px-3 rounded-2xl transition-all duration-300 group ${
                  item.active
                    ? 'bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20 hover:shadow-lime-400/30 font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="text-sm">{item.label}</span>
                {item.starred && (
                  <Star className="ml-auto h-4 w-4 text-slate-300 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                )}
              </button>
            ))}
          </nav>

          {/* Applications Section */}
          <div className="mb-2 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider opacity-60">
            Applications
          </div>
          <div className="space-y-1">
            {/* Collapsible Group */}
            <div>
              <button className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:shadow-sm transition-all duration-300 font-medium">
                <Folder className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm">프로젝트</span>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-transform rotate-90" />
              </button>
              <div className="border-l-2 border-slate-200 ml-5 pl-3 my-1 space-y-1">
                {[
                  { label: '진행 중인 프로젝트', active: false },
                  { label: '완료된 프로젝트', active: false },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`w-full h-9 px-3 rounded-lg text-left text-sm transition-all duration-200 ${
                      item.active
                        ? 'text-slate-900 font-bold bg-slate-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group: 그룹웨어 */}
            <div>
              <button className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:shadow-sm transition-all duration-300 font-medium">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm">그룹웨어</span>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-transform rotate-90" />
              </button>
              <div className="border-l-2 border-slate-200 ml-5 pl-3 my-1 space-y-1">
                {[
                  { icon: Bell, label: '공지사항', starred: true },
                  { icon: FileText, label: '전자 결재' },
                  { icon: Calendar, label: '일정 (캘린더)', starred: true },
                  { icon: Users, label: '조직 관리', starred: true },
                  { icon: Briefcase, label: '근태 관리', starred: true },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full h-9 px-3 rounded-lg text-left text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5 opacity-60" />}
                    <span>{item.label}</span>
                    {item.starred && (
                      <Star className="ml-auto h-3 w-3 text-amber-400 fill-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3">
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-1 border border-white/40 shadow-sm">
            <div className="px-2 py-2">
              <button className="flex items-center gap-2 px-2 py-2 rounded-2xl hover:bg-white/80 w-full transition-colors group">
                <PanelLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900">Dock Mode</span>
              </button>
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/60 transition-all duration-300">
              <div className="h-9 w-9 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-black text-lime-400 flex items-center justify-center font-bold">
                천
              </div>
              <div className="flex-1 text-left">
                <span className="block truncate font-bold text-slate-900 text-sm">천동은 (레오TV)</span>
                <span className="block truncate text-xs text-slate-500 font-medium">팀원</span>
              </div>
              <LogOut className="w-4 h-4 opacity-40 text-slate-500 hover:text-rose-500 hover:opacity-100 transition-all" />
            </button>
          </div>
        </div>
      </aside>

      {/* Documentation */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sidebar Component</h1>
            <p className="text-slate-500">Glass Morphism 스타일의 사이드바 레이아웃</p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Glass Container', desc: 'bg-white/80 backdrop-blur-2xl' },
                { title: 'Workspace Switcher', desc: '드롭다운 기반 워크스페이스 전환' },
                { title: 'Active State', desc: 'bg-lime-400 shadow-lg' },
                { title: 'Collapsible Groups', desc: '접을 수 있는 네비게이션 그룹' },
                { title: 'Star Favorites', desc: '즐겨찾기 표시 기능' },
                { title: 'User Profile Footer', desc: '사용자 정보 및 로그아웃' },
              ].map((item, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active States */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Nav Item States</h2>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 space-y-3">
              <button className="w-full flex items-center gap-3 h-11 px-3 rounded-2xl bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20 font-bold">
                <Home className="h-5 w-5 text-slate-900" />
                <span className="text-sm">Active State</span>
              </button>
              <button className="w-full flex items-center gap-3 h-11 px-3 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
                <Home className="h-5 w-5 text-slate-400" />
                <span className="text-sm">Default State</span>
              </button>
              <button className="w-full flex items-center gap-3 h-11 px-3 rounded-2xl text-slate-900 bg-slate-100 font-medium">
                <Home className="h-5 w-5 text-slate-600" />
                <span className="text-sm">Hover State</span>
              </button>
            </div>
          </div>

          {/* Code Reference */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
            <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono overflow-x-auto">
              <pre className="text-lime-400">
{`/* Sidebar Container */
<aside className="
  w-[280px] border-r border-slate-100
  bg-white/80 backdrop-blur-2xl
">

/* Workspace Logo */
<div className="
  flex items-center justify-center
  w-9 h-9 rounded-xl
  bg-black text-lime-400
  shadow-lg shadow-black/10
">

/* Active Nav Item */
<button className="
  h-11 px-3 rounded-2xl
  bg-lime-400 text-slate-900
  shadow-lg shadow-lime-400/20
  font-bold
">

/* Default Nav Item */
<button className="
  h-11 px-3 rounded-2xl
  text-slate-500 hover:text-slate-900
  hover:bg-slate-100 font-medium
  transition-all duration-300
">

/* Sub Nav Item */
<button className="
  h-9 px-3 rounded-lg
  text-slate-500 hover:text-slate-900
  hover:bg-slate-50
  transition-all duration-200
">`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const meta: Meta<typeof SidebarDemo> = {
  title: 'Layout/Sidebar',
  component: SidebarDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 스타일의 사이드바 네비게이션 컴포넌트입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof SidebarDemo>

export const Default: Story = {}
