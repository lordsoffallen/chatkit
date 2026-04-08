import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3, S3_BUCKET } from "@/lib/storage";
import { getPublicUrl } from "@/lib/storage/utils";

export interface StorageResult {
  key: string;
  url: string;
}

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export async function uploadFromUrl(
  sourceUrl: string,
  key: string,
  options: UploadOptions = {}
): Promise<StorageResult> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch source URL (${response.status}): ${sourceUrl}`
    );
  }

  const buffer = await response.arrayBuffer();
  const contentType =
    options.contentType ??
    response.headers.get("content-type") ??
    "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: contentType,
      Metadata: options.metadata,
    })
  );

  return { key, url: getPublicUrl(key) };
}

export async function uploadBuffer(
  buffer: Buffer | ArrayBuffer,
  key: string,
  options: UploadOptions = {}
): Promise<StorageResult> {
  const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: options.contentType ?? "application/octet-stream",
      Metadata: options.metadata,
    })
  );

  return { key, url: getPublicUrl(key) };
}
