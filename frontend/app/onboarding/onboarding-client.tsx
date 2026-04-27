'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type DebugEvent = {
  id: number
  at: string
  channel: string
  event: string
  data?: unknown
}

type SessionResponse = {
  authenticated?: boolean
  user?: {
    provider?: string | null
    nickname?: string | null
    avatar?: string | null
  }
}

type FaceitDebugResponse = {
  has_faceit_callback_debug_cookie?: boolean
  faceit_callback_payload?: unknown
} & Record<string, unknown>

const MAX_EVENTS = 2000
const MAX_BODY_PREVIEW = 4000

function timestamp() {
  return new Date().toISOString()
}

function stringify(data: unknown) {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return '[unserializable]'
  }
}

function truncate(text: string, max = MAX_BODY_PREVIEW) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}\n... [truncated ${text.length - max} chars]`
}

function parseMaybeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function readRequestBody(input: RequestInfo | URL, init?: RequestInit) {
  const bodyFromInit = init?.body

  if (bodyFromInit == null && typeof input !== 'string' && !(input instanceof URL) && input.body) {
    try {
      const clone = input.clone()
      return await clone.text()
    } catch {
      return '[unable to read request body from Request]'
    }
  }

  if (typeof bodyFromInit === 'string') return bodyFromInit
  if (bodyFromInit instanceof URLSearchParams) return bodyFromInit.toString()
  if (bodyFromInit instanceof FormData) {
    const entries: Array<{ key: string; value: string }> = []
    bodyFromInit.forEach((value, key) => {
      entries.push({ key, value: typeof value === 'string' ? value : `[File:${value.name}]` })
    })
    return stringify(entries)
  }
  if (bodyFromInit instanceof Blob) {
    return `[Blob size=${bodyFromInit.size} type=${bodyFromInit.type}]`
  }

  if (bodyFromInit == null) return null
  return `[unsupported body type: ${Object.prototype.toString.call(bodyFromInit)}]`
}

async function readResponseBody(response: Response) {
  try {
    const contentType = response.headers.get('content-type') ?? ''
    const bodyText = await response.clone().text()
    const parsed = contentType.includes('application/json') ? parseMaybeJson(bodyText) : bodyText
    return { preview: truncate(typeof parsed === 'string' ? parsed : stringify(parsed)), contentType }
  } catch {
    return { preview: '[unable to read response body]', contentType: response.headers.get('content-type') ?? '' }
  }
}

export default function OnboardingClient({ initialStep }: { initialStep?: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<DebugEvent[]>([])
  const [sessionPayload, setSessionPayload] = useState<SessionResponse | null>(null)
  const [faceitPayload, setFaceitPayload] = useState<FaceitDebugResponse | null>(null)
  const [filter, setFilter] = useState('')
  const [showAutoScroll, setShowAutoScroll] = useState(true)

  const eventIdRef = useRef(1)
  const logContainerRef = useRef<HTMLDivElement | null>(null)

  const pushEvent = (channel: string, event: string, data?: unknown) => {
    const id = eventIdRef.current++
    const item: DebugEvent = { id, at: timestamp(), channel, event, data }

    setEvents((prev) => {
      const merged = [...prev, item]
      return merged.slice(Math.max(0, merged.length - MAX_EVENTS))
    })
  }

  useEffect(() => {
    if (!showAutoScroll) return
    const container = logContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [events, showAutoScroll])

  useEffect(() => {
    pushEvent('system', 'debug_boot', {
      note: 'Onboarding UI replaced with debug cockpit',
      initialStep: initialStep ?? null,
      path: window.location.pathname,
      query: Object.fromEntries(searchParams.entries()),
      ua: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)
    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage)
    const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage)
    const originalClear = window.localStorage.clear.bind(window.localStorage)
    const originalSessionSetItem = window.sessionStorage.setItem.bind(window.sessionStorage)
    const originalSessionRemoveItem = window.sessionStorage.removeItem.bind(window.sessionStorage)
    const originalSessionClear = window.sessionStorage.clear.bind(window.sessionStorage)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const method = init?.method ?? (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')
      const startedAt = performance.now()
      const bodyPreview = await readRequestBody(input, init)

      pushEvent('network', 'fetch_request', {
        url,
        method,
        mode: init?.mode ?? null,
        credentials: init?.credentials ?? null,
        cache: init?.cache ?? null,
        headers: init?.headers ?? null,
        bodyPreview: bodyPreview ? truncate(bodyPreview) : null,
      })

      try {
        const response = await originalFetch(input, init)
        const elapsedMs = Math.round(performance.now() - startedAt)
        const body = await readResponseBody(response)

        pushEvent('network', 'fetch_response', {
          url,
          status: response.status,
          ok: response.ok,
          elapsedMs,
          contentType: body.contentType,
          bodyPreview: body.preview,
        })

        return response
      } catch (error) {
        pushEvent('network', 'fetch_error', {
          url,
          method,
          error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
        })
        throw error
      }
    }

    const patchHistory = (kind: 'pushState' | 'replaceState', fn: History['pushState']) => {
      return function patched(this: History, ...args: Parameters<History['pushState']>) {
        pushEvent('navigation', kind, {
          state: args[0],
          title: args[1],
          url: args[2] ? String(args[2]) : null,
        })
        return fn.apply(this, args)
      }
    }

    window.history.pushState = patchHistory('pushState', originalPushState)
    window.history.replaceState = patchHistory('replaceState', originalReplaceState)

    window.localStorage.setItem = (key: string, value: string) => {
      pushEvent('storage', 'localStorage.setItem', { key, valuePreview: truncate(value, 500) })
      return originalSetItem(key, value)
    }
    window.localStorage.removeItem = (key: string) => {
      pushEvent('storage', 'localStorage.removeItem', { key })
      return originalRemoveItem(key)
    }
    window.localStorage.clear = () => {
      pushEvent('storage', 'localStorage.clear')
      return originalClear()
    }

    window.sessionStorage.setItem = (key: string, value: string) => {
      pushEvent('storage', 'sessionStorage.setItem', { key, valuePreview: truncate(value, 500) })
      return originalSessionSetItem(key, value)
    }
    window.sessionStorage.removeItem = (key: string) => {
      pushEvent('storage', 'sessionStorage.removeItem', { key })
      return originalSessionRemoveItem(key)
    }
    window.sessionStorage.clear = () => {
      pushEvent('storage', 'sessionStorage.clear')
      return originalSessionClear()
    }

    const onPopState = (event: PopStateEvent) => pushEvent('navigation', 'popstate', event.state)
    const onHashChange = () => pushEvent('navigation', 'hashchange', { hash: window.location.hash })
    const onUnhandledRejection = (event: PromiseRejectionEvent) =>
      pushEvent('runtime', 'unhandledrejection', { reason: event.reason })
    const onRuntimeError = (event: ErrorEvent) =>
      pushEvent('runtime', 'error', {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    const onMessage = (event: MessageEvent) =>
      pushEvent('window', 'message', {
        origin: event.origin,
        data: event.data,
      })

    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener('error', onRuntimeError)
    window.addEventListener('message', onMessage)

    return () => {
      window.fetch = originalFetch
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState

      window.localStorage.setItem = originalSetItem
      window.localStorage.removeItem = originalRemoveItem
      window.localStorage.clear = originalClear
      window.sessionStorage.setItem = originalSessionSetItem
      window.sessionStorage.removeItem = originalSessionRemoveItem
      window.sessionStorage.clear = originalSessionClear

      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener('error', onRuntimeError)
      window.removeEventListener('message', onMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadPostLoginDebugData = async () => {
      pushEvent('auth', 'session_fetch_start')
      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' })
      const sessionJson = (await sessionResponse.json()) as SessionResponse
      setSessionPayload(sessionJson)
      pushEvent('auth', 'session_fetch_done', {
        status: sessionResponse.status,
        body: sessionJson,
      })

      pushEvent('auth', 'faceit_debug_fetch_start')
      const faceitResponse = await fetch('/api/auth/debug/faceit', { cache: 'no-store' })
      const faceitJson = (await faceitResponse.json()) as FaceitDebugResponse
      setFaceitPayload(faceitJson)
      pushEvent('auth', 'faceit_debug_fetch_done', {
        status: faceitResponse.status,
        body: faceitJson,
      })
    }

    loadPostLoginDebugData().catch((error) => {
      pushEvent('auth', 'bootstrap_failure', {
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runtimeSnapshot = useMemo(
    () => ({
      href: typeof window !== 'undefined' ? window.location.href : null,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      query: Object.fromEntries(searchParams.entries()),
      cookies: typeof document !== 'undefined' ? document.cookie : null,
      localStorageKeys: typeof window !== 'undefined' ? Object.keys(window.localStorage) : [],
      sessionStorageKeys: typeof window !== 'undefined' ? Object.keys(window.sessionStorage) : [],
      eventsCaptured: events.length,
      authenticated: sessionPayload?.authenticated ?? null,
    }),
    [events.length, searchParams, sessionPayload?.authenticated],
  )

  const filteredEvents = useMemo(() => {
    const keyword = filter.trim().toLowerCase()
    if (!keyword) return events

    return events.filter((item) => {
      const inMeta = `${item.channel} ${item.event}`.toLowerCase().includes(keyword)
      const inPayload = stringify(item.data).toLowerCase().includes(keyword)
      return inMeta || inPayload
    })
  }, [events, filter])

  return (
    <div className="min-h-screen bg-black text-green-300 font-mono px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="border border-green-500/40 rounded p-4 bg-black/50">
          <h1 className="text-xl font-bold">SYNTRA ONBOARDING DEBUG COCKPIT</h1>
          <p className="text-sm text-green-200/90 mt-1">
            Зрізаний фронт. Тут ти бачиш post-login auth/onboarding рух: запити, відповіді, навігацію, помилки, storage і payload-и.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => pushEvent('manual', 'snapshot', runtimeSnapshot)}
              className="px-3 py-1 rounded border border-green-500/50 hover:bg-green-950/40"
            >
              Snapshot
            </button>
            <button
              onClick={() => setEvents([])}
              className="px-3 py-1 rounded border border-yellow-500/60 text-yellow-300 hover:bg-yellow-950/20"
            >
              Clear log
            </button>
            <button
              onClick={() => {
                navigator.clipboard
                  .writeText(stringify(events))
                  .then(() => pushEvent('manual', 'copied_events_to_clipboard', { count: events.length }))
                  .catch((error) =>
                    pushEvent('manual', 'copy_failed', {
                      error: error instanceof Error ? error.message : String(error),
                    }),
                  )
              }}
              className="px-3 py-1 rounded border border-cyan-500/60 text-cyan-300 hover:bg-cyan-950/20"
            >
              Copy events JSON
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1 rounded border border-purple-500/60 text-purple-300 hover:bg-purple-950/20"
            >
              Go /dashboard
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <article className="border border-green-500/30 rounded p-4 bg-black/40">
            <h2 className="font-semibold mb-2">/api/auth/session</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">{stringify(sessionPayload)}</pre>
          </article>
          <article className="border border-green-500/30 rounded p-4 bg-black/40">
            <h2 className="font-semibold mb-2">/api/auth/debug/faceit</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">{stringify(faceitPayload)}</pre>
          </article>
          <article className="border border-cyan-500/40 rounded p-4 bg-black/40">
            <h2 className="font-semibold mb-2 text-cyan-300">FACEIT callback payload</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">
              {stringify(faceitPayload?.faceit_callback_payload ?? null)}
            </pre>
          </article>
        </section>

        <section className="border border-green-500/30 rounded p-4 bg-black/40">
          <h2 className="font-semibold mb-2">Runtime snapshot</h2>
          <pre className="text-xs whitespace-pre-wrap break-all">{stringify(runtimeSnapshot)}</pre>
        </section>

        <section className="border border-green-500/30 rounded p-4 bg-black/40">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="font-semibold mr-2">Event stream ({filteredEvents.length}/{events.length})</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="filter: fetch_response / error / auth..."
              className="bg-black border border-green-500/40 rounded px-2 py-1 text-xs min-w-[240px]"
            />
            <label className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={showAutoScroll}
                onChange={(e) => setShowAutoScroll(e.target.checked)}
              />
              auto-scroll
            </label>
          </div>

          <div ref={logContainerRef} className="max-h-[55vh] overflow-auto space-y-2 pr-1">
            {filteredEvents.map((item) => (
              <div key={item.id} className="border border-green-500/20 rounded p-2">
                <div className="text-[11px] text-green-200">
                  #{item.id} · {item.at} · {item.channel}/{item.event}
                </div>
                <pre className="text-xs mt-1 whitespace-pre-wrap break-all">{stringify(item.data)}</pre>
              </div>
            ))}
            {filteredEvents.length === 0 && <div className="text-sm text-green-200/80">No events for current filter.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}
