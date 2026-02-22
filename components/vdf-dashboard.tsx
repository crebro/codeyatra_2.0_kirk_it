"use client"

// API integration points: fetchFrames, fetchExplanation
// Backend dev will replace stubs with real API endpoints

import { useState } from "react"
import { ChevronDown, Lock } from "lucide-react"

// Async stub: fetchFrames(youtubeUrl) -> array of { frameId, timestamp, imageUrl }
export async function fetchFrames(youtubeUrl: string): Promise<
  Array<{ frameId: string; timestamp: string; imageUrl: string }>
> {
  // Simulated delay
  await new Promise((r) => setTimeout(r, 2000))
  return [
    { frameId: "f1", timestamp: "0:42", imageUrl: "/study-tile-1.jpg" },
    { frameId: "f2", timestamp: "2:34", imageUrl: "/study-tile-3.jpg" },
    { frameId: "f3", timestamp: "5:11", imageUrl: "/study-tile-4.jpg" },
    { frameId: "f4", timestamp: "8:07", imageUrl: "/study-tile-2.jpg" },
    { frameId: "f5", timestamp: "11:23", imageUrl: "/study-tile-5.jpg" },
    { frameId: "f6", timestamp: "14:55", imageUrl: "/frame-placeholder.jpg" },
  ]
}

// Async stub: fetchExplanation(frameId) -> { summary: string }
export async function fetchExplanation(frameId: string): Promise<{ summary: string }> {
  await new Promise((r) => setTimeout(r, 500))
  const explanations: Record<string, string> = {
    f1: "This frame shows the fundamental theorem of calculus being derived step by step, connecting differentiation and integration through the area function.",
    f2: "A detailed cell biology diagram labels the organelles and their functions, focusing on mitochondria and the electron transport chain.",
    f3: "The force diagram illustrates Newton's second law with vectors showing net force, mass, and acceleration in a frictionless environment.",
    f4: "This code snippet demonstrates a recursive binary search implementation in Python, with O(log n) time complexity analysis.",
    f5: "The molecular orbital diagram shows sp3 hybridization in methane, explaining the tetrahedral geometry and bond angles.",
    f6: "A summary equation ties together the previous derivations, presenting the final formula with boundary conditions clearly labeled.",
  }
  return { summary: explanations[frameId] || "Explanation content for this frame." }
}

type FilterTab = "All" | "Key Moments" | "Chapter Breaks"
type ViewMode = "free" | "premium"

interface Frame {
  frameId: string
  timestamp: string
  imageUrl: string
}

interface VDFDashboardProps {
  frames: Frame[]
  isLoading: boolean
}

export default function VDFDashboard({ frames, isLoading }: VDFDashboardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All")
  const [viewMode, setViewMode] = useState<ViewMode>("free")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [loadingExplanations, setLoadingExplanations] = useState<Set<string>>(new Set())
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const filters: FilterTab[] = ["All", "Key Moments", "Chapter Breaks"]

  const toggleAccordion = async (frameId: string) => {
    if (viewMode === "free") {
      setShowUpgradeModal(true)
      return
    }

    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(frameId)) {
      newExpanded.delete(frameId)
    } else {
      newExpanded.add(frameId)
      // Load explanation if not already loaded
      if (!explanations[frameId]) {
        setLoadingExplanations((prev) => new Set(prev).add(frameId))
        const result = await fetchExplanation(frameId)
        setExplanations((prev) => ({ ...prev, [frameId]: result.summary }))
        setLoadingExplanations((prev) => {
          const next = new Set(prev)
          next.delete(frameId)
          return next
        })
      }
    }
    setExpandedCards(newExpanded)
  }

  if (isLoading) {
    return (
      <section className="grain-overlay relative w-full px-6 py-16 md:px-12 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-[#FFF8EA] shadow-sm">
                <div className="shimmer aspect-video w-full" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="shimmer h-4 w-20 rounded" />
                  <div className="shimmer h-3 w-full rounded" />
                  <div className="shimmer h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (frames.length === 0) return null

  return (
    <section className="grain-overlay relative w-full px-6 py-16 md:px-12 md:py-24">
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Top bar: filters + view toggle */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-[#594545] text-[#FFF8EA]"
                    : "bg-[#FFF8EA] text-[#9E7676] border border-[#9E7676]/20 hover:bg-[#FFF0D6]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#9E7676]/20 p-0.5">
            <button
              onClick={() => setViewMode("free")}
              className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors ${
                viewMode === "free"
                  ? "bg-[#594545] text-[#FFF8EA]"
                  : "text-[#9E7676] hover:text-[#594545]"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setViewMode("premium")}
              className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors ${
                viewMode === "premium"
                  ? "bg-[#815B5B] text-[#FFF8EA]"
                  : "text-[#9E7676] hover:text-[#594545]"
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Frame cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {frames.map((frame) => (
            <div
              key={frame.frameId}
              className="overflow-hidden rounded-lg bg-[#FFF8EA] shadow-[0_2px_8px_rgba(89,69,69,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(89,69,69,0.12)]"
            >
              {/* Image with timestamp */}
              <div className="relative">
                <img
                  src={frame.imageUrl}
                  alt={`Frame at ${frame.timestamp}`}
                  className="aspect-video w-full object-cover"
                />
                <span className="absolute right-2 top-2 rounded-md bg-[#594545] px-2 py-0.5 font-sans text-xs font-medium text-[#FFF8EA]">
                  {frame.timestamp}
                </span>
              </div>

              {/* Content area */}
              <div className="p-4">
                {viewMode === "free" ? (
                  /* Freemium: blurred/locked explanation */
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="group flex w-full items-center gap-2 rounded-md bg-[#9E7676]/5 p-3 transition-colors hover:bg-[#9E7676]/10"
                  >
                    <div className="relative flex-1">
                      <p className="select-none font-sans text-xs text-[#9E7676]/40 blur-[3px]">
                        This frame explains the core concept being demonstrated in the lecture with detailed breakdown of steps.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Lock className="h-3.5 w-3.5 text-[#9E7676]" />
                      <span className="font-sans text-xs text-[#9E7676] group-hover:text-[#815B5B]">
                        Unlock
                      </span>
                    </div>
                  </button>
                ) : (
                  /* Premium: collapsible accordion */
                  <div>
                    <button
                      onClick={() => toggleAccordion(frame.frameId)}
                      className="flex w-full items-center justify-between py-1 font-sans text-sm font-medium text-[#594545] transition-colors hover:text-[#815B5B]"
                    >
                      Breakdown
                      <ChevronDown
                        className={`h-4 w-4 text-[#9E7676] transition-transform ${
                          expandedCards.has(frame.frameId) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedCards.has(frame.frameId) && (
                      <div className="mt-2 border-t border-[#9E7676]/10 pt-3">
                        {loadingExplanations.has(frame.frameId) ? (
                          <div className="flex flex-col gap-2">
                            <div className="shimmer h-3 w-full rounded" />
                            <div className="shimmer h-3 w-4/5 rounded" />
                          </div>
                        ) : (
                          <>
                            <p className="font-sans text-xs leading-relaxed text-[#815B5B]">
                              {explanations[frame.frameId]}
                            </p>
                            <div className="mt-3 flex items-center gap-1">
                              <svg className="h-3 w-3 text-[#9E7676]/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                              </svg>
                              <span className="font-sans text-[10px] text-[#9E7676]/40">gemini</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#594545]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#FFF8EA] p-8 shadow-xl">
            <h3 className="font-serif text-2xl font-bold text-[#594545]">
              Unlock explanations
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-[#815B5B]">
              Upgrade to Scholar to get detailed breakdowns of every frame extracted from your videos.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="#pricing"
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full rounded-full bg-[#815B5B] px-6 py-3 text-center font-sans text-sm font-medium text-[#FFF8EA] transition-colors hover:bg-[#594545]"
              >
                {"View plans \u2192"}
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full rounded-full px-6 py-3 font-sans text-sm text-[#9E7676] transition-colors hover:text-[#594545]"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
