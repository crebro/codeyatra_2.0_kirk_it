"use client"

import { useEffect, useRef, useState } from "react"

export default function VDFHero() {
  const mosaicRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCTAClick = () => {
    const el = document.getElementById("get-started")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="grain-overlay relative w-full overflow-hidden px-6 pt-32 pb-16 md:px-12 md:pt-40 md:pb-24 lg:px-20 lg:pt-48 lg:pb-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#9E7676]">
              Study differently
            </p>

            <h1 className="font-serif text-5xl font-bold leading-[1.1] text-[#594545] md:text-6xl lg:text-7xl" style={{ textWrap: "balance" }}>
              Every video.
              <br />
              Every concept.
              <br/>
              <ul className="text-[#000000]">
                Captured.
              </ul>
              
            </h1>

            <p className="max-w-md font-sans text-lg leading-relaxed text-[#815B5B]">
              Turn lectures and tutorials into visual study guides.
            </p>

            <div>
              <button
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 rounded-full bg-[#594545] px-8 py-3.5 font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#815B5B] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#815B5B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8EA]"
              >
                {"Start Learning \u2192"}
              </button>
            </div>
          </div>

          {/* Right column - Asymmetric mosaic grid */}
          <div
            className="lg:col-span-6 relative hidden lg:block"
            ref={mosaicRef}
          >
            <div
              className="grid grid-cols-3 grid-rows-4 gap-3 h-[480px]"
              style={{ transform: `translateY(${scrollY * -0.06}px)` }}
            >
              {/* Tile 1 - tall left */}
              <div className="col-span-1 row-span-2 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full">
                  <img
                    src="/study-tile-1.jpg"
                    alt="Math lecture frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#9E7676]/20 mix-blend-multiply" />
                </div>
              </div>

              {/* Tile 2 - wide top */}
              <div className="col-span-2 row-span-1 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full">
                  <img
                    src="/study-tile-3.jpg"
                    alt="Biology lecture frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#9E7676]/15 mix-blend-multiply" />
                </div>
              </div>

              {/* Tile 3 - small square */}
              <div className="col-span-1 row-span-1 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full">
                  <img
                    src="/study-tile-4.jpg"
                    alt="Physics lecture frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#9E7676]/25 mix-blend-multiply" />
                </div>
              </div>

              {/* Tile 4 - medium */}
              <div className="col-span-1 row-span-2 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full">
                  <img
                    src="/study-tile-2.jpg"
                    alt="Coding tutorial frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#9E7676]/20 mix-blend-multiply" />
                </div>
              </div>

              {/* Tile 5 - wide bottom */}
              <div className="col-span-2 row-span-1 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full">
                  <img
                    src="/study-tile-5.jpg"
                    alt="Chemistry lecture frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#9E7676]/15 mix-blend-multiply" />
                </div>
              </div>

              {/* Tile 6 - remaining space */}
              <div className="col-span-1 row-span-1 overflow-hidden rounded-lg shadow-md">
                <div className="relative h-full w-full bg-[#9E7676]/10 flex items-center justify-center">
                  <div className="text-center px-3">
                    <p className="font-serif text-2xl font-bold text-[#594545]">+</p>
                    <p className="font-sans text-xs text-[#9E7676] mt-1">more frames</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mosaic - simplified */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-1.jpg" alt="Math lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#9E7676]/20 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-3.jpg" alt="Biology lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#9E7676]/15 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-4.jpg" alt="Physics lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#9E7676]/25 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-2.jpg" alt="Coding tutorial frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[#9E7676]/20 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 lg:mt-24">
          <div className="h-px w-full bg-[#9E7676]/20" />
          <div className="flex flex-col items-center justify-center gap-6 py-6 sm:flex-row sm:gap-12">
            <p className="font-sans text-sm text-[#9E7676]">{"10,000+ videos studied"}</p>
            <div className="hidden h-4 w-px bg-[#9E7676]/20 sm:block" />
            <p className="font-sans text-sm text-[#9E7676]">Frame-by-frame clarity</p>
            <div className="hidden h-4 w-px bg-[#9E7676]/20 sm:block" />
            <p className="font-sans text-sm text-[#9E7676]">Free to start</p>
          </div>
        </div>
      </div>
    </section>
  )
}
