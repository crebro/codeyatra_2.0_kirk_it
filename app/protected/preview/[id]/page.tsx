"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
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
  captions: string;
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoUrl | null>(null);
  const [frames, setFrames] = useState<FrameImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Delete frame state
  const [deletingFrameId, setDeletingFrameId] = useState<string | null>(null);

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
        .order("ts", { ascending: true })
        .order("created_at", { ascending: true });

      if (!framesError && framesData) {
        console.log("[Preview] Fetched frames:", framesData);
        console.log("[Preview] BASEURL:", process.env.NEXT_PUBLIC_COMPILE_REQUEST_SERVICE_BASEURL);
        setFrames(framesData as FrameImage[]);
      } else {
        console.log("[Preview] Frames error:", framesError);
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

  // Delete frame from database
  const handleDeleteFrame = async (frameId: string) => {
    if (deletingFrameId) return;
    setDeletingFrameId(frameId);
    try {
      const supabase = createClient();
      await supabase.from("video_frames").delete().eq("id", frameId);
      setFrames((prev) => prev.filter((f) => f.id !== frameId));
    } catch {
      // silently fail
    } finally {
      setDeletingFrameId(null);
    }
  };

  const handleSaveAsPdf = async () => {
    if (frames.length === 0) return;

    let pdf: jsPDF | null = null;

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `${process.env.NEXT_PUBLIC_COMPILE_REQUEST_SERVICE_BASEURL}${frame.url}`;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      if (i === 0) {
        // Create first page using image dimensions
        pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? "landscape" : "portrait",
          unit: "px",
          format: [imgWidth, imgHeight],
        });
      } else {
        // Add page with exact image dimensions
        pdf!.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? "landscape" : "portrait");
      }

      pdf!.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);
    }

    pdf!.save("frames.pdf");
  };

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
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.push("/protected?tab=files")}
            className="rounded-md px-2 py-1 font-sans text-xs font-medium text-[#815B5B] transition-colors hover:bg-[#9E7676]/10 flex-shrink-0"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-[#9E7676]/20 flex-shrink-0" />
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="font-serif text-base font-semibold text-[#594545] truncate">
              {title}
            </h1>
            <span className="rounded-full bg-[#594545]/10 px-2 py-0.5 font-sans text-[10px] font-medium text-[#594545] flex-shrink-0">
              {frames.length} slide{frames.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {frames.length > 0 && (
            <Button
              onClick={handleSaveAsPdf}
              size="sm"
              className="bg-[#815B5B] text-[#FFF8EA] hover:bg-[#594545] font-sans text-xs rounded-full px-4"
            >
              📄 Save as PDF
            </Button>
          )}
        </div>
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
              <div key={f.id} className="mb-2 w-full relative group">
                <button
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full rounded transition-all ${
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
                        src={f.url.startsWith("http") ? f.url : `${process.env.NEXT_PUBLIC_COMPILE_REQUEST_SERVICE_BASEURL}${f.url}`}
                        alt={`Slide ${i + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Center: Main slide viewer */}
          <div className="flex-1 flex flex-col bg-[#594545]/90 min-w-0">
            <div className="flex-1 flex items-center justify-center p-6 relative group">
              <div
                className="bg-white rounded shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden"
                style={{ maxWidth: "100%", maxHeight: "100%", aspectRatio: "16 / 9", width: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${process.env.NEXT_PUBLIC_COMPILE_REQUEST_SERVICE_BASEURL}${frames[currentIndex].url}`}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-contain bg-neutral-900"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    if (el.parentElement && !el.parentElement.querySelector(".img-error")) {
                      const msg = document.createElement("div");
                      msg.className = "img-error";
                      msg.style.cssText = "display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#9E7676;font-size:14px;font-family:sans-serif;text-align:center;padding:20px;";
                      msg.textContent = `Failed to load image: ${frames[currentIndex].url}`;
                      el.parentElement.appendChild(msg);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => handleDeleteFrame(frames[currentIndex].id)}
                disabled={deletingFrameId === frames[currentIndex].id}
                className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white rounded-md px-3 py-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium disabled:opacity-50 shadow-lg"
                title="Delete this frame"
              >
                {deletingFrameId === frames[currentIndex].id ? "Deleting..." : (
                  <>
                    <span>✕</span>
                    <span>Delete Frame</span>
                  </>
                )}
              </button>
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
                {frames[currentIndex].captions}
              </p>
            </div>

            <div className="mx-4 border-t border-[#9E7676]/15" />

            <div className="px-4 py-3">
              <p className="mb-2 font-sans text-[10px] uppercase tracking-wider text-[#9E7676]">
                All slides
              </p>
              <div className="flex flex-col gap-1">
                {frames.map((f, i) => (
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
                    {f.captions.slice(0, 60)}...
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
