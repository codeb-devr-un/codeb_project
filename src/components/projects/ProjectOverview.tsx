import React from 'react'
import { ProjectDetail } from '@/hooks/useProject'

interface Milestone {
  id: string
  title: string
  date: string
  completed: boolean
  description: string
}

interface ProjectOverviewProps {
  project: ProjectDetail & { milestones?: Milestone[] }
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">프로젝트 정보</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">시작일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.startDate).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">종료일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.endDate).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">생성일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.createdAt).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">최종 수정일</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">마일스톤</h3>
          {project.milestones && project.milestones.length > 0 ? (
            <div className="space-y-4">
              {project.milestones.map(milestone => (
                <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full ${
                    milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(milestone.date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">마일스톤이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}