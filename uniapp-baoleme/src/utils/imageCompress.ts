/** H5 / App 通用的图片压缩（H5 无 uni.compressImage） */

function qualityToRatio(quality: number): number {
  return Math.min(0.92, Math.max(0.35, quality / 100));
}

/** Canvas 压缩，返回 blob: URL */
export function compressImageWithCanvas(src: string, quality: number): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxSide = 1280;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxSide || h > maxSide) {
        if (w >= h) {
          h = Math.round((h * maxSide) / w);
          w = maxSide;
        } else {
          w = Math.round((w * maxSide) / h);
          h = maxSide;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(src);
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        qualityToRatio(quality)
      );
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function canUseUniCompressImage(): boolean {
  return typeof uni !== 'undefined' && typeof uni.compressImage === 'function';
}
