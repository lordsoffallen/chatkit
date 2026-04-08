import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";

export const s3 = new S3Client({ region });

export const S3_BUCKET = process.env.AWS_S3_BUCKET ?? "";
