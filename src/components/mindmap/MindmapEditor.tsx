'use client'

import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Plus, Save, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

import dagre from 'dagre'

interface MindmapEditorProps {
    projectId: string
    projectName: string
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({ rankdir: direction })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 80 }) // Approximate node size
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        node.targetPosition = isHorizontal ? Position.Left : Position.Top
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - 200 / 2,
            y: nodeWithPosition.y - 80 / 2,
        }

        return node
    })

    return { nodes: layoutedNodes, edges }
}

export default function MindmapEditor({ projectId, projectName }: MindmapEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Load existing tasks as mindmap nodes
    useEffect(() => {
        loadTasks()
    }, [projectId, projectName])

    const loadTasks = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`)
            const data = await response.json()
            setTasks(data)

            // Create Root Node (Project Name)
            const rootNode: Node = {
                id: 'root',
                type: 'input', // Input type usually has source handle at bottom
                data: { label: projectName },
                position: { x: 0, y: 0 },
                style: {
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    width: 'auto',
                    minWidth: '150px',
                    textAlign: 'center'
                }
            }

            // Convert tasks to mindmap nodes
            const taskNodes: Node[] = data.map((task: any) => ({
                id: task.id,
                type: 'default',
                data: {
                    label: (
                        <div className="px-3 py-2">
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-gray-500">{task.status}</div>
                        </div>
                    )
                },
                position: { x: 0, y: 0 }, // Position will be set by dagre
                style: {
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: '200px'
                }
            }))

            // Create Edges connecting Root to Tasks
            const taskEdges: Edge[] = data.map((task: any) => ({
                id: `e-root-${task.id}`,
                source: 'root',
                target: task.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#94a3b8' }
            }))

            const initialNodes = [rootNode, ...taskNodes]
            const initialEdges = taskEdges

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                initialNodes,
                initialEdges
            )

            setNodes(layoutedNodes)
            setEdges(layoutedEdges)
        } catch (error) {
            console.error('Failed to load tasks:', error)
            toast.error('작업 로드 실패')
        } finally {
            setLoading(false)
        }
    }

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    const onLayout = useCallback((direction: string) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        )
        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges])
    }, [nodes, edges, setNodes, setEdges])

    const addNode = async () => {
        const newTaskTitle = `새 작업 ${nodes.length}` // -1 for root, +1 for new = length

        try {
            // Create actual task in DB
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskTitle,
                    status: 'todo',
                    priority: 'medium',
                    description: '마인드맵에서 생성됨',
                }),
            })

            if (!response.ok) throw new Error('Failed to create task')

            const newTask = await response.json()
            toast.success('작업이 생성되었습니다')

            // Reload to sync with Kanban/Gantt
            await loadTasks()
        } catch (error) {
            console.error('Failed to add node:', error)
            toast.error('작업 생성에 실패했습니다')
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex gap-2 p-4 border-b bg-white">
                <Button onClick={addNode} size="sm" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    작업 추가
                </Button>
                <Button onClick={loadTasks} size="sm" variant="outline" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    새로고침
                </Button>
                <Button onClick={() => onLayout('TB')} size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    자동 정렬
                </Button>
                <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        실시간 동기화
                    </span>
                    총 {nodes.length}개 작업
                </div>
            </div>

            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>

            <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
                💡 마인드맵에서 추가한 작업은 칸반 보드와 간트 차트에 자동으로 반영됩니다
            </div>
        </div>
    )
}
