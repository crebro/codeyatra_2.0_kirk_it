"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ExtractViewer from "@/components/extract-viewer"

function ExtractContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url") || ""
  return <ExtractViewer videoUrl={url} />
}

export default function ExtractPage() {
  return (
    <Suspense>
      <ExtractContent />
    </Suspense>
  )
}
