
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying database state...')

    // Check Users
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users`)
    users.forEach(u => console.log(`- ${u.email} (${u.role})`))

    // Check Workspaces
    const workspaces = await prisma.workspace.findMany({
        include: { members: true }
    })
    console.log(`Found ${workspaces.length} workspaces`)
    workspaces.forEach(w => {
        console.log(`- ${w.name} (${w.domain})`)
        console.log(`  Members: ${w.members.length}`)
    })

    // Check Projects
    const projects = await prisma.project.findMany({
        include: { tasks: true }
    })
    console.log(`Found ${projects.length} projects`)
    projects.forEach(p => {
        console.log(`- ${p.name} (${p.status})`)
        console.log(`  Tasks: ${p.tasks.length}`)
    })

    if (users.length > 0 && workspaces.length > 0 && projects.length > 0) {
        console.log('✅ Database verification PASSED')
    } else {
        console.error('❌ Database verification FAILED: Missing data')
        process.exit(1)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
