"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "overview",  label: "Overview" },
  { id: "rounds",    label: "Rounds" },
  { id: "heatmap",   label: "Heatmap" },
  { id: "duels",     label: "Duels" },
  { id: "utility",   label: "Utility" },
  { id: "economy",   label: "Economy" },
  { id: "mistakes",  label: "Mistakes" },
  { id: "training",  label: "Training" },
] as const

export function ReportNav() {
  const [active, setActive] = useState("overview")

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 150

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const section = document.getElementById(NAV_ITEMS[i].id)
        if (section && section.offsetTop <= scrollY) {
          setActive(NAV_ITEMS[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.offsetTop - 100
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <div
      className="sticky top-0 z-40 -mx-7 px-7 py-3 mb-5"
      style={{
        background: "rgba(5,5,10,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              active === item.id
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            style={
              active === item.id
                ? {
                    background: "rgba(124,58,237,0.25)",
                    border: "1px solid rgba(124,58,237,0.35)",
                    boxShadow: "0 0 12px rgba(124,58,237,0.15)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
