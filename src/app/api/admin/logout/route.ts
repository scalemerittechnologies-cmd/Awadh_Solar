import { NextResponse } from 'next/server'
import { hasAllowedOrigin } from '@/lib/request-origin'
import { adminSessionCookie } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request, false)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminSessionCookie, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
