'use client'

import React, { useEffect, useRef } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { motion } from 'framer-motion'
import styles from './GanttChartPro.module.css'

interface GanttChartProProps {
  tasks: Task[]
  onTaskChange?: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  onProgressChange?: (task: Task) => void
  onDateChange?: (task: Task) => void
}

export default function GanttChartPro({
  tasks,
  onTaskChange,
  onTaskDelete,
  onProgressChange,
  onDateChange
}: GanttChartProProps) {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Month)
  const [isChecked, setIsChecked] = React.useState(true)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleExpanderClick = (task: Task) => {
    console.log("Expander clicked for task:", task)
  }

  const columnWidth = view === ViewMode.Year ? 350 : 
                    view === ViewMode.Month ? 300 : 
                    view === ViewMode.Week ? 250 : 65

  return (
    <div className={styles.ganttContainer}>
      {/* 툴바 */}
      <div className="flex-shrink-0 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">프로젝트 간트차트</h2>
          <span className="text-sm text-gray-500">
            ({tasks.length}개 작업)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* 뷰 모드 선택 */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === ViewMode.Day 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setView(ViewMode.Day)}
            >
              일
            </button>
            <button
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === ViewMode.Week 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setView(ViewMode.Week)}
            >
              주
            </button>
            <button
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === ViewMode.Month 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setView(ViewMode.Month)}
            >
              월
            </button>
            <button
              className={`px-3 py-1 rounded text-sm transition-colors ${
                view === ViewMode.Year 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setView(ViewMode.Year)}
            >
              년
            </button>
          </div>

          {/* 종속성 표시 토글 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700">종속성 표시</span>
          </label>
        </div>
      </div>

      {/* 간트차트 */}
      <div className={styles.ganttWrapper}>
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={view}
            onDateChange={onDateChange}
            onDelete={onTaskDelete}
            onProgressChange={onProgressChange}
            onDoubleClick={handleTaskClick}
            onExpanderClick={handleExpanderClick}
            listCellWidth={isChecked ? "155px" : ""}
            ganttHeight={Math.max(400, tasks.length * 50 + 100)}
            columnWidth={columnWidth}
            locale="ko"
            barCornerRadius={3}
            barProgressColor="#4f7eff"
            barProgressSelectedColor="#3b5fd1"
            barBackgroundColor="#e5e7eb"
            barBackgroundSelectedColor="#d1d5db"
            projectProgressColor="#10b981"
            projectProgressSelectedColor="#059669"
            projectBackgroundColor="#d1fae5"
            projectBackgroundSelectedColor="#a7f3d0"
            milestoneBackgroundColor="#ef4444"
            milestoneBackgroundSelectedColor="#dc2626"
            rtl={false}
            handleWidth={8}
            timeStep={300}
            arrowColor="#6b7280"
            fontFamily="Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="14px"
            rowHeight={50}
            todayColor="rgba(79, 126, 255, 0.1)"
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            작업이 없습니다. 새 작업을 추가해주세요.
          </div>
        )}
      </div>

      {/* 선택된 작업 정보 */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 mt-4 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">작업 상세 정보</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">작업명:</span>
              <p className="font-medium">{selectedTask.name}</p>
            </div>
            <div>
              <span className="text-gray-600">시작일:</span>
              <p className="font-medium">
                {new Date(selectedTask.start).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">종료일:</span>
              <p className="font-medium">
                {new Date(selectedTask.end).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">진행률:</span>
              <p className="font-medium">{selectedTask.progress}%</p>
            </div>
          </div>

          {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-gray-600">종속성:</span>
              <p className="text-sm font-medium">{selectedTask.dependencies.join(', ')}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* 범례 */}
      <div className="flex-shrink-0 mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-[#4f7eff] rounded"></div>
          <span className="text-gray-600">일반 작업</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-[#10b981] rounded"></div>
          <span className="text-gray-600">프로젝트</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-[#ef4444] rounded"></div>
          <span className="text-gray-600">마일스톤</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-gray-400"></div>
          <span className="text-gray-600">오늘</span>
        </div>
      </div>
    </div>
  )
}