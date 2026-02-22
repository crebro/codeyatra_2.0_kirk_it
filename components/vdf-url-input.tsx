"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export function VDFUrlInput() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  const handleSaveUrl = useCallback(async () => {
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
      const { data, error } = await supabase
        .from("video_urls")
        .insert({ url: youtubeUrl.trim(), user_id: user.id }).select().single();

      const res = await fetch("/api/protected/begin_compile", {
        method: "POST",
        body: JSON.stringify({
          'video_id': data.id
        }),
        credentials: "include", // important!
      })

      if (error) {
        setSaveMessage(`Error: ${error.message}`);
      } else {
        setSaveMessage("URL saved successfully!");
        setYoutubeUrl("");
        // Navigate to files page after successful save
        setTimeout(() => router.push("/protected/files"), 1200);
      }
    } catch {
      setSaveMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [youtubeUrl, router]);

  return (
    <div className="flex flex-1 flex-col w-full">
      {/* Input hero — fills available space, centers content vertically */}
      <section className="grain-overlay relative flex flex-1 items-center justify-center w-full bg-[#FFF0D6] px-6 py-16 md:px-12">
        <div className="relative z-10 mx-auto w-full max-w-xl flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#594545] md:text-4xl text-center">
              Extract Key Frames
            </h1>
            <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#9E7676]">
              Paste your YouTube link below
            </p>
          </div>

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

      {/* Future feature sections can be added here as siblings */}
    </div>
  );
}
