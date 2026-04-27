export type DemoJobStatus = "pending" | "processing" | "completed" | "failed"

export interface DemoJobPayload {
  job_id: string
  status: DemoJobStatus
  error_message?: string
  result?: {
    analysis?: {
      radar?: {
        total_sampled_frames?: number
      }
      metrics?: {
        map?: string
        rounds?: number
      }
    }
  }
}

export interface DemoReportPayload {
  job_id: string
  report: {
    map?: string
    rounds?: number
    score?: {
      ct?: number
      t?: number
      result?: string
    }
    player_stats?: {
      player?: string
      kills?: number
      deaths?: number
      kd?: number
      adr?: number
      hs_percent?: number
    }
    round_timeline?: Array<{ round: number }>
  }
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function uploadDemoFile(demoFile: File, sampleEvery = 8): Promise<DemoJobPayload> {
  const formData = new FormData()
  formData.append("demo", demoFile)
  formData.append("sample_every", String(sampleEvery))

  const res = await fetch(`${API_BASE}/api/demos/upload/`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Upload failed: ${res.status}`)
  }

  return res.json() as Promise<DemoJobPayload>
}

export function getDemoJob(jobId: string): Promise<DemoJobPayload> {
  return request<DemoJobPayload>(`/api/demos/jobs/${jobId}/`)
}

export function getDemoReport(jobId: string): Promise<DemoReportPayload> {
  return request<DemoReportPayload>(`/api/demos/jobs/${jobId}/report/`)
}
