"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface VideoUrl {
  id: string;
  user_id: string;
  url: string;
  video_title: string | null;
  image_number: number | null;
  created_at: string;
}

interface FrameImage {
  id: string;
  video_id: string;
  url: string;
}

/* Mock descriptions — one per slide, cycling */
const MOCK_DESCRIPTIONS = [
  "This slide introduces the main topic and sets the context for the discussion. The speaker outlines the key goals and what the audience can expect to learn.",
  "A detailed breakdown of the core concepts is presented here, with visual aids to support the explanation. Key terminology is defined for clarity.",
  "The speaker transitions to a real-world example, demonstrating how the theory applies in practice. Supporting data points are highlighted.",
  "This section covers the methodology and approach used. Step-by-step instructions are provided for reproducibility.",
  "A comparative analysis is shown, contrasting different approaches and their trade-offs. The speaker emphasizes the recommended path.",
  "Visual data — charts or diagrams — illustrate trends and patterns. The speaker walks through the most significant data points.",
  "The speaker addresses common misconceptions and frequently asked questions. Clarifications are given with concrete examples.",
  "An interactive segment where the audience or viewers are encouraged to reflect on the material presented so far.",
  "Advanced concepts and edge cases are discussed. The speaker shares tips from personal experience in the field.",
  "A summary of all key takeaways is presented. Action items and next steps are listed for the audience to follow up on.",
  "The speaker shares supplementary resources, links, and references for deeper exploration of the topic.",
  "A brief Q&A-style recap where the most important points are revisited in a concise question-and-answer format.",
];

function getSlideDescription(index: number): string {
  return MOCK_DESCRIPTIONS[index % MOCK_DESCRIPTIONS.length];
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoUrl | null>(null);
  const [frames, setFrames] = useState<FrameImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: videoData, error: videoError } = await supabase
        .from("video_urls")
        .select("*")
        .eq("id", videoId)
        .single();

      if (videoError || !videoData) {
        setLoading(false);
        return;
      }

      setVideo(videoData as VideoUrl);

      const { data: framesData, error: framesError } = await supabase
        .from("video_frames")
        .select("*")
        .eq("video_id", videoId)
        .order("id", { ascending: true });

      if (!framesError && framesData) {
        setFrames(framesData as FrameImage[]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (frames.length === 0) setCurrentIndex(0);
    else if (currentIndex >= frames.length) setCurrentIndex(frames.length - 1);
  }, [frames, currentIndex]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex((prev) => Math.min(prev + 1, frames.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [frames.length]);

  const handleSaveAsPdf = () => {
    if (frames.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const t = video?.video_title || "Video Frames";
    const imagesHtml = frames
      .map(
        (frame, index) =>
          `<div style="page-break-inside: avoid; margin-bottom: 20px; text-align: center;">
            <img src="${frame.url}" style="max-width: 100%; height: auto; border-radius: 8px;" crossorigin="anonymous" />
            <p style="margin-top: 8px; color: #666; font-size: 14px;">Page ${index + 1}</p>
          </div>`
      )
      .join("");
    printWindow.document.write(`<html><head><title>VDF - ${t}</title><style>body{font-family:sans-serif;padding:40px}h1{text-align:center;margin-bottom:30px}</style></head><body><h1>VDF - ${t}</h1>${imagesHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.close()},1000)}</script></body></html>`);
    printWindow.document.close();
  };

  /* Stable descriptions per frame */
  const descriptions = useMemo(
    () => frames.map((_, i) => getSlideDescription(i)),
    [frames]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <p className="font-sans text-sm text-[#9E7676]">Loading preview...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
        <p className="font-sans text-sm text-[#9E7676]">Video not found.</p>
        <Button onClick={() => router.push("/protected")} variant="outline">
          ← Back to Home
        </Button>
      </div>
    );
  }

  const title = video.video_title || "Untitled Video";

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#9E7676]/15 bg-[#FFF8EA] px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/protected?tab=files")}
            className="rounded-md px-2 py-1 font-sans text-xs font-medium text-[#815B5B] transition-colors hover:bg-[#9E7676]/10"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-[#9E7676]/20" />
          <h1 className="font-serif text-base font-semibold text-[#594545] truncate max-w-xs">
            {title}
          </h1>
          <span className="rounded-full bg-[#594545]/10 px-2 py-0.5 font-sans text-[10px] font-medium text-[#594545]">
            {frames.length} slide{frames.length !== 1 ? "s" : ""}
          </span>
        </div>
        {frames.length > 0 && (
          <Button
            onClick={handleSaveAsPdf}
            size="sm"
            className="bg-[#815B5B] text-[#FFF8EA] hover:bg-[#594545] font-sans text-xs rounded-full px-4"
          >
            Save as PDF
          </Button>
        )}
      </div>

      {/* Main area */}
      {frames.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-sans text-sm text-[#9E7676]">No frames available for this video yet.</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left: Slide thumbnails */}
          <div
            className="w-[120px] shrink-0 border-r border-[#9E7676]/15 bg-[#FFF0D6]/60 overflow-y-auto py-3 px-2"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#9E7676 transparent" }}
          >
            {frames.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setCurrentIndex(i)}
                className={`mb-2 w-full rounded transition-all ${
                  i === currentIndex
                    ? "ring-2 ring-[#815B5B] ring-offset-1 ring-offset-[#FFF0D6] shadow-md"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 pt-1 font-sans text-[10px] text-[#9E7676] w-3 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-sm border border-[#9E7676]/20 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={`Slide ${i + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Center: Main slide viewer */}
          <div className="flex-1 flex flex-col bg-[#594545]/90 min-w-0">
            <div className="flex-1 flex items-center justify-center p-6">
              <div
                className="bg-white rounded shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden"
                style={{ maxWidth: "100%", maxHeight: "100%", aspectRatio: "16 / 9", width: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frames[currentIndex].url}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            </div>
            {/* Slide counter + nav */}
            <div className="flex items-center justify-center gap-3 pb-3">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
                className="rounded px-2 py-1 font-sans text-xs text-[#FFF8EA]/80 transition hover:text-white disabled:opacity-30"
              >
                Prev
              </button>
              <span className="font-sans text-xs text-[#FFF8EA]/70">
                Slide {currentIndex + 1} of {frames.length}
              </span>
              <button
                disabled={currentIndex === frames.length - 1}
                onClick={() => setCurrentIndex((p) => p + 1)}
                className="rounded px-2 py-1 font-sans text-xs text-[#FFF8EA]/80 transition hover:text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right: Description panel */}
          <aside
            className="w-[300px] shrink-0 border-l border-[#9E7676]/15 bg-[#FFF8EA] overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#9E7676 transparent" }}
          >
            <div className="border-b border-[#9E7676]/15 px-4 py-3">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#9E7676]">
                Slide {currentIndex + 1}
              </p>
              <h3 className="mt-1 font-serif text-sm font-semibold text-[#594545]">
                Description
              </h3>
            </div>

            <div className="px-4 py-4">
              <p className="font-sans text-sm leading-relaxed text-[#594545]">
                {descriptions[currentIndex]}
              </p>
            </div>

            <div className="mx-4 border-t border-[#9E7676]/15" />

            <div className="px-4 py-3">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-wider text-[#9E7676]">
                All slides
              </p>
              <div className="flex flex-col gap-1">
                {frames.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-md px-3 py-2 text-left font-sans text-xs transition-colors ${
                      i === currentIndex
                        ? "bg-[#815B5B]/10 text-[#594545] font-medium"
                        : "text-[#9E7676] hover:bg-[#9E7676]/10 hover:text-[#594545]"
                    }`}
                  >
                    <span className="font-medium">Slide {i + 1}:</span>{" "}
                    {descriptions[i].slice(0, 60)}...
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
