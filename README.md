# Money Self-Awareness

A portable starter repository for the Money Self-Awareness Assessment.

## Architecture

- Next.js + TypeScript
- Supabase/Postgres
- Deterministic scoring engine
- OpenAI API only for final narrative synthesis
- GitHub as the source of truth
- Replit can be connected later as a deployment/runtime target

## Core rule

AI never determines scores, archetypes, patterns, contradictions, or financial resilience. Those are deterministic and tested.

## Local setup

1. Install Node.js 20+
2. Copy `.env.example` to `.env.local`
3. Install dependencies:
   `npm install`
4. Run:
   `npm run dev`
5. Run tests:
   `npm test`

## Recommended build sequence

1. Finalize question wording and IDs
2. Finish deterministic scoring
3. Expand automated tests
4. Build survey UX
5. Add Supabase persistence
6. Build deterministic results page
7. Test with synthetic profiles
8. Add AI narrative generation
9. Deploy
10. Test with real users

See `/docs/BUILD_PLAN.md`.
