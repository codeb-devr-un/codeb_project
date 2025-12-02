
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugFeatures() {
    console.log('[Debug] Starting feature simulation...')

    try {
        // 1. Get User and Workspace
        const user = await prisma.user.findFirst()
        if (!user) throw new Error('No user found. Run debug-auth.ts first.')
        console.log('[Debug] Using user:', user.email, user.id)

        const workspace = await prisma.workspace.findFirst()
        if (!workspace) throw new Error('No workspace found.')
        console.log('[Debug] Using workspace:', workspace.name, workspace.id)

        // 2. Simulate Project Creation (Server Action logic)
        console.log('[Debug] Creating project...')
        const projectData = {
            name: 'Debug Project ' + Date.now(),
            description: 'Created by debug script',
            status: 'planning',
            visibility: 'private',
            priority: 'medium',
            createdBy: user.id,
            workspaceId: workspace.id,
        }

        // Note: We are using prisma directly, matching the Server Action's DB call
        const project = await prisma.project.create({
            data: {
                name: projectData.name,
                description: projectData.description,
                status: 'planning', // Enum value as string (Prisma handles this)
                visibility: 'private',
                priority: 'medium',
                createdBy: projectData.createdBy,
                workspaceId: projectData.workspaceId,
                members: {
                    create: {
                        userId: projectData.createdBy,
                        role: 'Admin'
                    }
                }
            }
        })
        console.log('[Debug] Project created:', project.id, project.name)

        // 3. Simulate Task Creation (API Route logic)
        console.log('[Debug] Creating task...')
        const taskData = {
            projectId: project.id,
            title: 'Debug Task',
            description: 'Created by debug script',
            status: 'todo',
            priority: 'medium',
            assignedTo: user.id, // API expects 'assignedTo'
            createdBy: user.id
        }

        const task = await prisma.task.create({
            data: {
                projectId: taskData.projectId,
                title: taskData.title,
                description: taskData.description,
                status: 'todo',
                priority: 'medium',
                assigneeId: taskData.assignedTo, // Mapped from assignedTo
                createdBy: taskData.createdBy,
            },
        })
        console.log('[Debug] Task created:', task.id, task.title)

        console.log('[Debug] Feature simulation completed successfully!')

        // Cleanup
        console.log('[Debug] Cleaning up...')
        await prisma.task.delete({ where: { id: task.id } })
        await prisma.project.delete({ where: { id: project.id } })
        console.log('[Debug] Cleanup done')

    } catch (error) {
        console.error('[Debug] Feature simulation failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

debugFeatures()
