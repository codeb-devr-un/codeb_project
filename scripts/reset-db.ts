import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting database reset...')

    try {
        // Delete in order to avoid foreign key constraints issues
        // Although Cascade delete is set up for many relations, it's safer to be explicit
        // or delete leaf nodes first if needed.

        // However, since we want to clear everything, we can try deleting top-level entities.
        // Workspace deletion should cascade to Projects, Tasks, Members, etc.

        console.log('Deleting all Workspaces...')
        await prisma.workspace.deleteMany({})

        console.log('Deleting all Users...')
        await prisma.user.deleteMany({})

        console.log('Database reset completed successfully.')
    } catch (error) {
        console.error('Error resetting database:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
