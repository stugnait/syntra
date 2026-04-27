'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type DebugEvent = {
  id: number
  at: string
  source: string
  type: string
  payload?: unknown
}

type SessionResponse = {
  authenticated?: boolean
  user?: {
    provider?: string | null
    nickname?: string | null
    avatar?: string | null
  }
}

const MAX_EVENTS = 1000

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return '[unserializable value]'
  }
}

function nowIso() {
  return new Date().toISOString()
}

export default function OnboardingClient({ initialStep }: { initialStep?: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [eventId, setEventId] = useState(1)
  const [sessionData, setSessionData] = useState<SessionResponse | null>(null)
  const [faceitDebugData, setFaceitDebugData] = useState<unknown>(null)

  const appendEvent = (source: string, type: string, payload?: unknown) => {
    setEventId((prev) => {
      const next = prev + 1
      setEvents((current) => {
        const newEvent: DebugEvent = {
          id: prev,
          at: nowIso(),
          source,
          type,
          payload,
        }
        const merged = [...current, newEvent]
        return merged.slice(Math.max(merged.length - MAX_EVENTS, 0))
      })
      return next
    })
  }

  useEffect(() => {
    appendEvent('system', 'debug_mode_enabled', {
      note: 'Onboarding visual UI disabled. Full debug stream active.',
      initialStep: initialStep ?? null,
      path: window.location.pathname,
      query: Object.fromEntries(searchParams.entries()),
      userAgent: navigator.userAgent,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)
    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startedAt = performance.now()
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      appendEvent('network', 'fetch_request', {
        url: requestUrl,
        method: init?.method ?? 'GET',
        headers: init?.headers ?? null,
        cache: init?.cache ?? null,
      })

      try {
        const response = await originalFetch(input, init)
        const elapsedMs = Math.round(performance.now() - startedAt)
        appendEvent('network', 'fetch_response', {
          url: requestUrl,
          status: response.status,
          ok: response.ok,
          elapsedMs,
        })
        return response
      } catch (error) {
        appendEvent('network', 'fetch_error', {
          url: requestUrl,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    const patchHistory = (kind: 'pushState' | 'replaceState', fn: History['pushState']) => {
      return function patched(this: History, ...args: Parameters<History['pushState']>) {
        const url = args[2]
        appendEvent('navigation', kind, {
          url: typeof url === 'string' ? url : url?.toString() ?? null,
          state: args[0],
        })
        return fn.apply(this, args)
      }
    }

    window.history.pushState = patchHistory('pushState', originalPushState)
    window.history.replaceState = patchHistory('replaceState', originalReplaceState)

    const onPopState = (event: PopStateEvent) => appendEvent('navigation', 'popstate', event.state)
    const onHashChange = () => appendEvent('navigation', 'hashchange', window.location.hash)
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      appendEvent('runtime', 'unhandledrejection', {
        reason: event.reason,
      })
    }
    const onError = (event: ErrorEvent) => {
      appendEvent('runtime', 'error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener('error', onError)

    return () => {
      window.fetch = originalFetch
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener('error', onError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadAuthData = async () => {
      appendEvent('auth', 'session_fetch_start')
      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' })
      const sessionJson = (await sessionResponse.json()) as SessionResponse
      setSessionData(sessionJson)
      appendEvent('auth', 'session_fetch_done', {
        status: sessionResponse.status,
        body: sessionJson,
      })

      appendEvent('auth', 'faceit_debug_fetch_start')
      const faceitResponse = await fetch('/api/auth/debug/faceit', { cache: 'no-store' })
      const faceitJson = await faceitResponse.json()
      setFaceitDebugData(faceitJson)
      appendEvent('auth', 'faceit_debug_fetch_done', {
        status: faceitResponse.status,
        body: faceitJson,
      })
    }

    loadAuthData().catch((error) => {
      appendEvent('auth', 'bootstrap_error', {
        error: error instanceof Error ? error.message : String(error),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cookieSnapshot = useMemo(() => {
    if (typeof document === 'undefined') return ''
    return document.cookie
  }, [events.length])

  return (
    <div className="min-h-screen bg-black text-green-300 p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="border border-green-500/40 p-4 rounded">
          <h1 className="text-xl font-bold">SYNTRA DEBUG MODE (POST-LOGIN)</h1>
          <p className="text-sm text-green-200/90 mt-1">
            UI stripped down. Capturing navigation, runtime errors, API calls, session state and FACEIT debug payload.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => appendEvent('manual', 'snapshot', { location: window.location.href, cookies: document.cookie })}
              className="px-3 py-1 border border-green-500/50 rounded hover:bg-green-900/30"
            >
              Add Snapshot Event
            </button>
            <button
              onClick={() => setEvents([])}
              className="px-3 py-1 border border-yellow-500/50 text-yellow-300 rounded hover:bg-yellow-900/20"
            >
              Clear Event Log
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1 border border-cyan-500/50 text-cyan-300 rounded hover:bg-cyan-900/20"
            >
              Open /dashboard
            </button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <article className="border border-green-500/30 rounded p-4 bg-black/40">
            <h2 className="font-semibold mb-2">Auth Session (/api/auth/session)</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">{safeJson(sessionData)}</pre>
          </article>

          <article className="border border-green-500/30 rounded p-4 bg-black/40">
            <h2 className="font-semibold mb-2">FACEIT Debug (/api/auth/debug/faceit)</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">{safeJson(faceitDebugData)}</pre>
          </article>
        </section>

        <section className="border border-green-500/30 rounded p-4 bg-black/40">
          <h2 className="font-semibold mb-2">Runtime Snapshot</h2>
          <pre className="text-xs whitespace-pre-wrap break-all">{safeJson({
            currentPath: typeof window !== 'undefined' ? window.location.pathname : null,
            query: Object.fromEntries(searchParams.entries()),
            cookies: cookieSnapshot,
            localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
            sessionStorageKeys: typeof window !== 'undefined' ? Object.keys(sessionStorage) : [],
            eventsCaptured: events.length,
          })}</pre>
        </section>

        <section className="border border-green-500/30 rounded p-4 bg-black/40">
          <h2 className="font-semibold mb-2">Event Stream ({events.length})</h2>
          <div className="max-h-[50vh] overflow-auto space-y-2 pr-2">
            {events.map((event) => (
              <div key={event.id} className="border border-green-500/20 rounded p-2">
                <div className="text-[11px] text-green-200">
                  #{event.id} · {event.at} · {event.source}/{event.type}
                </div>
                <pre className="text-xs mt-1 whitespace-pre-wrap break-all">{safeJson(event.payload)}</pre>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-green-200/80">No events yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
