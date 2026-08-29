import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

/**
 * Photo uploads are an optional feature in a sandbox/demo deployment: if
 * AWS credentials aren't configured we degrade gracefully instead of
 * crashing the app or failing the build.
 */
export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_REGION &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
  );
}

export const S3_NOT_CONFIGURED_MESSAGE =
  "Photo uploads are disabled: S3 is not configured on this server. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME to enable them.";

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

/** Reads and validates S3 env vars, narrowing them to plain strings. */
function getS3Config(): S3Config {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(S3_NOT_CONFIGURED_MESSAGE);
  }

  return { region, accessKeyId, secretAccessKey, bucketName };
}

let cachedClient: S3Client | null = null;
let cachedClientRegion: string | null = null;

function getClient(config: S3Config): S3Client {
  if (!cachedClient || cachedClientRegion !== config.region) {
    cachedClient = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    cachedClientRegion = config.region;
  }
  return cachedClient;
}

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isAllowedImageContentType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(contentType);
}

export interface PresignedUpload {
  uploadUrl: string;
  fields: Record<string, string>;
  publicUrl: string;
  key: string;
}

/** Listing photos are capped at 10 MB — plenty for a photo, small enough
 * that a compromised or careless host account can't run up storage cost. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Creates a presigned POST (not PUT) so the browser can upload an image
 * directly to S3, plus the public URL the object will be reachable at
 * afterwards (the bucket is expected to allow public reads on the
 * `listings/` prefix, or to be served through CloudFront).
 *
 * A presigned PUT URL has no way to cap the upload size — S3 only checks
 * that against a policy document, which only presigned POST supports (via
 * a `content-length-range` condition). That's the whole reason this uses
 * POST here instead of the simpler PUT.
 */
export async function createPresignedUpload(
  listingId: string,
  filename: string,
  contentType: string
): Promise<PresignedUpload> {
  const config = getS3Config();
  const client = getClient(config);
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `listings/${listingId}/${Date.now()}-${safeName}`;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: config.bucketName,
    Key: key,
    Conditions: [
      ["content-length-range", 0, MAX_UPLOAD_BYTES],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 60 * 5,
  });

  const publicUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;

  return { uploadUrl: url, fields, publicUrl, key };
}
