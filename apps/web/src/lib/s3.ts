import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "node:crypto";

const s3 = new S3Client({ region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1" });

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function mediaBucket() {
  const b = process.env.S3_MEDIA_BUCKET;
  if (!b) throw new Error("S3_MEDIA_BUCKET is not configured");
  return b;
}

/** Presigned POST locked to one key, one content-type and a max size – the browser uploads straight to S3. */
export async function presignImageUpload(contentType: string) {
  const ext = IMAGE_TYPES[contentType];
  if (!ext) throw new Error("Unsupported image type");
  const key = `blogs/${randomUUID()}.${ext}`;
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: mediaBucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_IMAGE_BYTES],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: { "Content-Type": contentType },
    Expires: 120,
  });
  return { url, fields, publicPath: `/api/media/${key}` };
}

export const getMedia = (key: string) => s3.send(new GetObjectCommand({ Bucket: mediaBucket(), Key: key }));
