import { NextResponse } from 'next/server'

const FACEIT_AUTH_ORIGIN = process.env.FACEIT_AUTH_ORIGIN ?? 'https://accounts.faceit.com/'
const FACEIT_REDIRECT_URI =
  process.env.FACEIT_REDIRECT_URI ??
  'https://rotting-pebbly-waggle.ngrok-free.dev/api/auth/faceit/callback'
const FACEIT_CLIENT_ID = process.env.FACEIT_CLIENT_ID ?? process.env.NEXT_PUBLIC_FACEIT_CLIENT_ID
const FACEIT_SCOPE = process.env.FACEIT_SCOPE ?? process.env.FACEIT_AUTH_URL ?? 'openid profile email'

function toBase64Url(value: Buffer) {
  return value
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString(byteLength = 32) {
  return toBase64Url(Buffer.from(crypto.getRandomValues(new Uint8Array(byteLength))))
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toBase64Url(Buffer.from(hash))
}

export async function GET(request: Request) {
  if (!FACEIT_CLIENT_ID) {
    return NextResponse.redirect(new URL('/auth?error=missing_faceit_client_id', request.url))
  }

  const codeVerifier = randomString(64)
  const state = randomString(32)
  const codeChallenge = await sha256(codeVerifier)

  const authUrl =
    `${FACEIT_AUTH_ORIGIN}?` +
    new URLSearchParams({
      client_id: FACEIT_CLIENT_ID,
      redirect_uri: FACEIT_REDIRECT_URI,
      response_type: 'code',
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
    secure: true,
    httpOnly: true,
  })
  response.cookies.set('faceit_pkce_verifier', codeVerifier, {
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })

  return response
}
