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

function isValidYoutubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?.*v=([\w-]{11})/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([\w-]{11})/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([\w-]{11})/,
    /^(https?:\/\/)?youtu\.be\/([\w-]{11})/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/live\/([\w-]{11})/,
  ];
  return patterns.some((pattern) => pattern.test(url.trim()));
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

export function Dashboard() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const router = useRouter();

  // Video list state
  const [videos, setVideos] = useState<VideoUrl[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [frameCounts, setFrameCounts] = useState<Record<string, number>>({});

  // Fetch user's videos on mount
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

        // Fetch frame counts for each video from video_frames
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

  // Save URL handler
  const handleSaveUrl = async () => {
    if (!youtubeUrl.trim()) {
      setSaveMessage("Please enter a YouTube URL.");
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      setSaveMessage(
        "Error: Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)"
      );
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaveMessage("Error: You must be signed in to save a URL.");
        setSaving(false);
        return;
      }

      // 1. Insert into Supabase
      const { data, error: insertError } = await supabase
        .from("video_urls")
        .insert({ url: youtubeUrl.trim(), user_id: user.id })
        .select()
        .single();

      if (insertError) {
        setSaveMessage(`Error saving to database: ${insertError.message}`);
        setSaving(false);
        return;
      }

      if (!data) {
        setSaveMessage("Error: Failed to retrieve saved video data.");
        setSaving(false);
        return;
      }

      // 2. Call the compile API
      try {
        const res = await fetch("/api/protected/begin_compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_id: data.id,
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setSaveMessage(`URL saved, but compile trigger failed: ${errorData.error || res.statusText}`);
        } else {
          setSaveMessage("URL saved and compilation started!");
          setYoutubeUrl("");
          fetchVideos();
        }
      } catch (fetchErr: unknown) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        setSaveMessage(`URL saved, but failed to connect to compile service: ${msg}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveMessage(`Something went wrong: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Navigate to preview page
  const handleSelectVideo = (video: VideoUrl) => {
    router.push(`/protected/preview/${video.id}`);
  };

  return (
    <div className="w-full">
      {/* URL Input Section */}
      <section className="grain-overlay relative w-full bg-[#FFF0D6] px-6 py-20 md:px-12 md:py-28">
        <div className="relative z-10 mx-auto max-w-xl flex flex-col items-center gap-6">
          <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#9E7676]">
            Paste your link
          </p>

          <div className="w-full flex flex-col gap-4">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveUrl();
              }}
              placeholder="youtube.com/watch?v=..."
              className="w-full rounded-lg border-[1.5px] border-[#594545] bg-[#FFF8EA] px-5 py-4 font-sans text-base text-[#594545] placeholder:text-[#9E7676]/60 transition-colors focus:border-[#815B5B] focus:outline-none focus:ring-2 focus:ring-[#815B5B]/20"
            />
            <button
              onClick={handleSaveUrl}
              disabled={saving}
              className="w-full rounded-full bg-[#815B5B] px-8 py-4 font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#594545] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#815B5B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF0D6] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Extract Frames"}
            </button>
          </div>

          {saveMessage && (
            <p
              className={`font-sans text-sm ${saveMessage.startsWith("Error") ||
                saveMessage.startsWith("Something")
                ? "text-red-600"
                : "text-emerald-700"
                }`}
            >
              {saveMessage}
            </p>
          )}

          <p className="font-sans text-xs text-[#9E7676]">
            Works with any public YouTube video.
          </p>
        </div>
      </section>

      {/* Video List Section */}
      <section className="grain-overlay relative w-full px-6 py-16 md:px-12 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#594545] md:text-3xl">
              Your Videos
            </h2>
            <span className="rounded-full bg-[#594545] px-3 py-1 font-sans text-xs font-medium text-[#FFF8EA]">
              {videos.length} video{videos.length !== 1 ? "s" : ""}
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
                No videos yet. Paste a YouTube URL above to get started.
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
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className="group overflow-hidden rounded-lg bg-[#FFF8EA] text-left shadow-[0_2px_8px_rgba(89,69,69,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(89,69,69,0.12)]"
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      {thumbnailUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
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
                      <p className="font-sans text-sm font-medium text-[#594545] truncate group-hover:text-[#815B5B] transition-colors">
                        {title}
                      </p>
                      <p className="mt-1 font-sans text-xs text-[#9E7676] truncate">
                        {video.url}
                      </p>
                      <p className="mt-2 font-sans text-xs text-[#9E7676]/60">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}