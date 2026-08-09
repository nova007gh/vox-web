// Cloudinary Configuration
// Sign up at https://cloudinary.com and get your cloud name + create an unsigned upload preset
// Dashboard: Settings > Upload > Upload presets > Add unsigned preset

export const CLOUDINARY_CLOUD_NAME: string = "ugigwumr";
export const CLOUDINARY_UPLOAD_PRESET: string = "vox_uploads";

/** Upload a file to Cloudinary and return its secure URL */
export async function uploadToCloudinary(file: Blob | File): Promise<{ url: string; id: string }> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // Use "auto" resource type so it handles both images and videos
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    id: data.public_id,
  };
}

/** Delete a file from Cloudinary (requires signed request - not used client-side) */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Deletion requires a signed request with API secret
  // This would need a server-side endpoint
  console.warn("Cloudinary deletion requires server-side signed request:", publicId);
}

export const isCloudinaryConfigured = () =>
  CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME" &&
  CLOUDINARY_UPLOAD_PRESET !== "YOUR_UPLOAD_PRESET";
