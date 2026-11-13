# Production Deployment & TinaCloud Guide (Vercel Only)

This repository is configured for deployment strictly on **Vercel** with content management powered by **TinaCMS (TinaCloud)**. Netlify and Decap CMS have been completely decommissioned.

---

## 1. Prerequisites

- A GitHub repository with this codebase (`master` branch).
- A [Vercel account](https://vercel.com).
- A [TinaCloud account](https://app.tina.io).
- Access to your domain DNS manager for `zyxen.in`.

---

## 2. TinaCloud Setup

1. **Log in to TinaCloud**: Navigate to [app.tina.io](https://app.tina.io) and sign in with GitHub.
2. **Create a New Project**:
   - Click **New Project**.
   - Connect your GitHub organization/account and select this repository.
   - Set the main branch to `master`.
   - Specify the Tina path: `tina/config.ts`.
3. **Obtain API Credentials**:
   - In the project settings, navigate to **Overview** and copy your **Client ID** (`NEXT_PUBLIC_TINA_CLIENT_ID`).
   - Navigate to **Tokens** and generate a new **Read-Only / Content API Token** with write access for TinaCloud (`TINA_TOKEN`).
4. **Configure Allowed Site URLs**:
   - In the TinaCloud dashboard under **Site URLs**, add:
     - `https://zyxen.in` (Production domain)
     - `https://*.vercel.app` (Vercel preview & deployment URLs)
     - `http://localhost:3000` (Local testing)
5. **Invite Editors**:
   - Navigate to **Users & Roles** in the Tina project dashboard.
   - Click **Invite User**, enter the editor's email address, and select their role (`Admin` or `Editor`).
   - Editors will receive an email invitation to access the CMS at `https://zyxen.in/admin`.

---

## 3. Vercel Project Setup

1. **Import GitHub Repository**:
   - In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
   - Select your GitHub repository.
   - Framework Preset: **Next.js**.
   - Root Directory: `./`.
   - Build Command: Default (`npm run build` which runs content validation, Tina build, Next.js build, and manifest generation).
   - Output Directory: Default (`.next`).
   - Install Command: Default (`npm install`).

2. **Configure Environment Variables**:
   Add the following environment variables in **Settings** -> **Environment Variables**:

   | Variable Name | Environments | Value / Description |
   |---|---|---|
   | `SITE_URL` | Production, Preview, Dev | `https://zyxen.in` |
   | `NEXT_PUBLIC_SITE_URL` | Production, Preview, Dev | `https://zyxen.in` |
   | `ALLOW_INDEXING` | Production (post-cutover only) | Initially set to `false`. Set to `true` ONLY after domain DNS cutover is verified. |
   | `NEXT_PUBLIC_TINA_CLIENT_ID` | Production, Preview, Dev | Your Client ID from TinaCloud |
   | `TINA_TOKEN` | Production, Preview, Dev | Content Token from TinaCloud |
   | `GITHUB_BRANCH` | Production, Preview, Dev | `master` |
   | `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Production, Preview, Dev | EmailJS Service ID |
   | `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Production, Preview, Dev | EmailJS Template ID |
   | `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Production, Preview, Dev | EmailJS Public Key |
   | `NEXT_PUBLIC_GA_ID` | Production | Google Analytics Measurement ID (e.g. `G-XXXXXXXXXX`) |
   | `NEXT_PUBLIC_GSC_VERIFICATION` | Production | Google Search Console verification token |
   | `BING_VERIFICATION` | Production | Bing Webmaster Tools verification code |

3. **Deploy**:
   - Click **Deploy**. Vercel will build the project and output a `*.vercel.app` preview URL.

---

## 4. Indexing & Security Verification (Pre-Cutover)

Before pointing the public domain, ensure search crawlers cannot index preview deployments:

1. **Verify Indexing Block**:
   - While `ALLOW_INDEXING` is unset or `false`:
     - Visiting `/robots.txt` returns `Disallow: /` for all user agents.
     - All pages return HTTP header `X-Robots-Tag: noindex, nofollow`.
     - Layout metadata sets `<meta name="robots" content="noindex, nofollow">`.
2. **Verify CMS Access**:
   - Access `https://<preview-domain>.vercel.app/admin`.
   - Verify Tina login screen renders with HTTP 200 without frame blocking (headers permit iframe on `/admin`).
   - Log in using your TinaCloud credentials and confirm existing posts can be viewed.

---

## 5. Domain & DNS Cutover Procedure

Follow this exact sequence to ensure zero-downtime cutover:

### Step A: Lower TTL (24 to 48 hours prior)
At your existing DNS provider (e.g. Cloudflare, GoDaddy, Namecheap):
- Change the TTL on existing `A` and `CNAME` records for `zyxen.in` and `www.zyxen.in` to `300` seconds (5 minutes).
- Allow the old TTL cache to expire globally.

### Step B: Configure Domain in Vercel
- In Vercel Project Settings -> **Domains**:
  - Add `zyxen.in` (recommended: redirect `www.zyxen.in` to `zyxen.in` or vice versa as canonical).
  - Vercel will display the DNS targets (`76.76.21.21` and `cname.vercel-dns.com`).

### Step C: Update DNS Records
At your DNS provider:
- Set `@` (`zyxen.in`) `A` record -> `76.76.21.21` (or Vercel Anycast IP).
- Set `www` (`www.zyxen.in`) `CNAME` record -> `cname.vercel-dns.com`.
- If using Cloudflare, set proxy status to DNS Only during initial SSL validation.

### Step D: Verification & SSL
- Wait 5-15 minutes for Vercel to issue the Let's Encrypt SSL certificate.
- Test in a clean browser:
  - `https://zyxen.in` -> 200 OK
  - `https://zyxen.in/admin` -> 200 OK (TinaCMS SPA)
  - `https://zyxen.in/sitemap.xml` -> 200 OK
  - `https://zyxen.in/blogs/website-development-cost-in-india-2026-guide` -> 308 redirect to `/blogs/website-development-cost-india-2026`

### Step E: Activate Search Indexing
Once the domain is verified live and stable:
1. In Vercel Dashboard -> **Settings** -> **Environment Variables**:
   - Edit `ALLOW_INDEXING` for the **Production** environment.
   - Set value to `true`.
2. Redeploy the production deployment:
   - Navigate to **Deployments** -> select the latest deployment -> **Redeploy**.
3. Verify live indexation status:
   - Request `curl -I https://zyxen.in/` -> Ensure `X-Robots-Tag` is NOT `noindex`.
   - Request `https://zyxen.in/robots.txt` -> Confirm it serves:
     ```
     User-Agent: *
     Allow: /
     Disallow: /admin/
     Disallow: /api/

     Sitemap: https://zyxen.in/sitemap.xml
     ```
   - Request `curl -I https://zyxen.in/admin` -> Confirm `X-Robots-Tag: noindex, nofollow` remains active for CMS security.
4. Submit sitemap:
   - In Google Search Console, submit `https://zyxen.in/sitemap.xml`.
   - In Bing Webmaster Tools, submit `https://zyxen.in/sitemap.xml`.

---

## 6. Rollback Procedures

The repository maintains immutable Git tags at key project milestones:

| Tag | Phase Description |
|---|---|
| `before-phase7c` | Point before Netlify removal & TinaCMS transition (Decap baseline) |
| `before-phase7b` | Point before 3D canvas revamps (/aviation, /projects, /blogs) |
| `before-phase7a` | Point before Web Audio deletion and phone array updates |

### Fast Vercel Instant Rollback (Zero Rebuild)
1. Go to Vercel Dashboard -> **Deployments**.
2. Find the previous stable deployment hash or name.
3. Click the three dots `...` -> **Promote to Production**. Vercel instantly routes 100% of traffic to that deployment within seconds.

### Git Tag Rollback
To roll back the codebase to a previous tag:

```bash
# Fetch all tags from remote
git fetch --tags origin

# Inspect the target milestone
git checkout before-phase7c

# Create a rollback branch or revert on master:
git checkout master
git revert <commit-range>
# OR to cleanly force-align master to a milestone if authorized:
git reset --hard before-phase7c
git push origin master --force-with-lease
```
