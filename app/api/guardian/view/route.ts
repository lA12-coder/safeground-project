import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Use /guardian/view/[token] dynamic route' }, { status: 400 })
}
