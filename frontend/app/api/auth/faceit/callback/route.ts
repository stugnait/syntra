import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const FACEIT_TOKEN_URL = process.env.FACEIT_TOKEN_URL ?? 'https://api.faceit.com/auth/v1/oauth/token'
const FACEIT_USERINFO_URL =
  process.env.FACEIT_USERINFO_URL ?? 'https://api.faceit.com/auth/v1/resources/userinfo'
const FACEIT_REDIRECT_URI =
  process.env.FACEIT_REDIRECT_URI ??
  'https://rotting-pebbly-waggle.ngrok-free.dev/api/auth/faceit/callback'
const FACEIT_CLIENT_ID = process.env.FACEIT_CLIENT_ID

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

  const tokenResponse = await fetch(FACEIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
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
    id_token?: string
  }

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL('/auth?error=faceit_access_token_missing', request.url))
  }

  const profileResponse = await fetch(FACEIT_USERINFO_URL, {
    headers: {
      authorization: `Bearer ${tokenData.access_token}`,
    },
    cache: 'no-store',
  })

  if (!profileResponse.ok) {
    return NextResponse.redirect(new URL('/auth?error=faceit_profile_fetch_failed', request.url))
  }

  const profile = await profileResponse.json()

  // TODO: Create/link user in your database and issue your own app session here.
  const response = NextResponse.redirect(new URL('/onboarding?source=faceit', request.url))

  response.cookies.set('faceit_oauth_state', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_pkce_verifier', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_profile', encodeURIComponent(JSON.stringify(profile)), {
    path: '/',
    maxAge: 60 * 5,
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })

  return response
}
