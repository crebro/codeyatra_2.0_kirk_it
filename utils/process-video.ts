import type { FFmpeg } from "@ffmpeg/ffmpeg";
import imageToRGBA from "./rgba-standardization";
import rmsDiff from "./rms-diffs";
import { imagesToOriginalSizePdf } from "./load-image-from-blob";

const getMetadata = (inputFile: string, ffmpeg: FFmpeg): Promise<string> => {
    return new Promise((resolve) => {
        let log = '';
        let metadataLogger = ({ message }: { message: string }) => {
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
    var metadata = await getMetadata(inputFile, ffmpeg);
    var patt = /Duration:\s*([0-9]{2}):([0-9]{2}):([0-9]{2}.[0-9]{0,2})/gm
    let m = patt.exec(metadata);

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
    let duration = await getDuration(inputFile, ffmpeg);

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

    // Extract one frame every 10 seconds
    await ffmpeg.exec([
        '-i', inputFile,
        '-vf', `fps=1/10`, 
        'output_%04d.png'
    ]);

    let extractedFrames: ExtractedFrame[] = [];
    let uint8Store: Uint8Array | null = null;
    const interval = 10;

    for (let i = 1; i <= Math.floor(duration / interval); i++) {
        console.log(`Processing frame ${i}`);
        try {
            const fileName = `output_${i.toString().padStart(4, '0')}.png`;
            const data = await ffmpeg.readFile(fileName);
            // @ts-expect-error
            let buffer = data.buffer;
            let uint8barrayitem = new Uint8Array(buffer);
            
            // standardize the image to RGBA format for comparison
            let rgbaImage = await imageToRGBA(uint8barrayitem);
            let currentUint8 = rgbaImage.arrayInstance;

            if (uint8Store === null) {
                uint8Store = currentUint8;
            } else {
                if (uint8Store.length === currentUint8.length && rmsDiff(uint8Store, currentUint8) < 5) {
                    console.log(`Skipping frame ${i} as it is identical to the previous frame.`);
                    continue; // Skip identical frames
                }
                uint8Store = currentUint8;
            }

            extractedFrames.push({
                blob: new Blob([uint8barrayitem], { type: 'image/png' }),
                timestamp: (i - 1) * interval,
                index: i
            });
        } catch (e) {
            console.log(`Error reading file output_${i.toString().padStart(4, '0')}.png: ${e}`);
            break; 
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

