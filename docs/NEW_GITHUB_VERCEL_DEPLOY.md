# Move this website to a new GitHub account

The current `origin` points to `yakash4184/Awadh_Solar`. The website has local changes that are not committed yet. Do not push this working tree to the old remote by accident.

## Account handoff

1. Create and verify the new GitHub account at [GitHub signup](https://github.com/signup). Complete its password, verification and any terms yourself. Share only the new username with the developer.
2. Sign in with the new account in GitHub CLI (`gh auth login -h github.com --web`) or connect the new account through a GitHub integration. The old CLI tokens on this computer currently report as invalid.
3. Create a **private** empty repository in the new account, for example `awadh-solar-website`. Do not initialize it with a README or license because this project already has a Git history.
4. Commit the current website changes after reviewing `git status`. `.env.local`, `data/`, `node_modules/` and `.next/` are ignored and must remain out of Git.
5. Add the new repository as a separate remote (for example `new-origin`), push `main`, and verify the repository on GitHub. Change `origin` only after the new push is verified.

## Deployment

1. Complete [Cloudflare D1 and R2 setup](CLOUDFLARE_VERCEL_SETUP.md), including the local data migration, before the first live deployment.
2. Import the **new** GitHub repository into Vercel as a new Next.js project. Vercel's Git integration handles deployment on pushes; `.github/workflows/ci.yml` runs typecheck, lint and build on GitHub.
3. Add the Cloudflare and admin environment variables to the Vercel project before releasing it. Keep production and preview data separate.
4. Verify the homepage, admin save, photo upload and a test enquiry on the deployed URL.

The existing Vercel project `awadh` is linked to the old GitHub account. Importing a new repository as a new Vercel project avoids changing the old site's connection while the new deployment is tested.
