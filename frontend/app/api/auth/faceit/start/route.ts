import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'

const FACEIT_AUTH_ORIGIN = process.env.FACEIT_AUTH_ORIGIN ?? 'https://accounts.faceit.com/'
const FACEIT_REDIRECT_URI = process.env.FACEIT_REDIRECT_URI
const FACEIT_CLIENT_ID = process.env.FACEIT_CLIENT_ID ?? process.env.NEXT_PUBLIC_FACEIT_CLIENT_ID
const FACEIT_SCOPE = process.env.FACEIT_SCOPE ?? process.env.FACEIT_AUTH_URL ?? 'openid profile email'

function isSecureRequest(request: Request) {
  const url = new URL(request.url)
  if (url.protocol === 'https:') {
    return true
  }

  return request.headers.get('x-forwarded-proto') === 'https'
}

function toBase64Url(value: Buffer) {
  return value
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString(byteLength = 32) {
  return toBase64Url(randomBytes(byteLength))
}

function sha256(value: string) {
  return toBase64Url(createHash('sha256').update(value).digest())
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const appOrigin = process.env.APP_ORIGIN ?? requestUrl.origin

  if (!FACEIT_CLIENT_ID) {
    return NextResponse.redirect(new URL('/auth?error=missing_faceit_client_id', appOrigin))
  }

  const codeVerifier = randomString(64)
  const state = randomString(32)
  const codeChallenge = sha256(codeVerifier)

  const configuredRedirectUri = FACEIT_REDIRECT_URI ?? `${requestUrl.origin}/api/auth/faceit/callback`
  const secureCookie = isSecureRequest(request)

  const popupParam = new URL(request.url).searchParams.get('popup')
  const popupMode = popupParam !== '0'

  const authUrl =
    `${FACEIT_AUTH_ORIGIN}?` +
    new URLSearchParams({
      client_id: FACEIT_CLIENT_ID,
      redirect_uri: configuredRedirectUri,
      redirect_popup: popupMode ? '1' : '0',
      response_type: 'code',
      response_mode: 'query',
      scope: FACEIT_SCOPE,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }).toString()

  const response = NextResponse.redirect(authUrl)

  response.cookies.set('faceit_oauth_state', state, {
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
    secure: secureCookie,
    httpOnly: true,
  })
  response.cookies.set('faceit_popup_mode', popupMode ? '1' : '0', {
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
    secure: secureCookie,
    httpOnly: true,
  })
  response.cookies.set('faceit_pkce_verifier', codeVerifier, {
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
    secure: secureCookie,
    httpOnly: true,
  })

  return response
}
