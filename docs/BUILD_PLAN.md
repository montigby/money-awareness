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
- [ ] Add exact scenario mappings from the approved spec
- [ ] Add P08 Unreachable Number
- [ ] Add P15 Goalpost Drift
- [ ] Add C04 only if supporting evidence rule is defined
- [ ] Add validation for complete assessments
- [ ] Add score rounding rules only at presentation layer
- [ ] Add exhaustive boundary tests

## Milestone 2 — Synthetic profiles
- [ ] Build 8 starter fixtures
- [ ] Expand to 20–30 profiles
- [ ] Define expected result ranges
- [ ] Review outputs manually

## Milestone 3 — Survey UI
- [ ] One question per screen
- [ ] 1–7 keyboard shortcuts
- [ ] Back navigation
- [ ] Progress indicator
- [ ] Mobile-first interaction
- [ ] Local cache
- [ ] Autosave
- [ ] Resume

## Milestone 4 — Supabase
- [ ] Create real session on start
- [ ] Upsert answers server-side
- [ ] Complete-session validation
- [ ] Persist deterministic score object
- [ ] Add production RLS/security review
- [ ] Add delete-results flow

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
