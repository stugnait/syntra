import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/auth', request.url))

  response.cookies.set('syntra_session', '', { maxAge: 0, path: '/' })
  response.cookies.set('faceit_profile', '', { maxAge: 0, path: '/' })

  return response
}
