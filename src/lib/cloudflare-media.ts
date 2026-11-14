import 'server-only'
import { queryD1 } from '@/lib/cloudflare-storage'

// D1 limits each row and string to 2 MB. Base64 adds about one third, so keep
// stored WebP files comfortably below that limit.
export const maxD1ImageBytes = 1_250_000

export async function putD1Image(filename: string, content: Buffer) {
  if (content.byteLength > maxD1ImageBytes) throw new Error('Image exceeds the D1 media limit.')
  await queryD1(
    'INSERT INTO media (filename, content_base64, created_at) VALUES (?, ?, ?)',
    [filename, content.toString('base64'), new Date().toISOString()],
  )
}

export async function getD1Image(filename: string): Promise<Uint8Array | null> {
  const rows = await queryD1<{ content_base64: string }>(
    'SELECT content_base64 FROM media WHERE filename = ? LIMIT 1',
    [filename],
  )
  return rows[0] ? Buffer.from(rows[0].content_base64, 'base64') : null
}
