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
            <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-vdf-dusty-rose">
              Study differently
            </p>

            <h1 className="font-serif text-5xl font-bold leading-[1.1] text-vdf-deep-brown md:text-6xl lg:text-7xl" style={{ textWrap: "balance" }}>
              Study Different.
              <br />
              Study <span className="text-black"> Better. </span>
              <br />
            </h1>

            <p className="max-w-md font-sans text-lg leading-relaxed text-vdf-warm-mauve">
              Turn lectures and tutorials into visual study guides.
            </p>

            <div>
              <button
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 rounded-full bg-vdf-deep-brown px-8 py-3.5 font-sans text-sm font-medium text-vdf-cream transition-all hover:bg-vdf-warm-mauve hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vdf-warm-mauve focus-visible:ring-offset-2 focus-visible:ring-offset-vdf-cream"
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
                  <div className="absolute inset-0 bg-vdf-dusty-rose/20 mix-blend-multiply" />
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
                  <div className="absolute inset-0 bg-vdf-dusty-rose/15 mix-blend-multiply" />
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
                  <div className="absolute inset-0 bg-vdf-dusty-rose/25 mix-blend-multiply" />
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
                  <div className="absolute inset-0 bg-vdf-dusty-rose/20 mix-blend-multiply" />
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
                  <div className="absolute inset-0 bg-vdf-dusty-rose/15 mix-blend-multiply" />
                </div>
              </div>

            </div>
          </div>

          {/* Mobile mosaic - simplified */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-1.jpg" alt="Math lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-vdf-dusty-rose/20 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-3.jpg" alt="Biology lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-vdf-dusty-rose/15 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-4.jpg" alt="Physics lecture frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-vdf-dusty-rose/25 mix-blend-multiply" />
              </div>
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-md">
              <div className="relative h-full w-full">
                <img src="/study-tile-2.jpg" alt="Coding tutorial frame" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-vdf-dusty-rose/20 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
