"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gauge, Swords, Upload, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

const MOBILE_NAV = [
  { label: "Dashboard", icon: Gauge,    href: "/dashboard" },
  { label: "Matches",   icon: Swords,   href: "/matches" },
  { label: "Upload",    icon: Upload,   href: "/upload" },
  { label: "Reports",   icon: FileText, href: "/analytics" },
  { label: "Profile",   icon: User,     href: "/profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 lg:hidden"
      style={{
        background: "rgba(8,8,14,0.95)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {MOBILE_NAV.map(({ label, icon: Icon, href }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-1.5 transition-all"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                active ? "scale-110" : "",
              )}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, rgba(124,58,237,0.30) 0%, rgba(34,211,238,0.12) 100%)",
                      boxShadow: "0 0 12px rgba(124,58,237,0.35)",
                    }
                  : { background: "transparent" }
              }
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", active ? "text-violet-400" : "text-zinc-500")}
                strokeWidth={active ? 2 : 1.8}
              />
            </div>
            <span
              className={cn("text-[10px] font-semibold transition-colors", active ? "text-violet-400" : "text-zinc-600")}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
