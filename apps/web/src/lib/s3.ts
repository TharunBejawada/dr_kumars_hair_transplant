import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "node:crypto";

function resolveCredentials() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV) {
    return undefined;
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    };
  }
  return undefined;
}

const credentials = resolveCredentials();
const s3 = new S3Client({
  region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
  ...(credentials ? { credentials } : {}),
});

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/jfif": "jpg",
  "image/pjpeg": "jpg",
  "image/x-png": "png",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function mediaBucket() {
  const b = process.env.S3_MEDIA_BUCKET;
  if (!b) throw new Error("S3_MEDIA_BUCKET is not configured");
  return b;
}

/** Presigned POST locked to one key, one content-type and a max size – the browser uploads straight to S3. */
export async function presignImageUpload(contentType: string) {
  const normType = contentType.toLowerCase().trim();
  const ext = IMAGE_TYPES[normType];
  if (!ext) throw new Error(`Unsupported image type: ${contentType}`);
  const key = `blogs/${randomUUID()}.${ext}`;
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: mediaBucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_IMAGE_BYTES],
      ["eq", "$Content-Type", normType],
    ],
    Fields: { "Content-Type": normType },
    Expires: 300, // 5 minutes
  });
  return { url, fields, publicPath: `/api/media/${key}` };
}

/** Direct upload helper for server-side fallback */
export async function uploadDirectMedia(buffer: Buffer | Uint8Array, contentType: string, extension?: string) {
  const normType = contentType.toLowerCase().trim();
  const ext = extension || IMAGE_TYPES[normType] || "jpg";
  const key = `blogs/${randomUUID()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: mediaBucket(),
      Key: key,
      Body: buffer,
      ContentType: normType,
    })
  );
  return { publicPath: `/api/media/${key}` };
}

export const getMedia = (key: string) => s3.send(new GetObjectCommand({ Bucket: mediaBucket(), Key: key }));
