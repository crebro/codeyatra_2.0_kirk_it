"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react"

/* ── Stub data (replace with real API) ──────────────────────── */

interface Slide {
  id: string
  index: number
  timestamp: string
  imageUrl: string
  title: string
  description: string
}

async function fetchSlides(_videoUrl: string): Promise<Slide[]> {
  await new Promise((r) => setTimeout(r, 100))
  return [
    {
      id: "s1",
      index: 1,
      timestamp: "0:42",
      imageUrl: "/study-tile-1.jpg",
      title: "Introduction to Calculus",
      description:
        "The instructor introduces the fundamental concepts of calculus, beginning with the definition of limits. The whiteboard shows the formal epsilon-delta definition, and the speaker emphasizes how limits form the foundation for both derivatives and integrals. Key notation is introduced for subsequent sections.",
    },
    {
      id: "s2",
      index: 2,
      timestamp: "2:34",
      imageUrl: "/study-tile-3.jpg",
      title: "Cell Biology Overview",
      description:
        "This slide provides a labeled diagram of a eukaryotic cell, identifying the nucleus, mitochondria, endoplasmic reticulum, and Golgi apparatus. The instructor explains how each organelle contributes to cellular function, with particular focus on the role of mitochondria in ATP synthesis through oxidative phosphorylation.",
    },
    {
      id: "s3",
      index: 3,
      timestamp: "5:11",
      imageUrl: "/study-tile-4.jpg",
      title: "Newton's Laws of Motion",
      description:
        "The lecture dives into Newton's second law, F = ma, using free-body diagrams to illustrate force vectors acting on an object on an inclined plane. The instructor walks through the decomposition of gravitational force into parallel and perpendicular components, setting up the equations of motion for a frictionless surface.",
    },
    {
      id: "s4",
      index: 4,
      timestamp: "8:07",
      imageUrl: "/study-tile-2.jpg",
      title: "Binary Search in Python",
      description:
        "A Python implementation of recursive binary search is presented. The instructor explains how the algorithm halves the search space at each step, achieving O(log n) time complexity. Edge cases such as empty arrays and single-element arrays are discussed, along with the choice between iterative and recursive approaches.",
    },
    {
      id: "s5",
      index: 5,
      timestamp: "11:23",
      imageUrl: "/study-tile-5.jpg",
      title: "Molecular Orbital Theory",
      description:
        "This segment covers sp3 hybridization in methane (CH4). The molecular orbital diagram shows how one 2s and three 2p orbitals combine to form four equivalent sp3 hybrid orbitals. The tetrahedral geometry and 109.5-degree bond angles are explained, connecting orbital theory to observed molecular shapes.",
    },
    {
      id: "s6",
      index: 6,
      timestamp: "14:55",
      imageUrl: "/frame-placeholder.jpg",
      title: "Summary & Key Takeaways",
      description:
        "The final slide summarizes all the major equations and concepts covered in the lecture. Boundary conditions are clearly labeled, and the instructor provides a unified view tying together the calculus, physics, and chemistry topics. Suggested practice problems and reading assignments are listed for further study.",
    },
  ]
}

/* ── Loading screen ─────────────────────────────────────────── */

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF8EA]">
      {/* Pulsing icon */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-2xl bg-[#815B5B] flex items-center justify-center">
          <FileText className="h-8 w-8 text-[#FFF8EA]" />
        </div>
        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-2xl bg-[#815B5B]/20" />
      </div>

      <h2 className="font-serif text-2xl font-bold text-[#594545] mb-2">
        Extracting frames
      </h2>
      <p className="font-sans text-sm text-[#9E7676] mb-8 text-center max-w-xs">
        Analyzing video content and generating slide descriptions...
      </p>

      {/* Progress bar */}
      <div className="w-64 h-1.5 rounded-full bg-[#594545]/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#815B5B] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="mt-3 font-sans text-xs text-[#9E7676]">
        {progress}%
      </span>
    </div>
  )
}

/* ── Main viewer ────────────────────────────────────────────── */

export default function ExtractViewer({
  videoUrl,
}: {
  videoUrl: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  /* Simulated loading progress */
  useEffect(() => {
    let cancelled = false

    const steps = [12, 28, 45, 61, 78, 90, 100]
    let i = 0

    const tick = () => {
      if (cancelled) return
      if (i < steps.length) {
        setProgress(steps[i])
        i++
        setTimeout(tick, 500 + Math.random() * 300)
      }
    }
    tick()

    /* Fetch slides in parallel */
    fetchSlides(videoUrl).then((data) => {
      if (!cancelled) {
        setSlides(data)
      }
    })

    return () => {
      cancelled = true
    }
  }, [videoUrl])

  /* When progress hits 100 dismiss the loading screen */
  useEffect(() => {
    if (progress === 100 && slides.length > 0) {
      const t = setTimeout(() => setLoading(false), 400)
      return () => clearTimeout(t)
    }
  }, [progress, slides])

  const activeSlide = slides[activeIndex]

  const goToPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1))
  }, [])

  const goToNext = useCallback(() => {
    setActiveIndex((i) => Math.min(slides.length - 1, i + 1))
  }, [slides.length])

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goToPrev()
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goToNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [goToPrev, goToNext])

  /* ── Loading state ───── */
  if (loading) {
    return <LoadingScreen progress={progress} />
  }

  /* ── Viewer ──────────── */
  return (
    <div className="fixed inset-0 flex flex-col bg-[#FFF8EA]">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-[#594545]/10 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-sm text-[#815B5B] transition-colors hover:bg-[#FFF0D6] hover:text-[#594545]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="hidden sm:block h-5 w-px bg-[#594545]/10" />
          <img src="https://i.imgur.com/3HcwFNF.png" alt="Logo" className="hidden sm:block h-6" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-[#9E7676]">
            {slides.length} slides
          </span>
          <button className="flex items-center gap-1.5 rounded-full bg-[#815B5B] px-4 py-2 font-sans text-xs font-medium text-[#FFF8EA] transition-colors hover:bg-[#594545]">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Main 3-col layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Slide thumbnails ── */}
        <aside className="hidden md:flex w-48 lg:w-56 flex-col border-r border-[#594545]/10 bg-[#FFF8EA]">
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveIndex(i)}
                className={`group flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors ${
                  i === activeIndex
                    ? "bg-[#815B5B]/10"
                    : "hover:bg-[#FFF0D6]"
                }`}
              >
                <span
                  className={`mt-1 shrink-0 font-sans text-[11px] font-medium tabular-nums ${
                    i === activeIndex
                      ? "text-[#815B5B]"
                      : "text-[#9E7676]/60"
                  }`}
                >
                  {slide.index}
                </span>
                <div
                  className={`relative w-full overflow-hidden rounded border-2 transition-colors ${
                    i === activeIndex
                      ? "border-[#815B5B]"
                      : "border-transparent group-hover:border-[#9E7676]/30"
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${slide.index}`}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 rounded-tl bg-[#594545]/70 px-1 py-0.5">
                    <span className="font-sans text-[9px] text-[#FFF8EA]">
                      {slide.timestamp}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Center: Slide preview ── */}
        <div className="flex flex-1 flex-col items-center justify-center bg-[#F5EDD8]/50 px-4 py-6 relative">
          {activeSlide && (
            <>
              {/* Navigation arrows */}
              <button
                onClick={goToPrev}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF8EA] text-[#594545] shadow-md transition-colors hover:bg-[#FFF0D6] disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={activeIndex === slides.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF8EA] text-[#594545] shadow-md transition-colors hover:bg-[#FFF0D6] disabled:opacity-30 disabled:cursor-not-allowed md:right-3"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* The slide */}
              <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-[#FFF8EA] shadow-[0_4px_24px_rgba(89,69,69,0.10)]">
                <img
                  src={activeSlide.imageUrl}
                  alt={`Slide ${activeSlide.index}: ${activeSlide.title}`}
                  className="w-full object-contain"
                />
              </div>

              {/* Slide counter */}
              <div className="mt-4 flex items-center gap-3">
                <span className="font-sans text-xs text-[#9E7676]">
                  Slide {activeSlide.index} of {slides.length}
                </span>
                <span className="font-sans text-xs text-[#9E7676]/50">|</span>
                <span className="font-sans text-xs text-[#9E7676]">
                  {activeSlide.timestamp}
                </span>
              </div>
            </>
          )}

          {/* Mobile slide picker */}
          <div className="mt-4 flex gap-1.5 md:hidden overflow-x-auto pb-2 max-w-full px-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-14 overflow-hidden rounded border-2 transition-colors ${
                  i === activeIndex
                    ? "border-[#815B5B]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={`Slide ${slide.index}`}
                  className="aspect-video w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Description panel ── */}
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-[#594545]/10 bg-[#FFF8EA]">
          {activeSlide && (
            <div className="flex-1 overflow-y-auto p-5">
              {/* Slide label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block rounded bg-[#815B5B]/10 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#815B5B]">
                  Slide {activeSlide.index}
                </span>
                <span className="font-sans text-[10px] text-[#9E7676]">
                  {activeSlide.timestamp}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-lg font-bold text-[#594545] leading-snug text-balance">
                {activeSlide.title}
              </h3>

              <div className="mt-4 h-px w-full bg-[#594545]/8" />

              <div className="mt-4">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[#9E7676] mb-2">
                  Description
                </p>
                <p className="font-sans text-sm leading-relaxed text-[#815B5B]">
                  {activeSlide.description}
                </p>
              </div>

              <div className="mt-6 h-px w-full bg-[#594545]/8" />

              {/* Attribution */}
              <div className="mt-4 flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5 text-[#9E7676]/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                </svg>
                <span className="font-sans text-[10px] text-[#9E7676]/50">
                  Summarized by Gemini
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Mobile description drawer (below slide on small screens) ── */}
      {activeSlide && (
        <div className="block lg:hidden border-t border-[#594545]/10 bg-[#FFF8EA] px-5 py-4 overflow-y-auto max-h-48">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block rounded bg-[#815B5B]/10 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#815B5B]">
              Slide {activeSlide.index}
            </span>
            <h3 className="font-serif text-sm font-bold text-[#594545]">
              {activeSlide.title}
            </h3>
          </div>
          <p className="font-sans text-xs leading-relaxed text-[#815B5B]">
            {activeSlide.description}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <svg
              className="h-3 w-3 text-[#9E7676]/50"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            <span className="font-sans text-[10px] text-[#9E7676]/50">
              Summarized by Gemini
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
