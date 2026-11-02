# ZYXEN website: project brief

ZYXEN is a Hyderabad web and software agency. The site replaces zyxen.in and focuses
on aviation academies (exam portals, finance/fee systems, admissions, ERP), while still
serving general web development, interactive websites and business software.
Contact: contact@zyxen.in, +91 70135 58465, Hyderabad, Telangana, India.
Brand line: "Intelligence Meets Elegance".

HARD RULES
1. Never change or remove existing URLs: /, /about, /services, /contact, /blogs and the
   8 live /blogs/<slug> pages. New pages are allowed and must be added to sitemap.ts.
2. Every page keeps a unique title, description and self-referencing canonical
   (use pageMetadata() in src/lib/seo.ts). One <h1> per page.
3. Do not touch /admin, public/admin/, content/blog/, src/lib/blog.ts or next.config
   redirects. Never add public/sitemap.xml or public/robots.txt.
4. Keep the existing 3D scenes, GSAP timelines and layout. Change copy, data and
   structure only when a prompt says so.
5. Plain, specific English. No "exabytes", "infinite", "neural", "transmission"-style
   jargon. No claims we cannot prove. Never say "DGCA-approved", "FAA-certified" or
   similar; say "configured to follow the exam pattern and rules of <authority>".
   Do not show client names; say "an aviation academy client".
6. Currency is INR. No dollar amounts.
7. Next.js 16 has breaking changes: read node_modules/next/dist/docs/ before coding.

EVERY PHASE ENDS WITH
Work on a new branch, run npm run lint and npm run build, run the production server,
check that every URL in the sitemap returns 200 and every page has its own title and
canonical, commit, and report pass/fail only.
