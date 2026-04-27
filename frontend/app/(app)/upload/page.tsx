"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Upload, File, X, AlertTriangle, CheckCircle2,
  ChevronDown, Info, Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MAPS = ["Mirage", "Dust2", "Inferno", "Nuke", "Ancient", "Anubis", "Vertigo", "Overpass", "Cache"]
const SOURCES = ["FACEIT", "Steam", "ESEA", "Other"]
const DEMO_API_BASE = process.env.NEXT_PUBLIC_DEMO_API_BASE_URL ?? ""

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function UploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [map, setMap] = useState("Mirage")
  const [source, setSource] = useState("FACEIT")
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const ACCEPTED_EXTS = [".dem", ".dem.gz"]
  const MAX_BYTES = 500 * 1024 * 1024 // 500 MB

  const validateFile = (f: File) => {
    const name = f.name.toLowerCase()
    if (!ACCEPTED_EXTS.some((ext) => name.endsWith(ext))) {
      return "Invalid file type. Only .dem and .dem.gz are supported."
    }
    if (f.size > MAX_BYTES) {
      return "File exceeds the 500 MB limit."
    }
    return null
  }

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      setFile(null)
    } else {
      setFileError(null)
      setFile(f)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile],
  )

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setFileError(null)

    // optimistic progress while request is in-flight
    let progress = 0
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 12, 94)
      setUploadProgress(Math.round(progress))
    }, 180)

    const formData = new FormData()
    formData.append("demo", file)

    try {
      const response = await fetch(`${DEMO_API_BASE}/api/demos/upload/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? "Upload failed.")
      }

      const payload = await response.json() as { job_id?: string }
      if (!payload.job_id) {
        throw new Error("Upload succeeded but no job id was returned.")
      }

      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => router.push(`/processing/${payload.job_id}`), 350)
    } catch (error) {
      clearInterval(interval)
      setUploading(false)
      setUploadProgress(0)
      setFileError(error instanceof Error ? error.message : "Failed to upload demo.")
    }
  }

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Upload Demo</h1>
          <p className="text-sm text-zinc-500 mt-1">Analyze a CS2 demo manually — no FACEIT required</p>
        </div>

        {/* Usage notice */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}
        >
          <Info className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.8} />
          <p className="text-xs text-amber-300">
            You have used <span className="font-bold">2 / 3</span> free demo analyses this month.{" "}
            <a href="/checkout?plan=pro" className="underline text-amber-200 hover:text-white">Upgrade to Pro</a> for 50/month.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-3xl transition-all duration-200 cursor-pointer mb-5",
            file ? "py-6" : "py-16",
            dragging ? "scale-[1.01]" : "",
          )}
          style={{
            background: dragging
              ? "rgba(124,58,237,0.10)"
              : file
              ? "rgba(34,197,94,0.05)"
              : "rgba(255,255,255,0.025)",
            border: dragging
              ? "2px dashed rgba(124,58,237,0.6)"
              : file
              ? "2px solid rgba(34,197,94,0.25)"
              : "2px dashed rgba(255,255,255,0.12)",
            boxShadow: dragging ? "0 0 30px rgba(124,58,237,0.15)" : "none",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".dem,.dem.gz"
            className="sr-only"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />

          {!file ? (
            <>
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform"
                style={{
                  background: dragging ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Upload className={cn("h-7 w-7 transition-colors", dragging ? "text-violet-400" : "text-zinc-500")} strokeWidth={1.5} />
              </div>
              <p className="font-display text-base font-bold text-white mb-1">
                {dragging ? "Drop it here" : "Drag & drop your demo file"}
              </p>
              <p className="text-sm text-zinc-500 mb-4">or click to browse</p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                <span>Supported: .dem, .dem.gz</span>
                <span>·</span>
                <span>Max size: 500 MB</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 w-full px-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <File className="h-5 w-5 text-emerald-400" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(null) }}
                className="rounded-xl p-2 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* File error */}
        {fileError && (
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" /> {fileError}
          </div>
        )}

        {/* Optional Match Info */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h3 className="font-display text-sm font-bold text-white mb-4">Optional Match Info</h3>
          <div className="space-y-3">
            {/* Map */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Map</label>
              <div className="relative">
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm text-white outline-none cursor-pointer pr-9"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {MAPS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>
            {/* Source */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Source</label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm text-white outline-none cursor-pointer pr-9"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>
            {/* Notes */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Quarter-final, scrim with team, warmup mix..."
                rows={3}
                className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none leading-relaxed"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
        </div>

        {/* Upload button */}
        {!uploading ? (
          <button
            disabled={!file}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: file ? "0 0 24px rgba(124,58,237,0.4)" : "none",
            }}
          >
            <Zap className="h-4 w-4" strokeWidth={2} /> Start Analysis
          </button>
        ) : (
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white">
                {uploadProgress < 100 ? "Uploading demo..." : "Upload complete"}
              </p>
              <span className="text-sm font-bold text-violet-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${uploadProgress}%`,
                  background: "linear-gradient(90deg, #7C3AED, #22D3EE)",
                  boxShadow: "0 0 10px rgba(124,58,237,0.5)",
                }}
              />
            </div>
            {uploadProgress === 100 && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Redirecting to processing screen...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
