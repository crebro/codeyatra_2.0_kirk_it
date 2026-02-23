"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface VideoUrl {
  id: string;
  user_id: string;
  url: string;
  video_title: string | null;
  image_number: number | null;
  created_at: string;
}

function extractVideoId(url: string): string {
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}

export function VDFVideoFiles() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoUrl[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [frameCounts, setFrameCounts] = useState<Record<string, number>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingVideos(false);
        return;
      }

      const { data, error } = await supabase
        .from("video_urls")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVideos(data as VideoUrl[]);

        const videoIds = (data as VideoUrl[]).map((v) => v.id);
        if (videoIds.length > 0) {
          const { data: framesData } = await supabase
            .from("video_frames")
            .select("video_id")
            .in("video_id", videoIds);

          if (framesData) {
            const counts: Record<string, number> = {};
            for (const row of framesData) {
              counts[row.video_id] = (counts[row.video_id] || 0) + 1;
            }
            setFrameCounts(counts);
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSelectVideo = (video: VideoUrl) => {
    router.push(`/protected/preview/${video.id}`);
  };

  const startRename = (video: VideoUrl, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(video.id);
    setRenameValue(video.video_title || "");
  };

  const saveRename = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("video_urls")
        .update({ video_title: renameValue.trim() || null })
        .eq("id", videoId);
      await fetchVideos();
      setRenamingId(null);
    } catch {
      // silently fail
    } finally {
      setRenameSaving(false);
    }
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDelete = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this slide and all its frames?")) return;
    try {
      const supabase = createClient();
      await supabase.from("video_frames").delete().eq("video_id", videoId);
      await supabase.from("video_urls").delete().eq("id", videoId);
      await fetchVideos();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="w-full">
      <section className="grain-overlay relative w-full px-6 py-16 md:px-12 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#594545] md:text-3xl">
              Your Slides
            </h2>
            <span className="rounded-full bg-[#594545] px-3 py-1 font-sans text-xs font-medium text-[#FFF8EA]">
              {videos.length} slide{videos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingVideos ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="rounded-full bg-[#9E7676]/10 p-6">
                <svg className="h-10 w-10 text-[#9E7676]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="font-sans text-sm text-[#9E7676]">
                No videos yet. Paste a YouTube URL on the{" "}
                <a href="/protected" className="underline text-[#815B5B] hover:text-[#594545]">
                  Home
                </a>{" "}
                page to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const videoId = extractVideoId(video.url);
                const thumbnailUrl = videoId
                  ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                  : "";
                const title = video.video_title || videoId || "Untitled Video";

                return (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className="cursor-pointer group overflow-hidden rounded-lg bg-[#FFF8EA] text-left shadow-[0_2px_8px_rgba(89,69,69,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(89,69,69,0.12)]"
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={title}
                          className="aspect-video w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="aspect-video w-full bg-[#9E7676]/10 flex items-center justify-center">
                          <svg className="h-12 w-12 text-[#9E7676]/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                        </div>
                      )}
                      {frameCounts[video.id] !== undefined && (
                        <span className="absolute right-2 top-2 rounded-md bg-[#594545] px-2 py-0.5 font-sans text-xs font-medium text-[#FFF8EA]">
                          {frameCounts[video.id]} frame{frameCounts[video.id] !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {renamingId === video.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(video.id, e as any);
                              if (e.key === "Escape") cancelRename(e as any);
                            }}
                            className="flex-1 rounded border border-[#815B5B] bg-[#FFF8EA] px-2 py-1 font-sans text-sm text-[#594545] focus:outline-none focus:ring-2 focus:ring-[#815B5B]/20"
                            autoFocus
                          />
                          <button
                            onClick={(e) => saveRename(video.id, e)}
                            disabled={renameSaving}
                            className="rounded bg-[#815B5B] px-2 py-1 font-sans text-xs text-[#FFF8EA] hover:bg-[#594545] disabled:opacity-50"
                          >
                            {renameSaving ? "..." : "✓"}
                          </button>
                          <button
                            onClick={cancelRename}
                            className="rounded bg-[#9E7676] px-2 py-1 font-sans text-xs text-[#FFF8EA] hover:bg-[#815B5B]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-sans text-sm font-medium text-[#594545] truncate group-hover:text-[#815B5B] transition-colors flex-1">
                            {title}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => startRename(video, e)}
                              className="rounded p-1 text-[#815B5B] hover:bg-[#815B5B]/10 transition-colors"
                              title="Rename slide"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => handleDelete(video.id, e)}
                              className="rounded p-1 text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete slide"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="mt-1 font-sans text-xs text-[#9E7676] truncate">
                        {video.url}
                      </p>
                      <p className="mt-2 font-sans text-xs text-[#9E7676]/60">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
