CREATE TABLE IF NOT EXISTS site_content (
  site_key TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL,
  sheet_synced INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

CREATE TABLE IF NOT EXISTS media (
  filename TEXT PRIMARY KEY,
  content_base64 TEXT NOT NULL,
  created_at TEXT NOT NULL
);
