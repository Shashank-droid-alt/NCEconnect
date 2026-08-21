export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        const rad = (rotation * Math.PI) / 180;
        const isRotated90or270 = rotation % 180 !== 0;

        // Dimensions of rotated image
        const rotWidth = isRotated90or270 ? image.naturalHeight : image.naturalWidth;
        const rotHeight = isRotated90or270 ? image.naturalWidth : image.naturalHeight;

        // Intermediate canvas for rotated image
        const rotCanvas = document.createElement('canvas');
        rotCanvas.width = rotWidth;
        rotCanvas.height = rotHeight;
        const rotCtx = rotCanvas.getContext('2d');

        if (!rotCtx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw rotated image onto intermediate canvas
        rotCtx.translate(rotWidth / 2, rotHeight / 2);
        rotCtx.rotate(rad);
        rotCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

        // Final crop canvas
        const cropCanvas = document.createElement('canvas');
        const targetW = Math.max(1, Math.round(pixelCrop.width));
        const targetH = Math.max(1, Math.round(pixelCrop.height));
        cropCanvas.width = targetW;
        cropCanvas.height = targetH;
        const cropCtx = cropCanvas.getContext('2d');

        if (!cropCtx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw cropped portion from rotCanvas
        cropCtx.drawImage(
          rotCanvas,
          Math.max(0, Math.round(pixelCrop.x)),
          Math.max(0, Math.round(pixelCrop.y)),
          targetW,
          targetH,
          0,
          0,
          targetW,
          targetH
        );

        resolve(cropCanvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        reject(err);
      }
    };

    image.onerror = (error) => {
      reject(error);
    };

    image.src = imageSrc;
  });
};

