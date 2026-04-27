import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

const APP_SESSION_SECRET =
  process.env.APP_SESSION_SECRET ??
  process.env.FACEIT_CLIENT_SECRET ??
  'syntra-dev-session-secret-change-me'

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

  return JSON.parse(fromBase64Url(body)) as Record<string, unknown>
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('syntra_session')?.value
  const faceitProfileRaw = cookieStore.get('faceit_profile')?.value
  const faceitCallbackDebugRaw = cookieStore.get('faceit_callback_debug')?.value

  let sessionPayload: Record<string, unknown> | null = null
  if (sessionToken) {
    sessionPayload = verifySession(sessionToken, APP_SESSION_SECRET)
  }

  let faceitProfile: Record<string, unknown> | null = null
  if (faceitProfileRaw) {
    try {
      faceitProfile = JSON.parse(decodeURIComponent(faceitProfileRaw)) as Record<string, unknown>
    } catch {
      faceitProfile = null
    }
  }

  let faceitCallbackDebug: Record<string, unknown> | null = null
  if (faceitCallbackDebugRaw) {
    try {
      faceitCallbackDebug = JSON.parse(decodeURIComponent(faceitCallbackDebugRaw)) as Record<string, unknown>
    } catch {
      faceitCallbackDebug = null
    }
  }

  return NextResponse.json({
    has_session_cookie: Boolean(sessionToken),
    has_faceit_profile_cookie: Boolean(faceitProfileRaw),
    has_faceit_callback_debug_cookie: Boolean(faceitCallbackDebugRaw),
    session_payload: sessionPayload,
    faceit_profile: faceitProfile,
    faceit_callback_payload: faceitCallbackDebug,
  })
}
