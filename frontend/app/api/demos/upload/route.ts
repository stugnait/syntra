import { NextResponse } from 'next/server'

const BACKEND_ORIGIN = process.env.BACKEND_API_ORIGIN ?? 'http://127.0.0.1:8000'

export async function POST(request: Request) {
  try {
    const incomingForm = await request.formData()
    const demo = incomingForm.get('demo')
    if (!(demo instanceof File)) {
      return NextResponse.json({ error: 'No file provided. Use form-data key `demo`.' }, { status: 400 })
    }

    const forwardForm = new FormData()
    forwardForm.append('demo', demo)

    const upstream = await fetch(`${BACKEND_ORIGIN}/api/demos/upload/`, {
      method: 'POST',
      body: forwardForm,
      cache: 'no-store',
    })

    const payload = await upstream.json().catch(() => null)
    return NextResponse.json(payload ?? { error: 'Invalid backend response' }, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'Demo backend is unavailable.' }, { status: 502 })
  }
}
