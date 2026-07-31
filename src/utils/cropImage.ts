export interface CropArea {
  x: number; // percentage 0-100 or pixels
  y: number;
  width: number;
  height: number;
}

export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Output size matches requested crop dimensions
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.save();

      // Translate context to center of canvas for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw original image shifted by crop offset
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      ctx.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};
