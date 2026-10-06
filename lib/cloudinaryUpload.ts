import { getCloudinaryUploadSignature } from "@/lib/actions/admin/cloudinary";

/**
 * Uploads a file from the admin's browser straight to Cloudinary, signed by
 * the server, reporting progress as it goes. Videos use the video endpoint so
 * the response includes their length.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (fraction: number) => void
): Promise<{ url: string; duration: number }> {
  const { cloudName, apiKey, timestamp, signature } = await getCloudinaryUploadSignature(folder);
  const resource = file.type.startsWith("video/") ? "video" : "auto";

  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    body.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data: { secure_url?: string; duration?: number; error?: { message?: string } } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // Fall through to the generic error below.
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve({ url: data.secure_url, duration: Number(data.duration) || 0 });
      } else {
        reject(new Error(data.error?.message ?? `Cloudinary алдаа (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Интернэт тасарсан байж магадгүй."));
    xhr.send(body);
  });
}
