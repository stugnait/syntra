'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseOpacity: number
  pulse: number
  pulseSpeed: number
}

// Normalized map contour polygons (abstract CS2-like tactical shapes)
const MAP_SHAPES = [
  { pts: [[0.06, 0.05], [0.20, 0.03], [0.24, 0.13], [0.21, 0.22], [0.08, 0.24], [0.04, 0.14]], o: 0.025 },
  { pts: [[0.38, 0.28], [0.52, 0.26], [0.55, 0.38], [0.50, 0.47], [0.35, 0.45], [0.32, 0.35]], o: 0.020 },
  { pts: [[0.72, 0.08], [0.86, 0.06], [0.90, 0.17], [0.87, 0.27], [0.73, 0.29], [0.68, 0.18]], o: 0.025 },
  { pts: [[0.12, 0.62], [0.30, 0.59], [0.34, 0.71], [0.28, 0.82], [0.11, 0.80], [0.07, 0.70]], o: 0.018 },
  { pts: [[0.58, 0.54], [0.76, 0.51], [0.80, 0.63], [0.74, 0.73], [0.56, 0.71], [0.52, 0.61]], o: 0.022 },
  { pts: [[0.44, 0.50], [0.55, 0.48], [0.57, 0.60], [0.52, 0.67], [0.41, 0.65], [0.39, 0.54]], o: 0.015 },
  { pts: [[0.82, 0.65], [0.94, 0.63], [0.96, 0.73], [0.92, 0.81], [0.80, 0.79], [0.78, 0.70]], o: 0.017 },
]

export function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initParticles = () => {
      particles.length = 0
      for (let i = 0; i < 75; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          size: Math.random() * 1.6 + 0.4,
          baseOpacity: Math.random() * 0.35 + 0.08,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.014 + 0.004,
        })
      }
    }

    const drawGrid = (w: number, h: number) => {
      const step = 64
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.038)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }
    }

    const drawContours = (w: number, h: number) => {
      MAP_SHAPES.forEach(({ pts, o }) => {
        ctx.beginPath()
        pts.forEach(([nx, ny], i) => {
          if (i === 0) ctx.moveTo(nx * w, ny * h)
          else ctx.lineTo(nx * w, ny * h)
        })
        ctx.closePath()
        ctx.strokeStyle = `rgba(124, 58, 237, ${o})`
        ctx.lineWidth = 0.8
        ctx.stroke()
        ctx.fillStyle = `rgba(124, 58, 237, ${o * 0.25})`
        ctx.fill()
      })
    }

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      drawGrid(w, h)
      drawContours(w, h)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        const o = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124, 58, 237, ${o})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    const handleResize = () => { resize(); initParticles() }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
