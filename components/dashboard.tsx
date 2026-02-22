"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      const { error } = await supabase
        .from("video_urls")
        .insert({ url: youtubeUrl.trim(), user_id: user.id });

      if (error) {
        setSaveMessage(`Error: ${error.message}`);
      } else {
        setSaveMessage("URL saved successfully!");
        setYoutubeUrl("");
        // Refresh the video list
        fetchVideos();
      }
    } catch {
      setSaveMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Navigate to preview page
  const handleSelectVideo = (video: VideoUrl) => {
    router.push(`/protected/preview/${video.id}`);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl w-full p-5">
      {/* YouTube URL Section */}
      <section className="w-full">
        <h2 className="font-semibold text-xl mb-4">Paste YouTube URL</h2>
        <div className="flex gap-3 items-center">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveUrl();
            }}
            className="flex-1"
          />
          <Button onClick={handleSaveUrl} disabled={saving}>
            {saving ? "Saving..." : "Save URL"}
          </Button>
        </div>
        {saveMessage && (
          <p
            className={`mt-2 text-sm ${
              saveMessage.startsWith("Error") ||
              saveMessage.startsWith("Something")
                ? "text-destructive"
                : "text-green-600"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </section>

      {/* Video List Section */}
      <section className="w-full">
        <h2 className="font-semibold text-xl mb-4">
          Your Videos ({videos.length})
        </h2>

        {loadingVideos ? (
          <p className="text-muted-foreground text-sm">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No videos yet. Paste a YouTube URL above to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
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
                  className="flex items-center gap-4 w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail */}
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt={title}
                      className="w-28 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      🎬 {title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {video.url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(video.created_at).toLocaleDateString()}{" "}
                      {frameCounts[video.id] !== undefined &&
                        `· ${frameCounts[video.id]} frame${frameCounts[video.id] !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  {/* Arrow */}
                  <span className="text-muted-foreground text-lg flex-shrink-0">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
 return <div> hello </div>;
}