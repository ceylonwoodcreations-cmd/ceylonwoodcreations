/**
 * Client-side Image Compression & ImgBB API Upload Utilities
 * Compresses images automatically to ~100KB before uploading
 */

export const DEFAULT_IMGBB_API_KEY = '930db79e185bb97f9f7f8bcec798f35f';

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  originalKB: number;
  compressedKB: number;
}

export async function compressImageToTarget(
  file: File,
  targetKB: number = 100
): Promise<CompressionResult> {
  const originalKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('කරුණාකර වලංගු පින්තූරයක් (JPG, PNG, WEBP) තෝරන්න.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('පින්තූරය කියවීමට නොහැකි විය.'));
    
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('පින්තූරය load කිරීමට නොහැකි විය.'));
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale large camera images (max dimension 1200px for sharp web view)
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context error'));
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Quality iteration to reach targetKB (around 100KB)
        let quality = 0.82;
        const step = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression error'));
              const currentKB = Math.round(blob.size / 1024);

              // If still significantly larger than targetKB and quality can be reduced further
              if (currentKB > targetKB && q > 0.35) {
                step(Math.max(0.3, q - 0.12));
              } else {
                const dataUrl = canvas.toDataURL('image/jpeg', q);
                resolve({
                  blob,
                  dataUrl,
                  originalKB,
                  compressedKB: currentKB,
                });
              }
            },
            'image/jpeg',
            q
          );
        };

        step(quality);
      };
      
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image blob to ImgBB via their API
 */
export async function uploadToImgBB(blob: Blob, apiKey?: string): Promise<string> {
  const cleanKey = (apiKey || DEFAULT_IMGBB_API_KEY).trim();
  if (!cleanKey) {
    throw new Error('ImgBB API Key එක ඇතුළත් කර නොමැත. කරුණාකර API Key එක සකසන්න.');
  }

  const formData = new FormData();
  formData.append('image', blob);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(cleanKey)}`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data?.error?.message || 'ImgBB upload එක අසාර්ථක විය. API Key එක නිවැරදි දැයි පරීක්ෂා කරන්න.';
    throw new Error(errorMsg);
  }

  return data.data.display_url || data.data.url;
}
