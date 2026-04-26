import { AppSidebar } from "@/components/app/sidebar"
import { MobileNav } from "@/components/app/mobile-nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#05050A]">
      {/* Desktop sidebar — hidden on mobile via lg:flex inside component */}
      <AppSidebar />

      {/* Main content — offset by sidebar on desktop, full width on mobile */}
      <main className="flex-1 lg:ml-[268px] min-h-screen overflow-x-hidden pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop via lg:hidden inside component */}
      <MobileNav />
    </div>
  )
}
