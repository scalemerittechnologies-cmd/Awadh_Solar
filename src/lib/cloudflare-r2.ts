import 'server-only'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const accountIdPattern = /^[a-f0-9]{32}$/i
const bucketPattern = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/

let r2Client: S3Client | undefined
function r2Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET?.trim()
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim()
  if (!accountId && !bucket && !accessKeyId && !secretAccessKey) {
    if (process.env.NODE_ENV === 'production') throw new Error('Cloudflare R2 is required in production.')
    return null
  }
  if (!accountIdPattern.test(accountId ?? '') || !bucketPattern.test(bucket ?? '') || !accessKeyId || !secretAccessKey) {
    throw new Error('Set a valid Cloudflare account ID, R2 bucket, access key and secret.')
  }
  return { accountId: accountId!, bucket: bucket!, accessKeyId, secretAccessKey }
}

export function usesCloudflareR2() { return Boolean(r2Config()) }

function r2() {
  const config = r2Config()
  if (!config) throw new Error('Cloudflare R2 is not configured.')
  r2Client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    forcePathStyle: true,
  })
  return { client: r2Client, bucket: config.bucket }
}

export async function putR2Image(filename: string, content: Buffer) {
  const { client, bucket } = r2()
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: filename, Body: content,
    ContentType: 'image/webp', CacheControl: 'public, max-age=604800, immutable',
  }))
}

export async function getR2Image(filename: string): Promise<Uint8Array | null> {
  const { client, bucket } = r2()
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: filename }))
    if (!result.Body) return null
    return await result.Body.transformToByteArray()
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && ['NoSuchKey', 'NotFound'].includes(String(error.name))) return null
    throw error
  }
}
