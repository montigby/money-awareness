# Implementation Milestones

## Milestone 0 — Repository
- [x] Project skeleton
- [x] Agent instructions
- [x] Core types
- [x] Question configuration
- [x] Initial scoring modules
- [x] Initial Supabase migration
- [x] Mock report generator
- [x] Initial unit tests

## Milestone 1 — Finish deterministic engine
- [x] Add exact scenario mappings from the approved spec
- [x] Add P08 Unreachable Number
- [x] Add P15 Goalpost Drift
- [ ] Add C04 only if supporting evidence rule is defined
- [x] Add validation for complete assessments
- [x] Add score rounding rules only at presentation layer
- [ ] Add exhaustive boundary tests for every archetype/pattern/contradiction

## Milestone 2 — Synthetic profiles
- [x] Build 8 starter fixtures
- [ ] Expand to 20–30 profiles
- [x] Define expected result ranges
- [x] Review outputs manually against deterministic formulas
- [x] Add synthetic-profile regression tests
- [x] Document validation in `docs/SYNTHETIC_VALIDATION.md`
- [x] Add GitHub Actions test workflow

## Milestone 3 — Survey UI
- [x] One question per screen
- [x] 1–7 keyboard shortcuts
- [x] Back navigation
- [x] Progress indicator
- [x] Mobile-first interaction
- [x] Local cache
- [x] Autosave with local fallback
- [x] Resume from last saved question
- [x] Optional financial context can be skipped
- [x] Final reflection supports 1,000 characters
- [x] Reduced-motion and keyboard accessibility support

## Milestone 4 — Supabase
- [x] Create real session on start
- [x] Upsert validated answers server-side
- [x] Resume from server state across devices
- [x] Reconcile device-only fallback answers back to server
- [x] Complete-session validation from authoritative stored answers
- [x] Persist deterministic score object with scoring/question versions
- [x] Add production RLS/security review
- [x] Revoke direct anon/authenticated table access; server-only service-role model
- [x] Add cascading delete-results flow
- [x] Apply and verify production database migration
- [x] Run Supabase security advisor

## Milestone 5 — Deterministic results
- [ ] Archetype header
- [ ] Dimension bars
- [ ] Pattern cards
- [ ] Security-gap section
- [ ] Contradiction section
- [ ] Reflection section
- [ ] No AI required

## Milestone 6 — AI narrative
- [ ] Add compact model input
- [ ] Add production OpenAI call
- [ ] Require structured output
- [ ] Validate with Zod
- [ ] Retry once
- [ ] Fall back to deterministic report

## Milestone 7 — Distribution
- [ ] Email result link
- [ ] Privacy-safe share card
- [ ] Accuracy feedback
- [ ] Analytics events

## Milestone 8 — Deployment
- [ ] Push GitHub main
- [ ] Connect deployment platform
- [ ] Configure secrets
- [ ] Smoke-test production
- [ ] Add custom domain

## Milestone 9 — Human testing
- [ ] 20–30 initial testers
- [ ] Track 1–5 accuracy score
- [ ] Collect "most accurate"
- [ ] Collect "least accurate"
- [ ] Collect missing concepts
- [ ] Freeze changes until enough evidence exists
