"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getExtractions, getFrames, deleteExtraction, updateExtractionTitle, VideoExtraction } from "@/utils/db";
import { Loader2, Trash2, Edit3, Check, X, Calendar, FileVideo, ChevronRight } from "lucide-react";

export function VDFLocalLibrary() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const extractions = await getExtractions();
      setVideos(extractions);

      // Fetch thumbnails (first frame) for each
      const thumbs: Record<string, string> = {};
      for (const video of extractions) {
        const frames = await getFrames(video.id);
        if (frames.length > 0) {
          thumbs[video.id] = URL.createObjectURL(frames[0].blob);
        }
      }
      setThumbnails(prev => {
        Object.values(prev).forEach(url => URL.revokeObjectURL(url));
        return thumbs;
      });
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
    return () => {
      setThumbnails(prev => {
        Object.values(prev).forEach(url => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [fetchLibrary]);

  const handleSelect = (id: string) => {
    router.push(`/preview/${id}`);
  };

  const startRename = (video: VideoExtraction, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(video.id);
    setRenameValue(video.title || "");
  };

  const saveRename = async (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setSubmitting(true);
    try {
      await updateExtractionTitle(id, renameValue.trim());
      setVideos(prev => prev.map(v => v.id === id ? { ...v, title: renameValue.trim() } : v));
      setRenamingId(null);
    } catch (error) {
      console.error("Failed to rename:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this extraction?")) return;
    try {
      await deleteExtraction(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      if (thumbnails[id]) {
        URL.revokeObjectURL(thumbnails[id]);
        setThumbnails(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  return (
    <div className="w-full min-h-[60vh]">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold text-[#594545]">
          Your Library
        </h2>
        <div className="flex items-center gap-2 bg-[#815B5B] text-[#FFF8EA] px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
          <FileVideo className="w-4 h-4" />
          <span>{videos.length} extractions</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#FFF0D6]/40 rounded-2xl p-4 animate-pulse">
              <div className="aspect-video bg-[#9E7676]/10 rounded-xl mb-4" />
              <div className="h-5 bg-[#9E7676]/10 rounded-full w-3/4 mb-2" />
              <div className="h-4 bg-[#9E7676]/10 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-[#9E7676]/30 rounded-3xl bg-[#FFF0D6]/20">
          <div className="bg-[#9E7676]/10 p-6 rounded-full mb-6">
            <FileVideo className="w-12 h-12 text-[#9E7676]" />
          </div>
          <h3 className="text-xl font-bold text-[#594545] mb-2">Empty Library</h3>
          <p className="text-[#9E7676] max-w-sm mb-8">
            You haven&apos;t extracted any frames yet. Upload a video on the home page to get started.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="bg-[#815B5B] text-white px-8 py-3 rounded-full font-bold hover:bg-[#594545] transition-all shadow-lg active:scale-95"
          >
            Start Extraction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleSelect(video.id)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#594545]">
                {thumbnails[video.id] ? (
                  <img
                    src={thumbnails[video.id]}
                    alt={video.title || "Video"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-12 h-12 text-[#FFF8EA]/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold">
                  LOCAL
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                {renamingId === video.id ? (
                  <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      className="flex-1 bg-[#FFF8EA] border-2 border-[#815B5B]/30 rounded-lg px-3 py-1 text-sm font-medium text-[#594545] focus:outline-none focus:border-[#815B5B]"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveRename(video.id, e);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                    />
                    <button 
                      disabled={submitting}
                      onClick={e => saveRename(video.id, e)}
                      className="p-1.5 bg-[#815B5B] text-white rounded-lg hover:bg-[#594545] disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-lg font-bold text-[#594545] truncate group-hover:text-[#815B5B] transition-colors">
                      {video.title || "Untitled Extraction"}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={e => startRename(video, e)}
                        className="p-1.5 text-[#9E7676] hover:bg-[#FFF8EA] rounded-full"
                        title="Rename"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={e => handleDelete(video.id, e)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-[#9E7676] text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-[#815B5B]">
                    <span>View Frames</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
