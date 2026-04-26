'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SyntraLogo } from './logo'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07070F]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        {/* Logo */}
        <SyntraLogo iconSize={36} />

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-white/55 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth"
            className="text-white/65 hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all duration-200 glow-violet-sm hover:glow-violet"
          >
            Connect FACEIT
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          className="md:hidden text-white/70 hover:text-white p-2"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0C0C1B]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-white/70 hover:text-white text-base font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/8">
            <Link href="/auth" className="text-center text-white/70 text-sm py-2.5 border border-white/10 rounded-xl">
              Sign In
            </Link>
            <Link href="/auth" className="text-center text-white text-sm font-semibold py-2.5 bg-violet-600 rounded-xl">
              Connect FACEIT
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
