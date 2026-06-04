import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Use /api/admin/chat/[id]/delete' }, { status: 400 })
}
