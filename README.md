# Dr. Kumar's Hair Transplant – monorepo

pnpm + Turborepo monorepo, deployed on AWS Amplify (Next.js SSR + DynamoDB).

```
apps/web          Next.js 15 (App Router, Tailwind 4, GSAP + Lenis) – public site, API routes, future /admin
apps/web/amplify  Amplify Gen 2 / CDK backend (DynamoDB tables)
packages/shared   Zod schemas/types shared by UI and API
```

## Develop
```bash
pnpm install
pnpm dev            # http://localhost:3000
```
Without `APPOINTMENTS_TABLE` set, the appointment API logs submissions to the console in dev.

## Deploy (Amplify Hosting, monorepo)
1. Create an Amplify app from this repo; set the app root to `apps/web` (uses `amplify.yml`).
2. The backend phase creates the `Appointments` and `AdminUsers` DynamoDB tables.
3. Set env vars in Amplify (see `apps/web/.env.example`): `APPOINTMENTS_TABLE`, `ADMIN_USERS_TABLE`, `BLOGS_TABLE`, `S3_MEDIA_BUCKET`, `APP_AWS_REGION`, `NEXT_PUBLIC_SITE_URL`, `JWT_SECRET` (min 32 random chars), and for the one-time superadmin bootstrap `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
4. Attach an IAM **compute role** to the app (Hosting → Compute role). Allow on the three tables (and `.../index/*` of Blogs): `dynamodb:PutItem, GetItem, Query, Scan, UpdateItem, DeleteItem`; and on the media bucket: `s3:PutObject, s3:GetObject` for `blogs/*`.
5. Recommended: AWS WAF rate-based rule in front of the app.

## Security notes
Security headers (HSTS, nosniff, frame, referrer) in `next.config.ts`; same-origin + zod validation + honeypot + rate limit on the public form; no AWS keys in code (IAM role). Admin APIs (next phase) will use JWT in httpOnly cookies, bcrypt/argon2 hashes, lockout and server-side verification on every protected route.

## Design notes
Home page built from the Figma frame at 1440px with responsive tablet/mobile layouts. The "Hair/Body/Sti Care" treatment tabs have no Figma design yet (placeholder content from the footer lists). The design's "APPOINTEMNT" typo is corrected.

## Admin & blogs
- `/admin` – sign-in, dashboard, appointment bookings (status + notes), blogs (add / list / edit / delete).
- Blog fields mirror the TX Hospitals admin (image, title, categories, author, timeline, rich-text sections, FAQs, SEO, URL) minus branch, plus **status** (draft / scheduled / published / inactive) and **publish date-time (IST)**.
- Scheduling needs no cron: a blog is public when `status` is published/scheduled **and** `publishAt <= now`, evaluated on every public request (cached ≤60 s).
- Public API: `GET /api/blogs`, `GET /api/blogs/{url}` (live blogs only). Images are served via `/api/media/*` from a private S3 bucket.
- Auth: bcrypt password hashes in DynamoDB, 8 h JWT (HS256) in an httpOnly, Secure, SameSite=Strict cookie, middleware + per-handler verification, same-origin checks on mutations, login rate-limit and 5-attempt/15-min lockout, sanitised rich text.
- Superadmin: set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` in Amplify, sign in once, then delete both variables. Credentials are never committed.

### Local development
```bash
pnpm -C apps/web local-db        # DynamoDB emulator on :4567
# then in apps/web/.env.local: DYNAMODB_ENDPOINT=http://localhost:4567, *_TABLE=local-*, JWT_SECRET=…
pnpm dev
```
