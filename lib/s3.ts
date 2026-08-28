import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  publicUrl: string;
  key: string;
}

/**
 * Creates a presigned PUT URL so the browser can upload an image directly
 * to S3, plus the public URL the object will be reachable at afterwards
 * (the bucket is expected to allow public reads on the `listings/` prefix,
 * or to be served through CloudFront).
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

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
}
