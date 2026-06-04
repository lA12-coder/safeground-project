import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Use /api/admin/providers/[id]/verify' }, { status: 400 })
}
