import type {
  ArchetypeResult,
  AttentionScores,
  DimensionScores,
  MotivationScores,
} from "@/types/assessment";
import type { ScenarioSignals } from "./scenarios";

type Inputs = {
  dimensions: DimensionScores;
  attention: AttentionScores;
  motivations: MotivationScores;
  scenarioSignals: ScenarioSignals;
};

const avg = (...n: number[]) => n.reduce((a, b) => a + b, 0) / n.length;

export function calculateArchetypes(input: Inputs): {
  primary: ArchetypeResult | null;
  secondary: ArchetypeResult | null;
} {
  const { dimensions: d, attention: a, motivations: m, scenarioSignals: s } = input;
  const candidates: ArchetypeResult[] = [];

  const add = (name: string, qualifies: boolean, confidence: number) => {
    if (qualifies) candidates.push({ name, confidence });
  };

  add("Builder",
    m.achievement >= 70 && (a.chosen >= 60 || s.building >= 65),
    avg(m.achievement, a.chosen, s.building));

  add("Freedom Seeker",
    m.freedom >= 75,
    m.freedom);

  add("Protector",
    m.security >= 70,
    m.security);

  add("Maximizer",
    d.control >= 75 && a.chosen >= 65,
    avg(d.control, a.chosen));

  add("Achiever",
    m.achievement >= 75 && d.identityAttachment >= 65,
    avg(m.achievement, d.identityAttachment));

  add("Competitor",
    d.identityAttachment >= 70 && s.comparison >= 65,
    avg(d.identityAttachment, s.comparison));

  add("Experiencer",
    m.experience >= 70 && d.presence >= 65,
    avg(m.experience, d.presence));

  add("Steward",
    d.control >= 60 && m.security >= 65 && d.identityAttachment < 60,
    avg(d.control, m.security, 100 - d.identityAttachment));

  candidates.sort((x, y) => y.confidence - x.confidence);

  return {
    primary: candidates[0] ?? null,
    secondary:
      candidates[1] && candidates[1].confidence >= 65
        ? candidates[1]
        : null,
  };
}
