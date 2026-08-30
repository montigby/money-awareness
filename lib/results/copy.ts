import type { AssessmentResult, PatternResult, ContradictionResult, DimensionCode } from "@/types/assessment";

export const DIMENSION_COPY: Record<DimensionCode, {
  label: string;
  description: string;
  low: string;
  high: string;
  strengthLow: string;
  strengthHigh: string;
  tradeoffLow: string;
  tradeoffHigh: string;
}> = {
  security: {
    label: "Internal Security",
    description: "How psychologically safe you feel around financial uncertainty.",
    low: "Financial uncertainty tends to carry real emotional weight for you, even when the objective numbers may be manageable.",
    high: "You tend to trust your ability to handle financial uncertainty and recover when circumstances change.",
    strengthLow: "Vigilance can make you unusually prepared and alert to risk.",
    strengthHigh: "Confidence in your ability to adapt can make you resilient under pressure.",
    tradeoffLow: "More resources may not automatically create the same amount of felt safety.",
    tradeoffHigh: "Strong confidence can sometimes make real financial risks feel less urgent than they are.",
  },
  enoughness: {
    label: "Enoughness",
    description: "Your ability to experience current resources and accomplishments as enough.",
    low: "Financial finish lines tend to move as your circumstances improve.",
    high: "You can generally pursue more without needing more in order to feel that your current life is valid or sufficient.",
    strengthLow: "Moving targets can create exceptional momentum and ambition.",
    strengthHigh: "You can pursue goals without making satisfaction completely conditional on reaching them.",
    tradeoffLow: "Achievement may produce less lasting satisfaction because the next benchmark appears quickly.",
    tradeoffHigh: "A strong sense of enough can sometimes reduce the urgency that fuels aggressive growth.",
  },
  identityAttachment: {
    label: "Identity Attachment",
    description: "How strongly financial success influences how you see yourself.",
    low: "Your financial outcomes appear relatively separate from your basic sense of self.",
    high: "Financial progress appears to carry meaning about your competence, success, or identity.",
    strengthLow: "Financial setbacks may be less likely to alter your sense of personal worth.",
    strengthHigh: "Identity attachment can create enormous drive, focus, and persistence.",
    tradeoffLow: "Money may offer less motivational energy when it carries little identity significance.",
    tradeoffHigh: "A financial setback can feel like more than a financial setback when success is tied closely to self-concept.",
  },
  control: {
    label: "Need for Control",
    description: "How much certainty, predictability, and active management you prefer around money.",
    low: "You are relatively comfortable allowing some financial uncertainty to remain unresolved.",
    high: "You tend to feel most comfortable when financial variables are understood and actively managed.",
    strengthLow: "Tolerance for ambiguity can preserve attention and flexibility.",
    strengthHigh: "Planning, optimization, and responsiveness can make you highly resourceful.",
    tradeoffLow: "Comfort with uncertainty can occasionally become under-planning.",
    tradeoffHigh: "Managing money can consume meaningful attention even when the management itself is effective.",
  },
  freedom: {
    label: "Freedom Orientation",
    description: "How strongly money represents autonomy, optionality, and control over your time.",
    low: "Autonomy is not the only or primary thing you appear to want money to provide.",
    high: "Money appears especially valuable to you because it expands your ability to choose how you spend your time and what you can walk away from.",
    strengthLow: "You may be comfortable accepting structure or obligation when it serves other priorities.",
    strengthHigh: "A strong preference for autonomy can help you protect your time and resist status-driven consumption.",
    tradeoffLow: "You may tolerate obligations that someone with a stronger freedom orientation would question sooner.",
    tradeoffHigh: "Commitments that constrain future choices can feel disproportionately expensive, even when financially attractive.",
  },
  presence: {
    label: "Present Enjoyment",
    description: "How easily you allow today's resources to improve today's life.",
    low: "You tend to protect the future well, but may delay some enjoyment until later conditions are satisfied.",
    high: "You are relatively comfortable allowing money to improve your life now rather than only protecting the future.",
    strengthLow: "Future orientation can support saving, discipline, and long-term compounding.",
    strengthHigh: "You are more likely to actually experience the benefits of what you have built.",
    tradeoffLow: "The future can quietly become the place where permission to enjoy life is stored.",
    tradeoffHigh: "Present enjoyment can occasionally come at the expense of long-term optimization.",
  },
};

export const ARCHETYPE_COPY: Record<string, { meaning: string; summary: string }> = {
  Builder: {
    meaning: "Money = creation and progress",
    summary: "You appear energized by building, improving, and seeing what you can create. Financial progress is often interesting because it reflects movement, capability, and possibility.",
  },
  "Freedom Seeker": {
    meaning: "Money = autonomy",
    summary: "Money appears especially valuable because it gives you options: control over your time, the ability to say no, and the ability to walk away.",
  },
  Protector: {
    meaning: "Money = safety",
    summary: "A major function of money for you is protection. Financial resources help reduce vulnerability and create confidence that you and the people you care about will be okay.",
  },
  Maximizer: {
    meaning: "Money = optimization",
    summary: "You tend to engage with money actively. Better allocation, better decisions, and better systems are satisfying in their own right.",
  },
  Achiever: {
    meaning: "Money = accomplishment",
    summary: "Financial progress appears connected to achievement. Money can function as evidence that your effort, judgment, or capability is producing results.",
  },
  Competitor: {
    meaning: "Money = relative progress",
    summary: "Other people's financial success can provide information about your own trajectory. Comparison may motivate you even when you genuinely celebrate someone else's success.",
  },
  Experiencer: {
    meaning: "Money = living",
    summary: "Money appears valuable primarily because of what it lets you experience: time, comfort, generosity, relationships, and a fuller present life.",
  },
  Steward: {
    meaning: "Money = responsibility",
    summary: "You tend to approach money as something to manage carefully and responsibly rather than primarily as a status signal.",
  },
};

export const PATTERN_COPY: Record<string, { title: string; body: string; question?: string }> = {
  P01: {
    title: "Freedom-Control Paradox",
    body: "You value autonomy highly while also preferring substantial control over financial outcomes. The same systems that create freedom can therefore consume some of the freedom they were designed to create.",
    question: "Does the way you manage your money feel as free as the life you are trying to build with it?",
  },
  P02: {
    title: "Achievement Treadmill",
    body: "Achievement appears highly motivating, while satisfaction from achievement may fade relatively quickly. Your ability to create the next goal is a strength; the tradeoff is that arrival can become another starting line.",
  },
  P03: {
    title: "Security Gap",
    body: "Your financial circumstances appear materially safer than they feel. Additional resources may keep improving objective security without producing the same-sized increase in your internal sense of safety.",
  },
  P04: {
    title: "Fragile Confidence",
    body: "Your internal confidence appears stronger than your current financial cushion. That can reflect adaptability and self-trust, while also creating a risk of underestimating genuine financial constraints.",
  },
  P05: {
    title: "Deferred Life",
    body: "You may repeatedly ask your present self to sacrifice for a future version of your life. This can be financially productive while making permission to enjoy what you have built feel perpetually conditional.",
  },
  P06: {
    title: "Conditional Freedom",
    body: "Freedom matters strongly to you, but your responses suggest that fully experiencing it may still be tied to future financial conditions. You may already possess more autonomy than you permit yourself to count.",
  },
  P07: {
    title: "Scorekeeper",
    body: "Other people's success can subtly change the meaning of your own. Comparison may function less like envy and more like a constantly updating benchmark for what is possible or sufficient.",
  },
  P08: {
    title: "Unreachable Number",
    body: "You do not appear to have a stable financial finish line, and your sense of enoughness is low. You may be trying to solve a problem with a number that does not currently have a number.",
  },
  P09: {
    title: "Earned Permission",
    body: "Enjoyment may feel easiest after productivity, responsibility, or financial progress has first been satisfied. Rest can therefore become something that has to be earned repeatedly.",
  },
  P10: {
    title: "Money Without Status",
    body: "Your responses suggest relatively little connection between financial success and social identity. Money seems more important for what it enables than for what it communicates.",
  },
  P11: {
    title: "Financial Immersion",
    body: "You both enjoy thinking about money and sometimes have difficulty stopping. Financial thinking is simultaneously an interest and a source of persistent mental occupation.",
  },
  P12: {
    title: "Financial Curiosity",
    body: "You think about money because you find it interesting, not primarily because you feel compelled to. Financial attention appears more chosen than intrusive.",
  },
  P13: {
    title: "Financial Preoccupation",
    body: "Money occupies more of your attention than you would ideally choose, without appearing especially enjoyable as a subject. The attention may feel more compulsory than curious.",
  },
  P14: {
    title: "Financial Detachment",
    body: "Money appears to occupy relatively little voluntary or involuntary mental attention. It may function more as a practical tool than an ongoing area of interest.",
  },
  P15: {
    title: "Goalpost Drift",
    body: "Your responses suggest that financial targets tend to expand once they become reachable. Progress may change the benchmark faster than it changes your sense of completion.",
  },
};

export const CONTRADICTION_COPY: Record<string, { title: string; body: string }> = {
  C01: {
    title: "Freedom vs. Time Tradeoff",
    body: "You identify autonomy as one of money's primary purposes, yet when asked to trade income directly for time, you favored income. Another value—achievement, security, opportunity, or something else—may carry more weight in actual decisions than you consciously assign it.",
  },
  C02: {
    title: "Enoughness vs. Finish Line",
    body: "Your general responses suggest a meaningful sense of enoughness, while your behavioral choices suggest continued accumulation still carries substantial importance. Both can be true; the difference is worth noticing.",
  },
  C03: {
    title: "Security Inconsistency",
    body: "Your general answers suggest strong financial confidence, while your stress response and money attention suggest more vulnerability under pressure. We treat this as a low-confidence tension rather than a conclusion.",
  },
};

export function dimensionInterpretation(code: DimensionCode, score: number) {
  const copy = DIMENSION_COPY[code];
  const high = score >= 50;
  return {
    ...copy,
    interpretation: high ? copy.high : copy.low,
    strength: high ? copy.strengthHigh : copy.strengthLow,
    tradeoff: high ? copy.tradeoffHigh : copy.tradeoffLow,
  };
}

export function resultHeadline(result: AssessmentResult) {
  const primary = result.archetypes.primary?.name;
  const secondary = result.archetypes.secondary?.name;
  if (primary && secondary) return `${primary} × ${secondary}`;
  if (primary) return primary;
  return "Your Money Profile";
}

export function patternCopy(pattern: PatternResult) {
  return PATTERN_COPY[pattern.code] ?? {
    title: pattern.name,
    body: "This pattern was detected from the combination of your assessment responses.",
  };
}

export function contradictionCopy(contradiction: ContradictionResult) {
  return CONTRADICTION_COPY[contradiction.code] ?? {
    title: contradiction.name,
    body: "Your answers reveal a tension between two parts of your financial decision-making.",
  };
}
