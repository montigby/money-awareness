# AGENTS.md

## Mission

Build a psychologically insightful money self-awareness assessment.

The product is a mirror, not a scorecard. There is no ideal profile.

## Non-negotiable architecture

1. Scoring is deterministic.
2. Never let an LLM calculate or alter scores.
3. Keep assessment logic inside `lib/assessment`.
4. Every scoring-rule change requires automated tests.
5. Do not silently change question IDs.
6. Do not expose financial context in public share cards.
7. Do not add authentication, subscriptions, coaching, couples mode, or unrelated features in V1.
8. Keep the app portable. Avoid unnecessary Replit-specific dependencies.
9. GitHub is the source of truth.
10. Production AI should be called only after deterministic scoring completes.

## Before modifying assessment logic

Read:
- `docs/ASSESSMENT.md`
- `docs/SCORING.md`
- `docs/PRODUCT.md`

Run:
`npm test`

## Definition of done for scoring changes

- TypeScript compiles
- Existing tests pass
- New rules have boundary tests
- Results remain reproducible by `scoringVersion`
