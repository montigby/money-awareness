# Scoring V1

## Likert normalization

Normal item:
`((answer - 1) / 6) * 100`

Reverse item:
`answer = 8 - answer` before normalization.

Each core dimension is the arithmetic mean of its six normalized items.

## Philosophy

V1 formulas are deliberately transparent and simple.
Do not introduce hidden weighting until real testing justifies it.

## Deterministic layers

1. Dimensions
2. Money attention
3. Scenario signals
4. Motivations
5. Objective resilience, if optional inputs exist
6. Archetypes
7. Patterns
8. Contradictions

The LLM begins only after all eight layers are complete.

## Versioning

Every stored result includes `scoringVersion`.
Historical reports should remain reproducible.
