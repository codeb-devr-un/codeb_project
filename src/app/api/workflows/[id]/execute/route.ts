import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Workflow engine unavailable' }, { status: 503 })
}