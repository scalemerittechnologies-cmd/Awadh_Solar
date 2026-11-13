# Cloudflare storage with Vercel deployment

The Next.js app runs on Vercel. Cloudflare D1 stores website content, admin enquiry settings, and customer enquiries. Cloudflare R2 stores photos uploaded through the admin dashboard. R2 stays private; the website serves those images through `/api/media/[filename]`.

The browser compresses selected photos before upload, and the server keeps served WebP images under 4 MB to fit [Vercel's 4.5 MB function payload limit](https://vercel.com/docs/functions/limitations). The original image picker accepts files up to 8 MB.

## 1. Create Cloudflare resources

1. In the Cloudflare dashboard, create a **D1 database**, for example `awadh-website`. Copy its database ID and your 32-character account ID.
2. Create an **R2 Standard storage bucket**, for example `awadh-media`. It does not need a public `r2.dev` URL or custom domain.
3. Create a Cloudflare API token with D1 read and write access to this account/database. Copy the token.
4. In R2 **Manage API tokens**, create an access key with **Object Read & Write** access limited to the new bucket. Copy the access key ID and secret. Do not use the Cloudflare global API key.

Cloudflare documentation: [D1 API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/), [R2 S3 credentials](https://developers.cloudflare.com/r2/get-started/s3/).

## 2. Add local environment variables

Add these private values to the existing `.env.local` file in the project root:

```dotenv
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_D1_DATABASE_ID=...
CLOUDFLARE_D1_API_TOKEN=...
CLOUDFLARE_R2_BUCKET=awadh-media
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
```

The names and sample values are also in `.env.example`. Keep `.env.local` private. These variables have no `NEXT_PUBLIC_` prefix.

## 3. Initialize and migrate

From the project root, run:

```bash
node --env-file=.env.local scripts/setup-cloudflare.mjs
```

This creates the D1 tables from `cloudflare/schema.sql`, copies the current `data/site-content.json` and optional `data/enquiry-settings.json` and `data/leads.json`, and uploads existing `data/uploads/*.webp` photos to R2. Existing D1 content is left untouched, and existing R2 photos are skipped. Run it **before the first Vercel deployment**, because the local `data/` folder is intentionally excluded from Git.

If the script fails, fix the reported account ID, database ID, token permission, bucket name, or R2 key before deploying. Never paste tokens into GitHub.

## 4. Connect GitHub to Vercel

1. Push the website repository to GitHub and import it as a **Next.js** project in Vercel. Vercel's Git integration builds on every push and makes preview deployments for branches automatically; a separate GitHub Actions workflow is unnecessary.
2. In Vercel **Project Settings → Environment Variables**, add the six `CLOUDFLARE_*` variables above and the existing `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`. Set them for Production, and for Preview too if you want preview deployments to use Cloudflare. Prefer a separate D1 database and R2 bucket for Preview to keep test edits away from production.
3. Deploy after the migration script succeeds. The build command is `npm run build`.

Vercel documentation: [Git deployments](https://vercel.com/docs/git), [environment variables](https://vercel.com/docs/environment-variables).

## 5. Verify after deployment

Sign in at `/admin/login`, change a project title, and click **Save & publish**. Refresh the live website to confirm it persists. Upload a new photo, refresh, and open its image URL to confirm R2 reads. Submit a test enquiry and check the `leads` table in D1. The website returns an error if D1 cannot save an enquiry; it does not report success for a failed database write.

The Google Form and Sheet links in **Admin → Enquiries** are saved as settings in D1. A link alone does not deliver website enquiries to Google Sheets. For that, set up the separate Apps Script webhook in [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md). D1 remains the primary enquiry record even when Sheets sync is enabled.

## Local development

Without Cloudflare variables, `npm run dev` continues to read/write local `data/` files. With the variables in `.env.local`, local development uses the same D1/R2 resources as those credentials point to. The production deployment requires Cloudflare credentials and the initialized D1 tables.
