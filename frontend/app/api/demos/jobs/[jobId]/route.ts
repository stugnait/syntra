import { NextResponse } from 'next/server'

const BACKEND_ORIGIN = process.env.BACKEND_API_ORIGIN ?? 'http://127.0.0.1:8000'

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params

  try {
    const upstream = await fetch(`${BACKEND_ORIGIN}/api/demos/jobs/${jobId}/`, {
      method: 'GET',
      cache: 'no-store',
    })

    const payload = await upstream.json().catch(() => null)
    return NextResponse.json(payload ?? { error: 'Invalid backend response' }, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'Demo backend is unavailable.' }, { status: 502 })
  }
}
