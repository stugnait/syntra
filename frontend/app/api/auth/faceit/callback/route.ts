import { createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const FACEIT_OIDC_CONFIG_URL =
  process.env.FACEIT_OIDC_CONFIG_URL ?? 'https://accounts.faceit.com/.well-known/openid-configuration'
const FACEIT_TOKEN_URL = process.env.FACEIT_TOKEN_URL
const FACEIT_USERINFO_URL = process.env.FACEIT_USERINFO_URL
const FACEIT_REDIRECT_URI =
  process.env.FACEIT_REDIRECT_URI ??
  'https://rotting-pebbly-waggle.ngrok-free.dev/api/auth/faceit/callback'
const FACEIT_CLIENT_ID = process.env.FACEIT_CLIENT_ID
const FACEIT_CLIENT_SECRET = process.env.FACEIT_CLIENT_SECRET
const APP_SESSION_SECRET = process.env.APP_SESSION_SECRET

type OidcConfig = {
  token_endpoint?: string
  userinfo_endpoint?: string
}

type FaceitProfile = {
  sub?: string
  guid?: string
  player_id?: string
  nickname?: string
  email?: string
  avatar?: string
}

function toBase64Url(text: string) {
  return Buffer.from(text)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function createAppSession(payload: Record<string, unknown>, secret: string) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(payload))
  const signature = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${header}.${body}.${signature}`
}

async function resolveOidcEndpoints() {
  if (FACEIT_TOKEN_URL && FACEIT_USERINFO_URL) {
    return {
      tokenUrl: FACEIT_TOKEN_URL,
      userInfoUrl: FACEIT_USERINFO_URL,
    }
  }

  const discoveryResponse = await fetch(FACEIT_OIDC_CONFIG_URL, { cache: 'no-store' })
  if (!discoveryResponse.ok) {
    throw new Error('FACEIT OIDC discovery failed')
  }

  const discovery = (await discoveryResponse.json()) as OidcConfig
  if (!discovery.token_endpoint || !discovery.userinfo_endpoint) {
    throw new Error('FACEIT OIDC endpoints missing')
  }

  return {
    tokenUrl: FACEIT_TOKEN_URL ?? discovery.token_endpoint,
    userInfoUrl: FACEIT_USERINFO_URL ?? discovery.userinfo_endpoint,
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams
  const code = query.get('code')
  const state = query.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth?error=missing_oauth_params', request.url))
  }

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('faceit_oauth_state')?.value
  const codeVerifier = cookieStore.get('faceit_pkce_verifier')?.value

  if (!expectedState || !codeVerifier || state !== expectedState) {
    return NextResponse.redirect(new URL('/auth?error=invalid_oauth_state', request.url))
  }

  if (!FACEIT_CLIENT_ID) {
    return NextResponse.redirect(new URL('/auth?error=missing_faceit_client_id', request.url))
  }

  if (!APP_SESSION_SECRET) {
    return NextResponse.redirect(new URL('/auth?error=missing_app_session_secret', request.url))
  }

  let endpoints: { tokenUrl: string; userInfoUrl: string }
  try {
    endpoints = await resolveOidcEndpoints()
  } catch {
    return NextResponse.redirect(new URL('/auth?error=faceit_discovery_failed', request.url))
  }

  const headers: HeadersInit = {
    'content-type': 'application/x-www-form-urlencoded',
  }

  if (FACEIT_CLIENT_SECRET) {
    headers.authorization = `Basic ${Buffer.from(`${FACEIT_CLIENT_ID}:${FACEIT_CLIENT_SECRET}`).toString('base64')}`
  }

  const tokenResponse = await fetch(endpoints.tokenUrl, {
    method: 'POST',
    headers,
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: FACEIT_REDIRECT_URI,
      client_id: FACEIT_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
    cache: 'no-store',
  })

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/auth?error=faceit_token_exchange_failed', request.url))
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL('/auth?error=faceit_access_token_missing', request.url))
  }

  const profileResponse = await fetch(endpoints.userInfoUrl, {
    headers: {
      authorization: `Bearer ${tokenData.access_token}`,
    },
    cache: 'no-store',
  })

  if (!profileResponse.ok) {
    return NextResponse.redirect(new URL('/auth?error=faceit_profile_fetch_failed', request.url))
  }

  const profile = (await profileResponse.json()) as FaceitProfile
  const now = Math.floor(Date.now() / 1000)
  const maxAge = Math.max(60 * 60, tokenData.expires_in ?? 60 * 60)
  const appSession = createAppSession(
    {
      provider: 'faceit',
      faceit_id: profile.sub ?? profile.guid ?? profile.player_id,
      nickname: profile.nickname,
      email: profile.email,
      avatar: profile.avatar,
      iat: now,
      exp: now + maxAge,
    },
    APP_SESSION_SECRET,
  )

  const response = NextResponse.redirect(new URL('/onboarding?source=faceit&status=connected', request.url))

  response.cookies.set('faceit_oauth_state', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_pkce_verifier', '', { maxAge: 0, path: '/' })
  response.cookies.set('syntra_session', appSession, {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })
  response.cookies.set('faceit_profile', encodeURIComponent(JSON.stringify(profile)), {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })

  return response
}
