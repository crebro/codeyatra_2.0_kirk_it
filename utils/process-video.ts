import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { parseSSIM } from "./comparison-utils";
import { imagesToOriginalSizePdf } from "./load-image-from-blob";

const getMetadata = (inputFile: string, ffmpeg: FFmpeg): Promise<string> => {
    return new Promise((resolve) => {
        let log = '';
        const metadataLogger = ({ message }: { message: string }) => {
            log += message;
            if (message.indexOf('Aborted()') > -1) {
                ffmpeg.off('log', metadataLogger);
                resolve(log);
            }
        };
        ffmpeg.on('log', metadataLogger);
        ffmpeg.exec(["-i", inputFile]);
    });
};

export const getDuration = async (inputFile: string, ffmpeg: FFmpeg) => {
    const metadata = await getMetadata(inputFile, ffmpeg);
    const patt = /Duration:\s*([0-9]{2}):([0-9]{2}):([0-9]{2}.[0-9]{0,2})/gm
    const m = patt.exec(metadata);

    if (!m) return 0;

    const hours = parseFloat(m[1]);
    const minutes = parseFloat(m[2]);
    const seconds = parseFloat(m[3]);

    return (hours * 3600) + (minutes * 60) + seconds;
};

export interface ExtractedFrame {
    blob: Blob;
    timestamp: number;
    index: number;
}

export const extractFrames = async (
    inputFile: string,
    ffmpeg: FFmpeg,
    logCallback: (message: { message: string }) => void,
    progressCallback: (progress: number) => void
): Promise<ExtractedFrame[]> => {
    const duration = await getDuration(inputFile, ffmpeg);

    ffmpeg.on('log', (message: { message: string }) => {
        logCallback(message);

        const match = message.message.match(/time=(\d{2}:\d{2}:\d{2})/);
        if (match) {
            const time = match[1];
            const [hours, minutes, seconds] = time.split(':').map(Number);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            const progress = (totalSeconds) / duration * 100;
            progressCallback(progress);
        }
    });


    const interval = 5;

    // Extract one frame every (interval) seconds
    await ffmpeg.exec([
        '-i', inputFile,
        '-vf', `fps=1/${interval}`,
        'output_%04d.png'
    ]);

    const extractedFrames: ExtractedFrame[] = [];
    let isLastFrameExtracted = false;
    const nFrames = Math.floor(duration / interval);

    let pastFilename: string | undefined;

    for (let i = 1; i <= nFrames; i++) {
        // console.log(`Processing frame ${i}`);
        try {
            const fileName = `output_${i.toString().padStart(4, '0')}.png`;

            if (!pastFilename) {
                pastFilename = fileName;
            }

            await ffmpeg.exec([
                '-i', fileName,
                '-i', pastFilename,
                '-lavfi', 'ssim=stats_file=ssim.txt',
                '-f', 'null',
                '-'
            ]);

            const stats = await ffmpeg.readFile('ssim.txt');

            const decoded = new TextDecoder().decode(new Uint8Array(stats as unknown as ArrayBuffer));

            const sim = parseSSIM(decoded);

            if (sim < 0.90) {
                const data = await ffmpeg.readFile(pastFilename);
                // @ts-expect-error
                const buffer = data.buffer;

                const loadedUint8 = new Uint8Array(buffer);

                extractedFrames.push({
                    blob: new Blob([loadedUint8] , { type: 'image/png' }),
                    timestamp: (i - 1) * interval,
                    index: i
                });

                if (i === nFrames) {
                    isLastFrameExtracted = true;
                }

                pastFilename = fileName;
            }
        } catch (e) {
            console.log(`Error reading file output_${i.toString().padStart(4, '0')}.png: ${e}`);
            break;
        }
    }

    // add last frame to extracted frames, but check if the final frame was just added
    if (!isLastFrameExtracted) {
        try {
            const fileName = `output_${nFrames.toString().padStart(4, '0')}.png`;
            const data = await ffmpeg.readFile(fileName);
            // @ts-expect-error
            const buffer = data.buffer;
            const uint8barrayitem = new Uint8Array(buffer);

            extractedFrames.push({
                blob: new Blob([uint8barrayitem], { type: 'image/png' }),
                timestamp: (nFrames - 1) * interval,
                index: nFrames
            });
        } catch (e) {
            console.log(`Error reading file output_${nFrames.toString().padStart(4, '0')}.png: ${e}`);
        }

    }

    return extractedFrames;
}

// Keep for backward compatibility or simple one-off conversions if needed, 
// but refactored to use extractFrames
export const convertToPdf = async (inputFile: string, ffmpeg: FFmpeg, logCallback: (message: { message: string }) => void, progressCallback: (progress: number) => void) => {
    const frames = await extractFrames(inputFile, ffmpeg, logCallback, progressCallback);

    // Convert blobs to HTMLImageElement
    const images: HTMLImageElement[] = await Promise.all(frames.map(frame => {
        return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(frame.blob);
        });
    }));

    const pdfBlob = await imagesToOriginalSizePdf(images);
    if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video2doc-output.pdf';
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            images.forEach(img => URL.revokeObjectURL(img.src));
        }, 100);
    }
}

