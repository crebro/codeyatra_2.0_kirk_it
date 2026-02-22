"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const IMAGE_COUNT = 10;

const DUMMY_IMAGES = Array.from({ length: IMAGE_COUNT }, (_, i) => ({
  id: i,
  src: `https://picsum.photos/seed/${i + 1}/400/300`,
}));

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

export function Dashboard() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [images, setImages] = useState(DUMMY_IMAGES);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSaveUrl = async () => {
    if (!youtubeUrl.trim()) {
      setSaveMessage("Please enter a YouTube URL.");
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      setSaveMessage("Error: Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
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
      }
    } catch {
      setSaveMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSaveAsPdf = async () => {
    const container = scrollRef.current;
    if (!container || images.length === 0) return;

    // Create a simple printable view and use browser print to PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const imagesHtml = images
      .map(
        (img) =>
          `<div style="page-break-inside: avoid; margin-bottom: 20px; text-align: center;">
            <img src="${img.src}" style="max-width: 100%; height: auto; border-radius: 8px;" crossorigin="anonymous" />
            <p style="margin-top: 8px; color: #666; font-size: 14px;">Image ${img.id + 1}</p>
          </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>VDF - Images Export</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>VDF - Exported Images</h1>
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

  return (
    <div className="flex-1 flex flex-col gap-10 max-w-5xl w-full p-5">
      {/* YouTube URL Section */}
      <section className="w-full">
        <h2 className="font-semibold text-xl mb-4">Paste YouTube URL</h2>
        <div className="flex gap-3 items-center">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveUrl} disabled={saving}>
            {saving ? "Saving..." : "Save URL"}
          </Button>
        </div>
        {saveMessage && (
          <p
            className={`mt-2 text-sm ${
              saveMessage.startsWith("Error") || saveMessage.startsWith("Something")
                ? "text-destructive"
                : "text-green-600"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </section>

      {/* PDF Preview Style Images Section */}
      <section className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">
            Pages ({images.length})
          </h2>
          {images.length > 0 && (
            <Button onClick={handleSaveAsPdf} variant="outline">
              📄 Save as PDF
            </Button>
          )}
        </div>

        {images.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pages to display.</p>
        ) : (
          <div
            ref={scrollRef}
            className="rounded-lg overflow-hidden border border-border"
          >
            {/* Dark background like PDF preview */}
            <div
              className="flex flex-col items-center gap-6 py-6 px-4 max-h-[70vh] overflow-y-auto"
              style={{
                backgroundColor: "#525659",
                scrollbarColor: "#888 #525659",
              }}
            >
              {images.map((img, index) => (
                <div
                  key={img.id}
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
                    {/* Image fills the page */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                      />
                  </div>

                  {/* Delete button — appears on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(img.id)}
                      className="h-7 px-2 text-xs shadow-lg"
                    >
                      ✕ Delete
                    </Button>
                  </div>

                  {/* Page number below */}
                  <p className="text-center text-xs mt-2" style={{ color: "#aaa" }}>
                    Page {index + 1} of {images.length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
