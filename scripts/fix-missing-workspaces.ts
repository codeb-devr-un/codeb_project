
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMissingWorkspaces() {
    console.log('[Fix] Starting workspace fix...')

    try {
        // 1. Get Default Workspace
        let defaultWorkspace = await prisma.workspace.findFirst({
            orderBy: { createdAt: 'asc' }
        })

        if (!defaultWorkspace) {
            console.log('[Fix] No workspace found. Creating default workspace...')
            defaultWorkspace = await prisma.workspace.create({
                data: {
                    name: 'Default Workspace',
                    slug: 'default-workspace',
                    inviteCode: 'DEFAULT',
                }
            })
            console.log('[Fix] Created default workspace:', defaultWorkspace.id)
        } else {
            console.log('[Fix] Using default workspace:', defaultWorkspace.name, defaultWorkspace.id)
        }

        // 2. Get Users without Workspace
        const users = await prisma.user.findMany({
            include: {
                workspaces: true
            }
        })

        const usersWithoutWorkspace = users.filter(u => u.workspaces.length === 0)
        console.log('[Fix] Found', usersWithoutWorkspace.length, 'users without workspace.')

        // 3. Add them to workspace
        for (const user of usersWithoutWorkspace) {
            console.log('[Fix] Adding user', user.email, 'to workspace...')
            await prisma.workspaceMember.create({
                data: {
                    workspaceId: defaultWorkspace.id,
                    userId: user.id,
                    role: 'member'
                }
            })
            console.log('[Fix] Added user to workspace.')
        }

        console.log('[Fix] Workspace fix completed!')

    } catch (error) {
        console.error('[Fix] Failed to fix workspaces:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixMissingWorkspaces()
