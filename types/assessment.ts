export type DimensionCode =
  | "security"
  | "enoughness"
  | "identityAttachment"
  | "control"
  | "freedom"
  | "presence";

export type LikertAnswer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Question = {
  code: string;
  type: "likert" | "single_choice" | "financial_context" | "free_text";
  text: string;
  dimension?: DimensionCode;
  reverse?: boolean;
  options?: { id: string; text: string }[];
  required?: boolean;
};

export type AnswerValue = number | string | null;
export type AssessmentAnswers = Record<string, AnswerValue>;

export type DimensionScores = Record<DimensionCode, number>;

export type AttentionScores = {
  chosen: number;
  compelled: number;
};

export type MotivationScores = {
  security: number;
  freedom: number;
  achievement: number;
  experience: number;
};

export type ArchetypeResult = {
  name: string;
  confidence: number;
};

export type PatternResult = {
  code: string;
  name: string;
  strength: number;
};

export type ContradictionResult = {
  code: string;
  name: string;
  strength: number;
  confidence: "low" | "medium" | "high";
};

export type AssessmentResult = {
  scoringVersion: string;
  dimensions: DimensionScores;
  attention: AttentionScores;
  motivations: MotivationScores;
  objectiveFinancialResilience: number | null;
  securityGap: number | null;
  archetypes: {
    primary: ArchetypeResult | null;
    secondary: ArchetypeResult | null;
  };
  patterns: PatternResult[];
  contradictions: ContradictionResult[];
};
