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
3. Set env vars in Amplify: `APPOINTMENTS_TABLE`, `ADMIN_USERS_TABLE`, `APP_AWS_REGION`, `NEXT_PUBLIC_SITE_URL`.
4. Attach an IAM **compute role** to the app (Hosting → Compute role) allowing `dynamodb:PutItem/GetItem/Query/UpdateItem` on those tables only.
5. Recommended: AWS WAF rate-based rule in front of the app.

## Security notes
Security headers (HSTS, nosniff, frame, referrer) in `next.config.ts`; same-origin + zod validation + honeypot + rate limit on the public form; no AWS keys in code (IAM role). Admin APIs (next phase) will use JWT in httpOnly cookies, bcrypt/argon2 hashes, lockout and server-side verification on every protected route.

## Design notes
Home page built from the Figma frame at 1440px with responsive tablet/mobile layouts. The "Hair/Body/Sti Care" treatment tabs have no Figma design yet (placeholder content from the footer lists). The design's "APPOINTEMNT" typo is corrected.
