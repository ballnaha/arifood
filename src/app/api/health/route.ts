import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  })
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
} 