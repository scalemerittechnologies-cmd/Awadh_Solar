# Awadh_Solar

Awadh Solar website built with Next.js.

## Local development

Install dependencies with `npm install`, copy `.env.example` to `.env.local` and configure your own values, then run `npm run dev`.

## Checks

Run `npm run typecheck`, `npm run lint`, and `npm run build`.

Private environment values, enquiry records and integration secrets are excluded from version control. See `ADMIN_SETUP.md` for administration setup.

## Free production storage

Use Cloudflare D1 for site content, settings, enquiries and admin-uploaded photos. Complete [the Cloudflare and Netlify setup](docs/CLOUDFLARE_NETLIFY_SETUP.md) before deploying.

For this GitHub account, follow [the deployment checklist](docs/NEW_GITHUB_NETLIFY_DEPLOY.md). GitHub Actions runs typecheck, lint and build on pushes and pull requests.
