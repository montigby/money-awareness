# Synthetic Profile Validation — Stage 2C/2D

These profiles are regression fixtures for product logic. They are not scientific validation and should not be treated as population norms.

## 1. Anxious Millionaire

Intent: high objective resilience, low internal security, high control.

Expected highlights:
- Internal Security ~17
- Need for Control ~100
- Primary archetype: Protector
- Security Gap (P03) must trigger
- Fragile Confidence (P04) must not trigger

Observed deterministic shape: coherent. The high objective resilience / low felt-security discrepancy is surfaced as intended.

## 2. Competitive Founder

Intent: very high identity attachment and achievement, low enoughness, high comparison sensitivity.

Expected highlights:
- Enoughness ~17
- Identity Attachment ~100
- Primary archetype in Builder / Achiever / Competitor family
- Scorekeeper (P07), Unreachable Number (P08), and Goalpost Drift (P15) must trigger

Observed deterministic shape: coherent. The strongest patterns emphasize comparison and moving financial goalposts rather than generic anxiety.

## 3. Content Saver

Intent: high security and enoughness, low status attachment, high present enjoyment.

Expected highlights:
- Security ~83
- Enoughness ~83
- Identity Attachment ~17
- Present Enjoyment ~83
- Money Without Status (P10) must trigger
- Achievement/Deferred-Life patterns must not trigger

Observed deterministic shape: coherent.

## 4. Freedom Seeker

Intent: autonomy is central, but control needs are low and present enjoyment is high.

Expected highlights:
- Freedom ~100
- Control ~33
- Primary archetype: Freedom Seeker
- Money Without Status (P10) must trigger
- Freedom-Control Paradox (P01) must not trigger
- Conditional Freedom (P06) must not trigger

Observed deterministic shape: coherent. This is an important negative test showing that high freedom orientation does not automatically create a paradox.

## 5. Extreme Maximizer

Intent: optimization and chosen money attention dominate, without extremely low enoughness or presence.

Expected highlights:
- Control ~100
- Enoughness ~50
- Primary archetype in Maximizer / Builder family
- Deferred-Life and financial-preoccupation patterns must not trigger

Observed deterministic shape: coherent. Maximizer ranks ahead of Builder under the current confidence formula.

## 6. Carefree Experiencer

Intent: high present enjoyment, low control, low status attachment, very little money attention.

Expected highlights:
- Present Enjoyment ~100
- Control ~17
- Identity Attachment ~17
- Primary archetype: Experiencer
- Financial Detachment (P14) must trigger
- Control/deferred-life patterns must not trigger

Observed deterministic shape: coherent.

## 7. Deferred-Life Builder

Intent: strong building drive and optimization paired with very low enoughness and present enjoyment.

Expected highlights:
- Enoughness ~17
- Presence ~17
- Control ~83
- Freedom ~83
- Primary archetype in Builder / Maximizer / Achiever family
- Unreachable Number (P08) and Goalpost Drift (P15) must trigger

Observed deterministic shape: coherent. Multiple patterns qualify, so only the five strongest are returned by the current engine.

## 8. Financially Insecure Optimist

Intent: strong internal confidence despite very weak objective resilience.

Expected highlights:
- Internal Security ~83
- Identity Attachment ~17
- Fragile Confidence (P04) must trigger
- Security Gap (P03) must not trigger

Observed deterministic shape: coherent. The engine distinguishes objective vulnerability from subjective confidence.

# Stage 2D conclusion

The eight starter fixtures cover both positive and negative trigger behavior across:

- objective vs subjective security
- enoughness / moving goalposts
- identity and comparison
- control and optimization
- autonomy
- present enjoyment
- chosen vs compelled money attention

The fixtures should remain in the test suite permanently. Any future scoring change that breaks them should require an explicit product decision rather than silent threshold drift.

Before public validation, expand this library toward 20–30 synthetic profiles and then test with real people. Synthetic profiles validate internal logic; they do not validate psychological accuracy.
