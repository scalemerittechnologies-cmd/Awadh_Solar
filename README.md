# Awadh_Solar

Awadh Solar website built with Next.js.

## Local development

Install dependencies with `npm install`, copy `.env.example` to `.env.local` and configure your own values, then run `npm run dev`.

## Checks

Run `npm run typecheck`, `npm run lint`, and `npm run build`.

Private environment values, enquiry records and integration secrets are excluded from version control. See `ADMIN_SETUP.md` for administration setup.

## Vercel production storage

Use Cloudflare D1 for site content, settings and enquiries, and Cloudflare R2 for admin-uploaded photos. Complete [the Cloudflare and Vercel setup](docs/CLOUDFLARE_VERCEL_SETUP.md) before deploying.

For a new GitHub account, follow [the repository handoff checklist](docs/NEW_GITHUB_VERCEL_DEPLOY.md). GitHub Actions runs typecheck, lint and build on pushes and pull requests.
