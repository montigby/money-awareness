# Suggested prompts for coding agents

## Prompt 1 — Audit starter

Read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ASSESSMENT.md`, and
`docs/SCORING.md`. Audit the repository for contradictions between the
approved product architecture and the implementation. Do not change product
behavior. Return bugs, missing tests, and implementation risks ranked by severity.

## Prompt 2 — Finish Milestone 1

Implement Milestone 1 from `docs/BUILD_PLAN.md`.
Keep all scoring deterministic. Add boundary tests for every pattern and
archetype trigger. Do not change approved thresholds without flagging the
issue first.

## Prompt 3 — Build synthetic profiles

Implement the synthetic-profile harness described in
`tests/fixtures/README.md`. Add at least eight complete answer fixtures with
expected score ranges and expected/forbidden patterns.

## Prompt 4 — Survey UI

Implement Milestone 3. Use the existing question configuration as the source
of truth. Build an accessible, mobile-first, one-question-at-a-time flow.
Do not redesign scoring or question IDs.

## Prompt 5 — Review

Review the latest diff as a senior engineer. Check scoring correctness,
privacy leaks, data loss, inaccessible controls, and hidden coupling to a
single hosting provider. Run tests and report failures before modifying code.
