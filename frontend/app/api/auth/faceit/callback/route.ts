import { createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const FACEIT_OIDC_CONFIG_URL =
  process.env.FACEIT_OIDC_CONFIG_URL ?? 'https://api.faceit.com/auth/v1/openid_configuration'
const FACEIT_TOKEN_URL = process.env.FACEIT_TOKEN_URL
const FACEIT_USERINFO_URL = process.env.FACEIT_USERINFO_URL
const FACEIT_REDIRECT_URI = process.env.FACEIT_REDIRECT_URI
const FACEIT_CLIENT_ID = process.env.FACEIT_CLIENT_ID
const FACEIT_CLIENT_SECRET = process.env.FACEIT_CLIENT_SECRET
const APP_SESSION_SECRET =
  process.env.APP_SESSION_SECRET ??
  process.env.FACEIT_CLIENT_SECRET ??
  'syntra-dev-session-secret-change-me'

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

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (forwardedProto === 'https') {
    return true
  }

  if (request.nextUrl.protocol === 'https:') {
    return true
  }

  return false
}

function resolveRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const requestOrigin = resolveRequestOrigin(request)
  const appOrigin = process.env.APP_ORIGIN ?? requestOrigin
  const redirectUri = FACEIT_REDIRECT_URI ?? `${requestOrigin}/api/auth/faceit/callback`
  const secureCookie = isSecureRequest(request)

  const query = request.nextUrl.searchParams
  const code = query.get('code')
  const state = query.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth?error=missing_oauth_params', appOrigin))
  }

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('faceit_oauth_state')?.value
  const codeVerifier = cookieStore.get('faceit_pkce_verifier')?.value
  const popupMode = cookieStore.get('faceit_popup_mode')?.value === '1'

  if (!expectedState || !codeVerifier || state !== expectedState) {
    return NextResponse.redirect(new URL('/auth?error=invalid_oauth_state', appOrigin))
  }

  if (!FACEIT_CLIENT_ID) {
    return NextResponse.redirect(new URL('/auth?error=missing_faceit_client_id', appOrigin))
  }

  let endpoints: { tokenUrl: string; userInfoUrl: string }
  try {
    endpoints = await resolveOidcEndpoints()
  } catch {
    return NextResponse.redirect(new URL('/auth?error=faceit_discovery_failed', appOrigin))
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
      redirect_uri: redirectUri,
      client_id: FACEIT_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
    cache: 'no-store',
  })

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/auth?error=faceit_token_exchange_failed', appOrigin))
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL('/auth?error=faceit_access_token_missing', appOrigin))
  }

  const profileResponse = await fetch(endpoints.userInfoUrl, {
    headers: {
      authorization: `Bearer ${tokenData.access_token}`,
    },
    cache: 'no-store',
  })

  if (!profileResponse.ok) {
    return NextResponse.redirect(new URL('/auth?error=faceit_profile_fetch_failed', appOrigin))
  }

  const profile = (await profileResponse.json()) as FaceitProfile
  const now = Math.floor(Date.now() / 1000)
  const maxAge = Math.max(60 * 60, tokenData.expires_in ?? 60 * 60)
  const sessionPayload = {
    provider: 'faceit',
    faceit_id: profile.sub ?? profile.guid ?? profile.player_id,
    nickname: profile.nickname,
    email: profile.email,
    avatar: profile.avatar,
    iat: now,
    exp: now + maxAge,
  }
  const appSession = createAppSession(sessionPayload, APP_SESSION_SECRET)

  const response = popupMode
    ? new NextResponse(
        `<!doctype html><html><body><script>
const nextUrl = '/onboarding?source=faceit&status=connected';
if (window.opener) {
  window.opener.postMessage({ type: 'faceit-auth-success' }, '${appOrigin}');
  window.close();
} else {
  window.location.replace(nextUrl);
}
</script>Authentication completed. You can close this window.</body></html>`,
        { headers: { 'content-type': 'text/html; charset=utf-8' } },
      )
    : NextResponse.redirect(new URL('/onboarding?source=faceit&status=connected', appOrigin))

  response.cookies.set('faceit_oauth_state', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_pkce_verifier', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_popup_mode', '', { maxAge: 0, path: '/' })
  response.cookies.set('syntra_session', appSession, {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure: secureCookie,
    httpOnly: true,
  })
  response.cookies.set('faceit_profile', encodeURIComponent(JSON.stringify(profile)), {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure: secureCookie,
    httpOnly: true,
  })

  return response
}
