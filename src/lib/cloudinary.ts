/**
 * Cloudinary Media Uploader Utility
 * Uploads images, avatars, or media files to Cloudinary and returns a secure HTTPS URL link.
 * Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in environment variables.
 * Falls back gracefully to base64 Data URLs if keys are not yet configured.
 */

export async function uploadToCloudinary(file: File | Blob | string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'yqkvgrtl';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'campusconnect_unsigned';

  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      } else {
        const errorText = await res.text();
        console.warn('Cloudinary upload responded with error status:', res.status, errorText);
      }
    } catch (err) {
      console.error('Failed to upload file to Cloudinary:', err);
    }
  }

  // Graceful Fallback if Cloudinary is not configured yet or network request fails:
  if (typeof file === 'string') {
    return file;
  }

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
