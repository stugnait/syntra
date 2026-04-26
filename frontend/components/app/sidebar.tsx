"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Gauge, Swords, BarChart2, Map, Activity, Sparkles, Users,
  User, Settings, RefreshCw, Zap, CreditCard, Upload,
  Bell, HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Nav structure ─────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard",       icon: Gauge,    href: "/dashboard" },
      { label: "Matches",         icon: Swords,   href: "/matches" },
      { label: "Analytics",       icon: BarChart2, href: "/analytics" },
      { label: "Heatmaps",        icon: Map,       href: "/heatmaps" },
      { label: "Progress",        icon: Activity,  href: "/progress" },
      { label: "Recommendations", icon: Sparkles,  href: "/recommendations" },
      { label: "Compare",         icon: Users,     href: "/compare" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Upload Demo",     icon: Upload, href: "/upload" },
      { label: "Notifications",   icon: Bell,   href: "/notifications", badge: 3 },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile",  icon: User,       href: "/profile" },
      { label: "Billing",  icon: CreditCard, href: "/billing" },
      { label: "Settings", icon: Settings,   href: "/settings" },
      { label: "Support",  icon: HelpCircle, href: "/support" },
    ],
  },
]

// ── Nav link ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
        active ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
      )}
      style={
        active
          ? {
              background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(34,211,238,0.10) 100%)",
              boxShadow: "0 0 0 1px rgba(124,58,237,0.30) inset",
            }
          : undefined
      }
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300",
        )}
        strokeWidth={1.8}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
          style={{ background: "#7C3AED", boxShadow: "0 0 6px rgba(124,58,237,0.6)" }}
        >
          {badge}
        </span>
      )}
      {active && !badge && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "#7C3AED", boxShadow: "0 0 6px #7C3AED" }}
        />
      )}
    </Link>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function AppSidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-[268px] flex-col"
      style={{
        background: "rgba(8, 8, 14, 0.9)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)",
            boxShadow: "0 0 18px rgba(124,58,237,0.45)",
          }}
        >
          <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold tracking-wide text-white leading-none">SYNTRA</p>
          <p className="text-[10px] text-zinc-500 tracking-widest uppercase leading-none mt-0.5">Tactical Intelligence</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3.5 mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 pt-2 border-t border-white/[0.06] space-y-2">
        {/* Upgrade nudge */}
        <Link
          href="/checkout?plan=pro&interval=monthly"
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.16) 0%, rgba(34,211,238,0.06) 100%)",
            border: "1px solid rgba(124,58,237,0.22)",
          }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            <Zap className="h-3.5 w-3.5 text-violet-400" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white leading-none">Upgrade to Pro</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Unlock heatmaps & AI coach</p>
          </div>
        </Link>

        {/* Sync status pill */}
        <Link
          href="/settings?tab=sync"
          className="rounded-2xl px-4 py-3 block hover:opacity-80 transition-opacity"
          style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-xs font-semibold text-emerald-400">Auto Sync Active</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <RefreshCw className="h-3 w-3" /> Next sync: 04:51
          </div>
        </Link>
      </div>
    </aside>
  )
}
