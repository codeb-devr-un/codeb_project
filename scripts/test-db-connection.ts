
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/project_cms?schema=public"
console.log(`Testing connection to: ${url}`)

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function main() {
    try {
        await prisma.$connect()
        console.log('SUCCESS: Connected to database.')

        // Try a simple query
        const userCount = await prisma.user.count()
        console.log(`User count: ${userCount}`)

    } catch (error) {
        console.error('FAILED: Could not connect to database.')
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
