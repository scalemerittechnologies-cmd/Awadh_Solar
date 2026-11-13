import 'server-only'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { queryD1, usesCloudflareD1 } from '@/lib/cloudflare-storage'

export type LeadRecord = {
  leadId: string
  createdAt: string
  name: string
  phone: string
  requirement: string
  billRange: string
  locality: string
  consent: boolean
  source: string
  ip: string
  sheetSynced: boolean
}

const leadsFile = path.join(process.cwd(), 'data', 'leads.json')

export async function saveLead(lead: LeadRecord) {
  if (usesCloudflareD1()) {
    await queryD1(
      'INSERT INTO leads (lead_id, created_at, payload, sheet_synced) VALUES (?, ?, ?, ?)',
      [lead.leadId, lead.createdAt, JSON.stringify(lead), lead.sheetSynced ? '1' : '0'],
    )
    return
  }
  await mkdir(path.dirname(leadsFile), { recursive: true })
  let existing: LeadRecord[] = []
  try { existing = JSON.parse(await readFile(leadsFile, 'utf8')) as LeadRecord[] }
  catch { /* First enquiry on this local server. */ }
  const temp = `${leadsFile}.${crypto.randomUUID()}.tmp`
  await writeFile(temp, JSON.stringify([lead, ...existing].slice(0, 500), null, 2), { mode: 0o600 })
  await rename(temp, leadsFile)
}

export async function markLeadSynced(leadId: string) {
  if (usesCloudflareD1()) {
    await queryD1("UPDATE leads SET sheet_synced = 1, payload = json_set(payload, '$.sheetSynced', json('true')) WHERE lead_id = ?", [leadId])
    return
  }
  const leads = JSON.parse(await readFile(leadsFile, 'utf8')) as LeadRecord[]
  const lead = leads.find(item => item.leadId === leadId)
  if (!lead) return
  lead.sheetSynced = true
  const temp = `${leadsFile}.${crypto.randomUUID()}.tmp`
  await writeFile(temp, JSON.stringify(leads, null, 2), { mode: 0o600 })
  await rename(temp, leadsFile)
}
