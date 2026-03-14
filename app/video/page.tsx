"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VDFHeader from "@/components/vdf-header";
import VDFFooter from "@/components/vdf-footer";
import { Loader2, Download, Play, AlertCircle, FileUp, CheckCircle2 } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { extractFrames } from '@/utils/process-video';
import { saveExtraction } from '@/utils/db';
import { useRouter } from 'next/navigation';

function VideoUploadSection() {
    const router = useRouter();
    const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);
    const [isDone, setIsDone] = useState(false);
    const [selectedType, setSelectedType] = useState("presentation");

    const videoTypes = [
        {
            id: "presentation",
            title: "Moving Presentation / Whiteboard",
            description: "Best for slides, digital whiteboards, and screenshares.",
            image: "/graphics/presentation.png",
            disabled: false
        },
        {
            id: "whiteboard_person",
            title: "Whiteboard - Moving Person",
            description: "Optimized for physical whiteboards with a presenter.",
            image: "/graphics/whiteboard_person.png",
            disabled: true
        },
        {
            id: "conference",
            title: "Online conferences",
            description: "Extract from Zoom, Teams, or Meet recordings.",
            image: "/graphics/conference.png",
            disabled: true
        }
    ];

    const loadFFmpeg = async () => {
        const ffmpegInstance = new FFmpeg();
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpeg(ffmpegInstance);
        return ffmpegInstance;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setIsDone(false);
        try {
            setStatus("Initializing FFmpeg...");
            const instance = ffmpeg || await loadFFmpeg();

            setStatus("Reading file...");
            const arrayBuffer = await file.arrayBuffer();
            await instance.writeFile('input.mp4', new Uint8Array(arrayBuffer));

            setStatus("Extracting frames...");
            const frames = await extractFrames('input.mp4', instance, (log: any) => {
                const message = log.message || "";
                if (message) setStatus(`Processing: ${message.substring(0, 50)}...`);
            }, (progress: number) => {
                setProgress(progress);
            });

            setStatus("Saving locally...");
            const extractionId = crypto.randomUUID();
            await saveExtraction({
                id: extractionId,
                url: file.name,
                title: file.name.split('.').slice(0, -1).join('.'),
                createdAt: Date.now()
            }, frames.map(f => ({
                videoId: extractionId,
                blob: f.blob,
                timestamp: f.timestamp,
                index: f.index
            })));

            setStatus("Done! Redirecting...");
            setIsDone(true);

            // Short delay to show success state
            setTimeout(() => {
                router.push(`/preview/${extractionId}`);
            }, 1000);

        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full pt-12 border-t-2 border-[#594545]/10">
            <div className="flex flex-col items-center gap-10">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#594545]">Convert Local Video to PDF</h2>
                    <p className="text-[#9E7676] text-sm max-w-lg">Choose the video content type to optimize frame extraction and quality.</p>
                </div>

                {/* Video Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {videoTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => !type.disabled && setSelectedType(type.id)}
                            className={`
                                group relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-300
                                ${type.disabled ? 'opacity-60 cursor-not-allowed border-[#9E7676]/10 bg-neutral-50/50' :
                                    selectedType === type.id ? 'border-[#815B5B] bg-[#FFF0D6] shadow-md scale-[1.02]' :
                                        'border-[#594545]/10 bg-white hover:border-[#815B5B]/40 hover:bg-[#FFF8EA] shadow-sm cursor-pointer'}
                            `}
                        >
                            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-neutral-100">
                                <img
                                    src={type.image}
                                    alt={type.title}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${!type.disabled && 'group-hover:scale-110'}`}
                                />
                            </div>
                            <h3 className={`font-sans text-sm font-bold mb-1 ${selectedType === type.id ? 'text-[#815B5B]' : 'text-[#594545]'}`}>
                                {type.title}
                            </h3>
                            <p className="text-[11px] leading-relaxed text-[#9E7676]">
                                {type.description}
                            </p>

                            {type.disabled && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[1px] rounded-2xl">
                                    <span className="bg-[#594545] text-[#FFF8EA] px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                                        Coming Soon
                                    </span>
                                </div>
                            )}

                            {!type.disabled && selectedType === type.id && (
                                <div className="absolute top-2 right-2 bg-[#815B5B] text-white p-1 rounded-full shadow-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-lg">
                    <label
                        className={`
                            relative flex flex-col items-center justify-center w-full h-44 
                            border-2 border-dashed rounded-2xl cursor-pointer transition-all
                            ${loading ? 'bg-[#FFF8EA]/50 border-[#9E7676]/30 pointer-events-none' : 'bg-[#FFF8EA] border-[#815B5B]/40 hover:border-[#815B5B] hover:bg-[#FFF0D6]'}
                        `}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {loading ? (
                                <Loader2 className="w-10 h-10 text-[#815B5B] animate-spin mb-3" />
                            ) : isDone ? (
                                <CheckCircle2 className="w-10 h-10 text-green-600 mb-3" />
                            ) : (
                                <FileUp className="w-10 h-10 text-[#815B5B] mb-3" />
                            )}
                            <p className="mb-2 text-sm text-[#594545]">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#9E7676]">MP4, MOV, or WEBM (max 100MB)</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                    </label>

                    {status && (
                        <div className="mt-4 flex items-center gap-2 justify-center">
                            {loading && <Loader2 className="w-4 h-4 text-[#815B5B] animate-spin" />}
                            <p className={`text-xs font-medium ${isDone ? 'text-green-600' : 'text-[#815B5B]'}`}>
                                {status}
                            </p>
                        </div>
                    )}
                    {/* show progress bar */}
                    {loading && (
                        <div className="mt-4 flex items-center gap-2 justify-center">
                            <div className="w-full h-2 bg-[#FFF8EA] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#815B5B] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs font-medium text-[#815B5B]">
                                {progress.toFixed(0)}%
                            </p>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}


function VideoContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const [loading, setLoading] = useState(!!url);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{ previewUrl: string, thumbnail: string, title: string } | null>(null);

    useEffect(() => {
        if (!url) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch('/api/youtube_download_link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Failed to fetch video data');
                }

                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-[#594545]">
            <div className="w-full max-w-4xl bg-[#FFF0D6] rounded-2xl border-2 border-[#594545] overflow-hidden shadow-xl grain-overlay relative">
                <div className="p-8 md:p-12 flex flex-col items-center gap-8 relative z-10">
                    {url ? <>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-3xl md:text-4xl font-sans font-bold">
                                {loading ? "Processing Video..." : "Ready to Download"}
                            </h1>
                            {url && (
                                <p className="text-[#9E7676] font-sans truncate max-w-md">
                                    {url}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex flex-col items-center gap-10">
                            {url && loading && (
                                <div className="flex flex-col items-center gap-4 py-12">
                                    <Loader2 className="w-12 h-12 text-[#815B5B] animate-spin" />
                                    <p className="text-[#815B5B] font-medium font-sans">Fetching metadata and links...</p>
                                </div>
                            )}

                            {url && error && (
                                <div className="flex flex-col items-center gap-4 py-12 text-center">
                                    <AlertCircle className="w-16 h-16 text-red-500" />
                                    <p className="text-red-500 font-bold text-xl font-sans">{error}</p>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="mt-4 rounded-full bg-[#815B5B] px-8 py-3 font-sans text-sm font-medium text-[#FFF8EA] transition-all hover:bg-[#594545]"
                                    >
                                        Try Another Link
                                    </button>
                                </div>
                            )}

                            {url && data && !loading && (
                                <div className="w-full flex flex-col md:flex-row gap-10 items-center md:items-start">
                                    {/* Left side: Thumbnail */}
                                    <div className="w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-lg border-2 border-[#594545] relative group">
                                        <img
                                            src={data.thumbnail}
                                            alt={data.title}
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-16 h-16 bg-[#815B5B] rounded-full flex items-center justify-center text-white shadow-lg">
                                                <Play className="w-8 h-8 fill-current translate-x-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Details and Actions */}
                                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-[#594545] line-clamp-2">
                                                {data.title}
                                            </h2>
                                            <div className="h-1 w-20 bg-[#815B5B] rounded-full"></div>
                                        </div>

                                        <p className="text-[#9E7676] text-sm italic">
                                            Your high-quality download link has been generated and is ready.
                                        </p>

                                        <div className="flex flex-col gap-3 mt-auto">
                                            <a
                                                href={data.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full rounded-full bg-[#815B5B] px-8 py-5 font-sans text-lg font-bold text-[#FFF8EA] transition-all hover:bg-[#594545] hover:shadow-xl flex items-center justify-center gap-3 active:scale-95"
                                            >
                                                <Download className="w-6 h-6" />
                                                Download Video
                                            </a>

                                            <button
                                                onClick={() => window.location.href = '/'}
                                                className="w-full rounded-full border-2 border-[#815B5B] px-8 py-4 font-sans text-sm font-medium text-[#815B5B] transition-all hover:bg-[#815B5B] hover:text-[#FFF8EA] text-center"
                                            >
                                                Extract Another
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                        : <h1 className="text-3xl md:text-4xl font-sans font-bold">
                            Video Processing Studio
                        </h1>}
                    <VideoUploadSection />
                </div>
            </div>
        </main>
    );
}

export default function VideoPage() {
    return (
        <div className="bg-[#FFF8EA] flex flex-col">
            <VDFHeader fixed={false} />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#815B5B] animate-spin" />
                </div>
            }>
                <VideoContent />
            </Suspense>
            <VDFFooter />
        </div>
    );
}
