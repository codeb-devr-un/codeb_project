
import { PrismaClient } from '@prisma/client'
import { getAllTasks } from '../src/actions/task'

const prisma = new PrismaClient()

async function debugTasks() {
    console.log('[Debug] Starting tasks simulation...')

    try {
        // 1. Get User
        const user = await prisma.user.findFirst()
        if (!user) throw new Error('No user found.')
        console.log('[Debug] Using user:', user.email, user.id)

        // 2. Get Workspaces (Simulate /api/workspaces)
        const userWithWorkspaces = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                workspaces: {
                    include: {
                        workspace: true,
                    },
                },
            },
        })

        const workspaces = userWithWorkspaces?.workspaces.map(wm => wm.workspace) || []
        console.log('[Debug] Found workspaces:', workspaces.length)
        if (workspaces.length > 0) {
            console.log('[Debug] First workspace:', workspaces[0].name, workspaces[0].id)
        } else {
            console.warn('[Debug] No workspaces found for user!')
        }

        if (workspaces.length === 0) {
            console.log('[Debug] Aborting task fetch because no workspace.')
            return
        }

        const workspaceId = workspaces[0].id

        // 3. Test getAllTasks
        console.log('[Debug] Fetching tasks for user:', user.id, 'and workspace:', workspaceId)
        const tasks = await getAllTasks(user.id, workspaceId)
        console.log('[Debug] Tasks found:', tasks.length)
        if (tasks.length > 0) {
            console.log('[Debug] First task:', tasks[0].title)
        }

        // 4. Test creating a task (Simulate Personal Task)
        console.log('[Debug] Creating personal task...')
        const personalTask = await prisma.task.create({
            data: {
                title: 'Debug Personal Task',
                status: 'todo',
                priority: 'medium',
                createdBy: user.id,
                assigneeId: user.id,
                // No projectId
            }
        })
        console.log('[Debug] Personal task created:', personalTask.id)

        // 5. Fetch again
        const tasksAfter = await getAllTasks(user.id, workspaceId)
        console.log('[Debug] Tasks found after creation:', tasksAfter.length)

        // Cleanup
        await prisma.task.delete({ where: { id: personalTask.id } })
        console.log('[Debug] Cleanup done')

    } catch (error) {
        console.error('[Debug] Tasks simulation failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

debugTasks()
