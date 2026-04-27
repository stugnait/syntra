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

export async function uploadDemoFile(
  demoFile: File,
  sampleEvery = 8,
  onProgress?: (percent: number) => void,
): Promise<DemoJobPayload> {
  const formData = new FormData()
  formData.append("demo", demoFile)
  formData.append("sample_every", String(sampleEvery))

  return new Promise<DemoJobPayload>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_BASE}/api/demos/upload/`)
    xhr.responseType = "json"

    xhr.upload.onloadstart = () => onProgress?.(1)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress?.(percent)
    }

    xhr.onerror = () => reject(new Error("Network error during demo upload"))

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        let fallbackText = ""
        if (typeof xhr.response === "string") {
          fallbackText = xhr.response
        } else if (xhr.response && typeof xhr.response === "object") {
          const errorMessage = (xhr.response as { error?: unknown }).error
          if (typeof errorMessage === "string") {
            fallbackText = errorMessage
          } else {
            fallbackText = JSON.stringify(xhr.response)
          }
        }

        reject(new Error(fallbackText || xhr.statusText || `Upload failed: ${xhr.status}`))
        return
      }

      const payload = xhr.response as DemoJobPayload | null
      if (!payload || !payload.job_id) {
        reject(new Error("Upload succeeded but response payload is invalid"))
        return
      }

      onProgress?.(100)
      resolve(payload)
    }

    xhr.send(formData)
  })
}

export function getDemoJob(jobId: string): Promise<DemoJobPayload> {
  return request<DemoJobPayload>(`/api/demos/jobs/${jobId}/`)
}

export function getDemoReport(jobId: string): Promise<DemoReportPayload> {
  return request<DemoReportPayload>(`/api/demos/jobs/${jobId}/report/`)
}
