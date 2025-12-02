export interface Department {
    id: string
    name: string
    color: string
}

export const DEPARTMENTS: Department[] = [
    { id: 'planning', name: '기획', color: '#8B5CF6' }, // Violet
    { id: 'development', name: '개발', color: '#3B82F6' }, // Blue
    { id: 'design', name: '디자인', color: '#EC4899' }, // Pink
    { id: 'operations', name: '운영', color: '#10B981' }, // Emerald
    { id: 'marketing', name: '마케팅', color: '#F59E0B' }, // Amber
    { id: 'sales', name: '영업', color: '#EF4444' }, // Red
    { id: 'hr', name: '인사', color: '#6366F1' }, // Indigo
]

export const getDepartmentColor = (departmentId?: string): string => {
    if (!departmentId) return '#94A3B8' // Slate-400 (Default)
    const dept = DEPARTMENTS.find(d => d.id === departmentId)
    return dept ? dept.color : '#94A3B8'
}

export const getDepartmentName = (departmentId?: string): string => {
    if (!departmentId) return '미지정'
    const dept = DEPARTMENTS.find(d => d.id === departmentId)
    return dept ? dept.name : departmentId
}
