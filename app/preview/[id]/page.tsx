"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { imagesToOriginalSizePdf } from "@/utils/load-image-from-blob";
import { getExtraction, getFrames, deleteExtraction, VideoExtraction, Frame } from "@/utils/db";
import { Loader2, ArrowLeft, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoExtraction | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const videoData = await getExtraction(videoId);
      if (!videoData) {
        setLoading(false);
        return;
      }
      setVideo(videoData);

      const framesData = await getFrames(videoId);
      setFrames(framesData);

      // Create object URLs for frames
      const urls: Record<string, string> = {};
      framesData.forEach(frame => {
        urls[frame.id] = URL.createObjectURL(frame.blob);
      });
      setImageUrls(prev => {
        // Revoke old URLs
        Object.values(prev).forEach(url => URL.revokeObjectURL(url));
        return urls;
      });

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchData();
    return () => {
      // Cleanup URLs on unmount
      setImageUrls(prev => {
        Object.values(prev).forEach(url => URL.revokeObjectURL(url));
        return {};
      });
    };
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this extraction?")) return;
    setDeleting(true);
    try {
      await deleteExtraction(videoId);
      router.push("/library");
    } catch (error) {
      console.error("Failed to delete:", error);
      setDeleting(false);
    }
  };

  const handleSaveAsPdf = async () => {
    if (frames.length === 0) return;

    try {
      const imageInstances: HTMLImageElement[] = [];

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const img = new Image();
        img.src = imageUrls[frame.id];
        imageInstances.push(img);
      }

      const pdfBlob = await imagesToOriginalSizePdf(imageInstances);
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${video?.title || "frames"}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 min-h-screen bg-vdf-cream">
        <Loader2 className="w-8 h-8 text-vdf-warm-mauve animate-spin" />
        <p className="ml-3 font-sans text-sm text-vdf-dusty-rose">Loading preview...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 min-h-screen bg-vdf-cream">
        <p className="font-sans text-sm text-vdf-dusty-rose">Extraction not found.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="rounded-full">
          ← Back to Home
        </Button>
      </div>
    );
  }

  const title = video.title || "Untitled Video";

  return (
    <div className="flex flex-col h-screen bg-vdf-cream">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-vdf-dusty-rose/15 bg-vdf-cream px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => router.push("/library")}
            className="rounded-full p-2 text-vdf-warm-mauve transition-colors hover:bg-vdf-dusty-rose/10"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-vdf-dusty-rose/20" />

          <div className="flex flex-col min-w-0">
            <h1 className="font-serif text-lg font-bold text-vdf-deep-brown truncate">
              {title}
            </h1>
            <span className="font-sans text-[10px] text-vdf-dusty-rose">
              {frames.length} frame{frames.length !== 1 ? "s" : ""} • {new Date(video.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveAsPdf}
            size="sm"
            className="bg-vdf-warm-mauve text-vdf-cream hover:bg-vdf-deep-brown font-sans text-xs rounded-full px-5 shadow-md flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Save as PDF
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            title="Delete Extraction"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main area */}
      {frames.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-sans text-sm text-vdf-dusty-rose">No frames available for this extraction.</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left: Slide thumbnails */}
          <div
            className="w-[140px] shrink-0 border-r border-vdf-dusty-rose/15 bg-vdf-cream-alt/40 overflow-y-auto py-4 px-3"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#9E7676 transparent" }}
          >
            <div className="space-y-3">
              {frames.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full group relative rounded-lg overflow-hidden transition-all ${i === currentIndex
                    ? "ring-2 ring-vdf-warm-mauve ring-offset-2 ring-offset-vdf-cream-alt shadow-lg scale-[1.02]"
                    : "opacity-60 hover:opacity-100 hover:translate-y-[-2px]"
                    }`}
                >
                  <div className="aspect-video bg-neutral-200">
                    <img
                      src={imageUrls[f.id]}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute bottom-0 inset-x-0 py-1 px-1.5 text-[9px] font-bold text-center transition-colors ${i === currentIndex ? "bg-vdf-warm-mauve text-white" : "bg-black/40 text-white"
                    }`}>
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Main slide viewer */}
          <div className="flex-1 flex flex-col bg-vdf-deep-brown/5 min-w-0">
            <div className="flex-1 flex items-center justify-center p-8 relative group">
              <div
                className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden relative"
                style={{ maxWidth: "100%", maxHeight: "100%", aspectRatio: "16 / 9", width: "100%" }}
              >
                <img
                  src={imageUrls[frames[currentIndex].id]}
                  alt={`Frame ${currentIndex + 1}`}
                  className="w-full h-full object-contain bg-neutral-900"
                />

                {/* Navigation Overlay */}
                <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(p => p - 1)}
                    className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={currentIndex === frames.length - 1}
                    onClick={() => setCurrentIndex(p => p + 1)}
                    className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full disabled:opacity-0 transition-all"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide counter */}
            <div className="flex items-center justify-center gap-6 pb-6 pt-2 h-14">
              <div className="bg-vdf-deep-brown text-vdf-cream rounded-full px-4 py-1 font-sans text-xs font-medium shadow-md">
                Frame {currentIndex + 1} of {frames.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
