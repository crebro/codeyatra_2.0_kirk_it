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
      className="grain-overlay relative w-full bg-vdf-cream-alt px-6 py-20 md:px-12 md:py-28"
    >
      <div className="relative z-10 mx-auto max-w-xl flex flex-col items-center gap-6">
        <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-vdf-dusty-rose">
          Paste your link
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="youtube.com/watch?v=..."
            className="w-full rounded-lg border-[1.5px] border-vdf-deep-brown bg-vdf-cream px-5 py-4 font-sans text-base text-vdf-deep-brown placeholder:text-vdf-dusty-rose/60 transition-colors focus:border-vdf-warm-mauve focus:outline-none focus:ring-2 focus:ring-vdf-warm-mauve/20"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-vdf-warm-mauve px-8 py-4 font-sans text-sm font-medium text-vdf-cream transition-all hover:bg-vdf-deep-brown hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vdf-warm-mauve focus-visible:ring-offset-2 focus-visible:ring-offset-vdf-cream-alt"
          >
            Extract Frames
          </button>
        </form>

        <p className="font-sans text-xs text-vdf-dusty-rose">
          Works with any public YouTube video.
        </p>
      </div>
    </section>
  )
}
