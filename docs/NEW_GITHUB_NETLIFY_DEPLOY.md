# GitHub and Netlify deployment

The clean GitHub repository is [scalemerittechnologies-cmd/Awadh_Solar](https://github.com/scalemerittechnologies-cmd/Awadh_Solar). `main` is the production branch. Its commits use the `scalemerittechnologies-cmd` GitHub identity. The old Vercel project remains linked to the old repository and is not part of this deployment.

## Deployment checklist

1. Complete [Cloudflare D1 setup](CLOUDFLARE_NETLIFY_SETUP.md). The database `awadh-website` and its tables have been created and the current site content has been copied. Keep the D1 API token private.
2. Import the GitHub repository into a **Netlify Free** team as a Next.js site. Authorize only this repository for Netlify's GitHub integration if the option is available.
3. Before production deploy, set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_D1_API_TOKEN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Netlify's server-side environment settings. Do not put any secret in GitHub or a `NEXT_PUBLIC_` variable.
4. Use `npm run build`. Netlify automatically provisions the Next.js adapter for SSR and route handlers. GitHub Actions separately runs typecheck, lint and build on pushes and pull requests.
5. Test the homepage, admin save, photo upload and a test enquiry on the deployed URL. Confirm the edits and enquiry in D1.

Netlify Free has a hard monthly credit limit. Reaching it pauses the site until the next cycle; it does not incur an overage charge. Keep production and deploy-preview D1 databases separate if preview edits are needed.
