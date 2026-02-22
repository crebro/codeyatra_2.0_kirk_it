"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoUrl | null>(null);
  const [frames, setFrames] = useState<FrameImage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch the video info
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

      // Fetch the frames
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

  const handleDeleteFrame = (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveAsPdf = () => {
    if (frames.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = video?.video_title || "Video Frames";

    const imagesHtml = frames
      .map(
        (frame, index) =>
          `<div style="page-break-inside: avoid; margin-bottom: 20px; text-align: center;">
            <img src="${frame.url}" style="max-width: 100%; height: auto; border-radius: 8px;" crossorigin="anonymous" />
            <p style="margin-top: 8px; color: #666; font-size: 14px;">Page ${index + 1}</p>
          </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>VDF - ${title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>VDF - ${title}</h1>
          ${imagesHtml}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
        <p className="text-muted-foreground">Video not found.</p>
        <Button onClick={() => router.push("/protected")} variant="outline">
          ← Back to Home
        </Button>
      </div>
    );
  }

  const title = video.video_title || "Untitled Video";

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl w-full p-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/protected")}
            variant="ghost"
            size="sm"
            className="h-8 px-2"
          >
            ← Back
          </Button>
          <div>
            <h1 className="font-semibold text-xl">{title}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {frames.length} frame{frames.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {frames.length > 0 && (
          <Button onClick={handleSaveAsPdf} variant="outline">
            📄 Save as PDF
          </Button>
        )}
      </div>

      {/* Frames Preview */}
      {frames.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No frames available for this video yet.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="rounded-lg overflow-hidden border border-border"
        >
          <div
            className="flex flex-col items-center gap-6 py-6 px-4 max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: "#525659",
              scrollbarColor: "#888 #525659",
            }}
          >
            {frames.map((frame, index) => (
              <div
                key={frame.id}
                className="relative group"
                style={{ width: "100%", maxWidth: 540 }}
              >
                {/* Paper page */}
                <div
                  className="bg-white rounded-sm overflow-hidden"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    aspectRatio: "8.5 / 11",
                  }}
                >
                  <img
                    src={frame.url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Delete button — appears on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteFrame(frame.id)}
                    className="h-7 px-2 text-xs shadow-lg"
                  >
                    ✕ Remove
                  </Button>
                </div>

                {/* Page number */}
                <p
                  className="text-center text-xs mt-2"
                  style={{ color: "#aaa" }}
                >
                  Page {index + 1} of {frames.length}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
