import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const required = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'CLOUDFLARE_D1_API_TOKEN',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
]
const missing = required.filter(name => !process.env[name])
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)

const account = process.env.CLOUDFLARE_ACCOUNT_ID
const database = process.env.CLOUDFLARE_D1_DATABASE_ID
const bucket = process.env.CLOUDFLARE_R2_BUCKET
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`

async function query(sql, params = []) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_D1_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    signal: AbortSignal.timeout(15000),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.success || !body.result?.[0]?.success) {
    throw new Error(`D1 query failed (${response.status}): ${body?.errors?.[0]?.message ?? 'unknown error'}`)
  }
  return body.result[0].results ?? []
}

const schema = await readFile(new URL('../cloudflare/schema.sql', import.meta.url), 'utf8')
for (const statement of schema.split(';').map(part => part.trim()).filter(Boolean)) {
  await query(statement)
}
console.log('D1 tables ready.')

async function localJson(filename) {
  try { return JSON.parse(await readFile(path.join(process.cwd(), 'data', filename), 'utf8')) }
  catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

for (const [siteKey, filename] of [
  ['awadh', 'site-content.json'],
  ['awadh-enquiries', 'enquiry-settings.json'],
]) {
  const existing = await query('SELECT site_key FROM site_content WHERE site_key = ? LIMIT 1', [siteKey])
  if (existing.length) {
    console.log(`${siteKey}: already in D1, kept existing data.`)
    continue
  }
  const content = await localJson(filename)
  if (content) {
    await query(
      'INSERT INTO site_content (site_key, content, updated_at) VALUES (?, ?, ?)',
      [siteKey, JSON.stringify(content), new Date().toISOString()],
    )
    console.log(`${siteKey}: copied to D1.`)
  } else {
    console.log(`${siteKey}: no local file; site defaults will apply.`)
  }
}

const leads = await localJson('leads.json')
if (Array.isArray(leads)) {
  for (const lead of leads) {
    if (!lead?.leadId || !lead?.createdAt) continue
    await query(
      'INSERT OR IGNORE INTO leads (lead_id, created_at, payload, sheet_synced) VALUES (?, ?, ?, ?)',
      [lead.leadId, lead.createdAt, JSON.stringify(lead), lead.sheetSynced ? '1' : '0'],
    )
  }
  console.log(`Local enquiries copied: ${leads.length} checked.`)
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${account}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})
const uploadsDir = path.join(process.cwd(), 'data', 'uploads')
let filenames = []
try { filenames = (await readdir(uploadsDir)).filter(filename => /^[a-f0-9-]{20,50}\.webp$/.test(filename)) }
catch (error) { if (error?.code !== 'ENOENT') throw error }
let uploaded = 0
for (const filename of filenames) {
  let exists = false
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: filename }))
    exists = true
  } catch (error) {
    if (!['NoSuchKey', 'NotFound'].includes(error?.name)) throw error
  }
  if (exists) continue
  const image = await readFile(path.join(uploadsDir, filename))
  await r2.send(new PutObjectCommand({
    Bucket: bucket, Key: filename, Body: image,
    ContentType: 'image/webp', CacheControl: 'public, max-age=604800, immutable',
  }))
  uploaded++
}
console.log(`R2 photos: ${uploaded} uploaded, ${filenames.length - uploaded} already present.`)
console.log('Cloudflare setup complete. Deploy with the same environment variables in Vercel.')
