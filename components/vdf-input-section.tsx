"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VDFInputSection() {
  const [url, setUrl] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      router.push(`/video?url=${encodeURIComponent(url.trim())}`)
    }
  }

  return (
    <section
      id="get-started"
      className="grain-overlay relative w-full bg-[#FFF0D6] px-6 py-20 md:px-12 md:py-28"
    >
      <div className="relative z-10 mx-auto max-w-xl flex flex-col items-center gap-6">
        <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#9E7676]">
          Paste your link
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="youtube.com/watch?v=..."
            className="w-full rounded-lg border-[1.5px] border-[#594545] bg-[#FFF8EA] px-5 py-4 font-sans text-base text-[#594545] placeholder:text-[#9E7676]/60 transition-colors focus:border-[#815B5B] focus:outline-none focus:ring-2 focus:ring-[#815B5B]/20"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#815B5B] px-8 py-4 font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#594545] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#815B5B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF0D6]"
          >
            Extract Frames
          </button>
        </form>

        <p className="font-sans text-xs text-[#9E7676]">
          Works with any public YouTube video.
        </p>
      </div>
    </section>
  )
}
