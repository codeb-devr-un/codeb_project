import React from 'react'
import Link from 'next/link'
import { ProjectDetail, statusLabels, statusColors } from '@/hooks/useProject'

interface ProjectHeaderProps {
  project: ProjectDetail
  onStatusChange: (status: ProjectDetail['status']) => void
  onDelete: () => void
}

export default function ProjectHeader({ project, onStatusChange, onDelete }: ProjectHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/projects" className="hover:text-primary">프로젝트</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              상태:
            </label>
            <select
              id="status"
              value={project.status}
              onChange={(e) => onStatusChange(e.target.value as ProjectDetail['status'])}
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            프로젝트 삭제
          </button>
        </div>
      </div>
    </div>
  )
}