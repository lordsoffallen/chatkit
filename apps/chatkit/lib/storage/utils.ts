import "server-only";

import { S3_BUCKET } from "@/lib/storage";
import { generateUUID } from "@/lib/utils";

export function getPublicUrl(key: string): string {
  const cdnUrl = process.env.AWS_S3_CDN_URL;
  if (cdnUrl) {
    return `${cdnUrl.replace(/\/$/, "")}/${key}`;
  }

  const region = process.env.AWS_S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  return `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
}

export function generateStorageKey(prefix: string, ext: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = generateUUID();
  return `${prefix}/${year}/${month}/${id}.${ext}`;
}
