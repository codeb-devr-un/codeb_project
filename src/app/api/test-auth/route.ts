import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''

  // Mask password in URL for safe display
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')

  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    urlLength: dbUrl.length,
    maskedUrl: maskedUrl,
    startsWithPostgres: dbUrl.startsWith('postgres'),
    containsPgbouncer: dbUrl.includes('pgbouncer'),
    containsPooler: dbUrl.includes('pooler'),
  })
}
