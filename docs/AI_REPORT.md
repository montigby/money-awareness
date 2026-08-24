# AI Report Layer

AI is optional during development.

The deterministic app must work without it.

Production flow:

answers
→ deterministic result JSON
→ compact report input
→ LLM narrative synthesis
→ Zod validation
→ stored report JSON

Never pass email address, tracking identifiers, or unnecessary personally
identifiable information to the model.

The model may explain results, but never change them.

Prefer one model call per completed assessment.

Keep pattern baseline copy deterministic where practical to reduce token cost,
latency, and variability.
