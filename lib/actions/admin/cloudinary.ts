"use server";

import { createHash } from "crypto";
import { requireAdmin } from "@/lib/auth";

export interface CloudinarySignaturePayload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export async function getCloudinaryUploadSignature(
  folder: string
): Promise<CloudinarySignaturePayload> {
  await requireAdmin();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary тохиргоо дутуу байна (.env.local-д CLOUDINARY-ийн утгуудыг тохируулна уу)."
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return { cloudName, apiKey, timestamp, folder, signature };
}
