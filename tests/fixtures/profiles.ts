import { QUESTIONS } from "@/lib/assessment/questions";
import type {
  AssessmentAnswers,
  DimensionCode,
} from "@/types/assessment";

export type SyntheticProfile = {
  name: string;
  description: string;
  answers: AssessmentAnswers;
  expected: {
    dimensionRanges?: Partial<Record<DimensionCode, [number, number]>>;
    primaryArchetypes?: string[];
    requiredPatterns?: string[];
    forbiddenPatterns?: string[];
  };
};

type ProfileBuilder = {
  dimensions: Record<DimensionCode, number>;
  chosenAttention: number;
  compelledAttention: number;
  scenarios: Record<string, string>;
  financial?: Partial<AssessmentAnswers>;
  reflection?: string;
};

function makeAnswers(input: ProfileBuilder): AssessmentAnswers {
  const answers: AssessmentAnswers = {};

  for (const q of QUESTIONS) {
    if (q.type === "likert" && q.dimension) {
      const keyed = input.dimensions[q.dimension];
      answers[q.code] = q.reverse ? 8 - keyed : keyed;
    }
  }

  answers.ATT1 = input.chosenAttention;
  answers.ATT2 = input.chosenAttention;
  answers.ATT3 = input.compelledAttention;
  answers.ATT4 = input.compelledAttention;

  Object.assign(answers, input.scenarios);
  Object.assign(answers, input.financial ?? {});

  if (input.reflection) answers.REF1 = input.reflection;

  return answers;
}

const commonScenarios = {
  SCN1: "B",
  SCN2: "C",
  SCN3: "C",
  SCN4: "A",
  SCN5: "C",
  SCN6: "B",
  SCN7: "B",
  SCN8: "B",
  SCN8B: "B",
};

export const SYNTHETIC_PROFILES: SyntheticProfile[] = [
  {
    name: "Anxious Millionaire",
    description:
      "Very high objective resilience but low felt security, high control, and persistent money attention.",
    answers: makeAnswers({
      dimensions: {
        security: 2,
        enoughness: 3,
        identityAttachment: 4,
        control: 7,
        freedom: 5,
        presence: 3,
      },
      chosenAttention: 5,
      compelledAttention: 7,
      scenarios: {
        ...commonScenarios,
        SCN1: "B",
        SCN2: "B",
        SCN3: "A",
        SCN4: "B",
        SCN5: "B",
        SCN6: "F",
      },
      financial: {
        FIN1: "1m+",
        FIN2: "10m+",
        FIN3: "3y+",
        FIN4: 1,
      },
      reflection: "I would probably stop checking money so often and trust that I have enough.",
    }),
    expected: {
      dimensionRanges: {
        security: [15, 18],
        control: [99, 100],
      },
      primaryArchetypes: ["Protector"],
      requiredPatterns: ["P03"],
      forbiddenPatterns: ["P04", "P10"],
    },
  },
  {
    name: "Competitive Founder",
    description:
      "High achievement and identity attachment, low enoughness, strong comparison, control, and money immersion.",
    answers: makeAnswers({
      dimensions: {
        security: 5,
        enoughness: 2,
        identityAttachment: 7,
        control: 6,
        freedom: 6,
        presence: 3,
      },
      chosenAttention: 7,
      compelledAttention: 6,
      scenarios: {
        ...commonScenarios,
        SCN1: "D",
        SCN2: "E",
        SCN3: "B",
        SCN4: "D",
        SCN5: "A",
        SCN6: "E",
        SCN7: "E",
        SCN8: "A",
        SCN8B: "A",
      },
    }),
    expected: {
      dimensionRanges: {
        enoughness: [15, 18],
        identityAttachment: [99, 100],
        control: [82, 85],
      },
      primaryArchetypes: ["Competitor", "Builder", "Achiever"],
      requiredPatterns: ["P07", "P08", "P15"],
      forbiddenPatterns: ["P03", "P04", "P10"],
    },
  },
  {
    name: "Content Saver",
    description:
      "High security and enoughness, low status attachment, good present enjoyment, and relatively low compelled attention.",
    answers: makeAnswers({
      dimensions: {
        security: 6,
        enoughness: 6,
        identityAttachment: 2,
        control: 5,
        freedom: 5,
        presence: 6,
      },
      chosenAttention: 4,
      compelledAttention: 2,
      scenarios: {
        ...commonScenarios,
        SCN1: "C",
        SCN2: "A",
        SCN3: "D",
        SCN4: "E",
        SCN5: "D",
        SCN6: "B",
        SCN7: "A",
      },
    }),
    expected: {
      dimensionRanges: {
        security: [82, 85],
        enoughness: [82, 85],
        identityAttachment: [15, 18],
        presence: [82, 85],
      },
      primaryArchetypes: ["Experiencer", "Freedom Seeker"],
      requiredPatterns: ["P10"],
      forbiddenPatterns: ["P02", "P05", "P07", "P08", "P15"],
    },
  },
  {
    name: "Freedom Seeker",
    description:
      "Extremely high autonomy orientation with low control needs, high enoughness, and strong present enjoyment.",
    answers: makeAnswers({
      dimensions: {
        security: 6,
        enoughness: 6,
        identityAttachment: 2,
        control: 3,
        freedom: 7,
        presence: 6,
      },
      chosenAttention: 4,
      compelledAttention: 2,
      scenarios: {
        ...commonScenarios,
        SCN1: "E",
        SCN2: "A",
        SCN3: "D",
        SCN4: "E",
        SCN5: "D",
        SCN6: "D",
        SCN7: "D",
        SCN8: "B",
        SCN8B: "B",
      },
    }),
    expected: {
      dimensionRanges: {
        freedom: [99, 100],
        control: [32, 35],
      },
      primaryArchetypes: ["Freedom Seeker"],
      requiredPatterns: ["P10"],
      forbiddenPatterns: ["P01", "P06", "P09"],
    },
  },
  {
    name: "Extreme Maximizer",
    description:
      "Very high need for control and chosen financial attention, with strong optimization behavior but moderate enoughness.",
    answers: makeAnswers({
      dimensions: {
        security: 5,
        enoughness: 4,
        identityAttachment: 5,
        control: 7,
        freedom: 5,
        presence: 4,
      },
      chosenAttention: 7,
      compelledAttention: 5,
      scenarios: {
        ...commonScenarios,
        SCN1: "A",
        SCN2: "C",
        SCN3: "B",
        SCN4: "C",
        SCN5: "B",
        SCN6: "A",
        SCN7: "B",
        SCN8: "A",
        SCN8B: "A",
      },
    }),
    expected: {
      dimensionRanges: {
        control: [99, 100],
        enoughness: [49, 51],
      },
      primaryArchetypes: ["Maximizer", "Builder"],
      forbiddenPatterns: ["P03", "P04", "P05", "P10", "P13"],
    },
  },
  {
    name: "Carefree Experiencer",
    description:
      "High present enjoyment with low control, low identity attachment, and little money preoccupation.",
    answers: makeAnswers({
      dimensions: {
        security: 5,
        enoughness: 5,
        identityAttachment: 2,
        control: 2,
        freedom: 4,
        presence: 7,
      },
      chosenAttention: 2,
      compelledAttention: 1,
      scenarios: {
        ...commonScenarios,
        SCN1: "C",
        SCN2: "A",
        SCN3: "D",
        SCN4: "E",
        SCN5: "D",
        SCN6: "C",
        SCN7: "A",
      },
    }),
    expected: {
      dimensionRanges: {
        presence: [99, 100],
        control: [15, 18],
        identityAttachment: [15, 18],
      },
      primaryArchetypes: ["Experiencer"],
      requiredPatterns: ["P14"],
      forbiddenPatterns: ["P01", "P05", "P06", "P09", "P13"],
    },
  },
  {
    name: "Deferred-Life Builder",
    description:
      "Strong building drive, control, freedom orientation, and money immersion paired with very low presence and enoughness.",
    answers: makeAnswers({
      dimensions: {
        security: 4,
        enoughness: 2,
        identityAttachment: 5,
        control: 6,
        freedom: 6,
        presence: 2,
      },
      chosenAttention: 7,
      compelledAttention: 6,
      scenarios: {
        ...commonScenarios,
        SCN1: "D",
        SCN2: "D",
        SCN3: "B",
        SCN4: "C",
        SCN5: "A",
        SCN6: "E",
        SCN7: "E",
        SCN8: "A",
        SCN8B: "A",
      },
      reflection: "I would work fewer evenings and stop treating relaxation as something I have to earn.",
    }),
    expected: {
      dimensionRanges: {
        enoughness: [15, 18],
        presence: [15, 18],
        control: [82, 85],
        freedom: [82, 85],
      },
      primaryArchetypes: ["Builder", "Maximizer", "Achiever"],
      requiredPatterns: ["P08", "P15"],
      forbiddenPatterns: ["P03", "P04", "P10", "P13"],
    },
  },
  {
    name: "Financially Insecure Optimist",
    description:
      "High internal confidence despite very low objective financial resilience, with low identity attachment and relatively low money attention.",
    answers: makeAnswers({
      dimensions: {
        security: 6,
        enoughness: 5,
        identityAttachment: 2,
        control: 3,
        freedom: 5,
        presence: 6,
      },
      chosenAttention: 3,
      compelledAttention: 2,
      scenarios: {
        ...commonScenarios,
        SCN1: "E",
        SCN2: "B",
        SCN3: "D",
        SCN4: "E",
        SCN5: "C",
        SCN6: "B",
        SCN7: "A",
      },
      financial: {
        FIN1: "<50k",
        FIN2: "negative",
        FIN3: "<1m",
        FIN4: 8,
      },
    }),
    expected: {
      dimensionRanges: {
        security: [82, 85],
        identityAttachment: [15, 18],
      },
      requiredPatterns: ["P04", "P10"],
      forbiddenPatterns: ["P03", "P05", "P07", "P08"],
    },
  },
];
