import React from 'react'

export type TabId = 'overview' | 'kanban' | 'gantt' | 'files' | 'team' | 'activity' | 'invitations'

interface ProjectTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: 'overview' as TabId, label: '📋 개요' },
  { id: 'kanban' as TabId, label: '📊 칸반보드' },
  { id: 'gantt' as TabId, label: '📈 간트차트' },
  { id: 'files' as TabId, label: '📁 파일' },
  { id: 'team' as TabId, label: '👥 팀' },
  { id: 'activity' as TabId, label: '📝 활동' },
  { id: 'invitations' as TabId, label: '✉️ 초대' }
]

export default function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  return (
    <div className="border-b border-gray-200 flex-shrink-0">
      <nav className="flex gap-6 px-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}