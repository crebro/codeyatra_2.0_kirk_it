"use client"

import { useState } from "react"
import Link from "next/link"

export default function VDFHeader({ fixed = true }: { fixed?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className={`${fixed ? 'fixed' : ''} top-0 left-0 right-0 z-50 bg-[#FFF8EA]/90 backdrop-blur-md`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-xl font-bold text-[#594545]">
            <img src="/vdf-logo.png" alt="Logo">
            </img>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="/#get-started" className="font-sans text-sm text-[#815B5B] transition-colors hover:text-[#594545]">
              Get Started
            </a>
            <Link href="/library" className="font-sans text-sm text-[#815B5B] transition-colors hover:text-[#594545]">
              Library
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/video"
            className="rounded-full bg-[#594545] px-6 py-2.5 font-sans text-sm font-bold text-[#FFF8EA] transition-all hover:bg-[#815B5B] shadow-lg active:scale-95"
          >
            Start Converting
          </Link>
        </div>


        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-[#594545] transition-transform ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-[#594545] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-[#594545] transition-transform ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-[#594545]/10 bg-[#FFF8EA] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#get-started" onClick={() => setMobileOpen(false)} className="font-sans text-sm text-[#815B5B]">Get Started</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="font-sans text-sm text-[#815B5B]">Pricing</a>
            <Link href="/auth/login" className="mt-2 w-full rounded-full border border-[#594545]/15 bg-[#FFF8EA] px-5 py-2 text-center font-sans text-sm font-medium text-[#594545]">
              Log in
            </Link>
            <Link href="/auth/sign-up" className="w-full rounded-full bg-[#594545] px-5 py-2 text-center font-sans text-sm font-medium text-[#FFF8EA]">
              Sign up
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
