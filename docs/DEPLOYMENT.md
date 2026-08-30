# Stage 8 — Replit Deployment Runbook

## Recommended deployment type

Use **Autoscale** for the production app. The app is request-driven, persists data in Supabase, and does not require an always-on VM.

## Import

Import the GitHub repository:

`montigby/money-awareness`

Replit should detect Node/Next.js automatically. The repository also includes a `.replit` file with:

- editor run command: `npm run dev -- --hostname 0.0.0.0`
- deployment build command: `npm run build`
- deployment run command: `npm run start:replit`

The production server binds to `0.0.0.0` and uses Replit's `PORT` environment variable.

## Required production secrets

These must be configured in the **Publishing/Deployment production secrets**, not only editor secrets:

### Required for persistence

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (kept for compatibility; browser code should not directly access protected assessment tables)
- `SUPABASE_SERVICE_ROLE_KEY`

### Required for AI narrative

- `OPENAI_API_KEY`
- `OPENAI_REPORT_MODEL` (recommended: the approved production model configured for the project)

### Required for email

- `RESEND_API_KEY`
- `REPORT_FROM_EMAIL` (must use a Resend-verified sending domain)

### Recommended for analytics

- `POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

### Required site URL

- `NEXT_PUBLIC_SITE_URL`

Set this to the final production URL after the Replit app URL or custom domain is known. This value is used when producing absolute links in emails/sharing.

## Health checks

- Home page: `/`
- Explicit lightweight endpoint: `/api/health`

Expected health response:

```json
{"ok":true,"service":"money-self-awareness"}
```

## Production smoke test

Run this in order after publishing:

1. Open `/` in a private/incognito browser window.
2. Start an assessment and confirm a session URL is created.
3. Answer several questions, refresh, and confirm resume works.
4. Complete the assessment.
5. Confirm redirect to `/results/<private-token>`.
6. Confirm six dimension scores and archetype/pattern sections render.
7. Confirm personalized AI narrative renders; if the OpenAI API is unavailable, confirm deterministic fallback renders instead.
8. Submit a 1–5 accuracy rating and confirm success state.
9. Create/share the privacy-safe public profile and verify it does not reveal financial context, reflection, private results URL, or full narrative.
10. Send the report to an email address and confirm delivery and link behavior.
11. Open `/api/health` and confirm HTTP 200.
12. Review Replit deployment logs for uncaught errors.

## Custom domain

After the Replit deployment works on its generated `replit.app` URL:

1. Add the custom domain in Replit Publishing.
2. Complete the DNS records Replit provides.
3. Update `NEXT_PUBLIC_SITE_URL` to the final HTTPS custom domain.
4. Re-publish/redeploy.
5. Repeat the email + share-link smoke tests so all absolute URLs point to the custom domain.

## Security reminders

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or any `NEXT_PUBLIC_*` variable.
- Never expose `OPENAI_API_KEY` or `RESEND_API_KEY` to the client.
- Production secrets must be configured independently from development/editor secrets.
- Public share pages must remain separate from private results URLs.
