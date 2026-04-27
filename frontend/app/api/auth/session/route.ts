import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const APP_SESSION_SECRET =
  process.env.APP_SESSION_SECRET ??
  process.env.FACEIT_CLIENT_SECRET ??
  'syntra-dev-session-secret-change-me'

type SessionPayload = {
  provider?: string
  nickname?: string
  avatar?: string
  exp?: number
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(padded, 'base64').toString('utf-8')
}

function verifySession(token: string, secret: string) {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) return null

  const expectedSignature = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (actualBuffer.length !== expectedBuffer.length) return null

  const valid = timingSafeEqual(actualBuffer, expectedBuffer)
  if (!valid) return null

  return JSON.parse(fromBase64Url(body)) as SessionPayload
}

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('syntra_session')?.value
  const secret = APP_SESSION_SECRET

  if (!session || !secret) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const payload = verifySession(session, secret)
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      provider: payload.provider ?? null,
      nickname: payload.nickname ?? null,
      avatar: payload.avatar ?? null,
    },
  })
}
