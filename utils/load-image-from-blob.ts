import { jsPDF } from 'jspdf';

export async function imagesToOriginalSizePdf(imageInstances: HTMLImageElement[], options = {
  unit: 'px', // Using pixels to match image dimensions
  compress: true // Compress PDF to reduce file size
}) {
  if (imageInstances.length === 0) return;

  let pdf: jsPDF | null = null;

  for (let i = 0; i < imageInstances.length; i++) {
    const img = imageInstances[i];

    // Wait for image to load if not already loaded
    if (!img.complete) {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to load image at index ${i}`));
      });
    }

    const imgWidth = img.width;
    const imgHeight = img.height;

    if (i === 0) {
      // Create first page using image dimensions
      pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "px",
        format: [imgWidth, imgHeight],
        compress: options.compress
      });
    } else {
      // Add page with exact image dimensions
      pdf!.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? "landscape" : "portrait");
    }

    pdf!.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight, undefined, options.compress ? 'FAST' : 'NONE');
  }

  return pdf?.output('blob');
}

export default async function loadImageFromBlob(blobUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = blobUrl;
  });
}