export type VariantType = 'A' | 'B';
export type StepId = 'welcome' | 'assessment' | 'practice' | 'reward' | 'path' | 'community' | 'launch';
export type PersonaName = 'Curious Beginner' | 'Aspiring Professional' | 'Career Switcher' | 'Passive Learner';
export type ScenarioKey = 'pessimistic' | 'base' | 'optimistic';

export interface AssessmentAnswers {
  confidence?: 'new' | 'some' | 'comfortable';
  goal?: 'investing' | 'budgeting' | 'career';
  risk?: 'cautious' | 'balanced' | 'explore';
  style?: 'examples' | 'reading' | 'guided';
}

export interface TrackRecommendation {
  persona: PersonaName;
  personaCode: 'curious_beginner' | 'aspiring_professional' | 'career_switcher' | 'passive_learner';
  title: string;
  sub: string;
  why: string;
  modules: [string, string, string];
}

export const ONBOARDING_MAX_XP = 260;

export function getFlowSequence(variant: VariantType): StepId[] {
  return variant === 'A'
    ? ['welcome', 'assessment', 'practice', 'reward', 'path', 'community', 'launch']
    : ['welcome', 'practice', 'reward', 'assessment', 'path', 'community', 'launch'];
}

export function resolvePersona(answers: AssessmentAnswers): PersonaName {
  const { confidence, goal } = answers;
  if (confidence === 'new' || goal === 'budgeting') return 'Curious Beginner';
  if (goal === 'career') return 'Career Switcher';
  if (confidence === 'comfortable' && goal === 'investing') return 'Aspiring Professional';
  if (!confidence && !goal) return 'Passive Learner';
  return 'Curious Beginner';
}

export function getTrackRecommendation(answers: AssessmentAnswers): TrackRecommendation {
  const persona = resolvePersona(answers);
  if (persona === 'Aspiring Professional') {
    return {
      persona,
      personaCode: 'aspiring_professional',
      title: 'Portfolio Foundations',
      sub: 'Build from market basics to portfolio choices.',
      why: 'Based on your comfort and investing goal.',
      modules: ['Markets in 5 minutes', 'Portfolio building blocks', 'Risk and diversification'],
    };
  }
  if (persona === 'Career Switcher') {
    return {
      persona,
      personaCode: 'career_switcher',
      title: 'Finance for Your Next Step',
      sub: 'A guided route through the concepts used at work.',
      why: 'Based on the career goal you chose.',
      modules: ['Finance language, made clear', 'How markets fit together', 'Practice a portfolio decision'],
    };
  }
  if (persona === 'Passive Learner') {
    return {
      persona,
      personaCode: 'passive_learner',
      title: 'Money Basics',
      sub: 'Short, useful lessons you can take at your own pace.',
      why: 'A light start for when you are exploring.',
      modules: ['Everyday money choices', 'Investing essentials', 'Set a personal learning goal'],
    };
  }
  return {
    persona: 'Curious Beginner',
    personaCode: 'curious_beginner',
    title: 'Finance Foundations',
    sub: 'Start with a few clear ideas, then try them in practice.',
    why: 'Based on your answers; you can change this any time.',
    modules: ['A first look at markets', 'Risk, explained simply', 'Build a balanced example'],
  };
}

export function awardXpIdempotent(
  currentXp: number,
  awardsGiven: Record<string, boolean>,
  awardId: string,
  amount: number
): { xp: number; awards: Record<string, boolean>; awarded: boolean } {
  if (awardsGiven[awardId] || amount <= 0) {
    return { xp: currentXp, awards: awardsGiven, awarded: false };
  }
  const nextXp = Math.min(ONBOARDING_MAX_XP, currentXp + amount);
  return {
    xp: nextXp,
    awards: { ...awardsGiven, [awardId]: true },
    awarded: true,
  };
}

export function getLevelForXp(xp: number): { level: number; name: string; nextThreshold: number | null; access: string } {
  if (xp >= 900) return { level: 5, name: 'Guide', nextThreshold: null, access: 'Optional profile flair and peer mentoring interest' };
  if (xp >= 500) return { level: 4, name: 'Practitioner', nextThreshold: 900, access: 'Optional advanced practice sandbox settings' };
  if (xp >= 250) return { level: 3, name: 'Explorer', nextThreshold: 500, access: 'Optional profile theme and deeper progress summary' };
  if (xp >= 100) return { level: 2, name: 'Builder', nextThreshold: 250, access: 'Optional avatar trim and progress detail' };
  return { level: 1, name: 'Starter', nextThreshold: 100, access: 'Full core learning path' };
}

export interface FunnelStepProjection {
  step: number;
  stepName: string;
  conditionalContinueRate: number;
  cumulativeConversion: number;
  registrations: number;
  usersReached: number;
}

export const SCENARIO_STEP_RATES: Record<ScenarioKey, number[]> = {
  pessimistic: [0.97, 0.90, 0.88, 0.93, 0.93, 0.95, 0.98],
  base: [0.98, 0.92, 0.91, 0.96, 0.95, 0.97, 0.99],
  optimistic: [0.99, 0.95, 0.94, 0.97, 0.96, 0.98, 0.99],
};

export const STEP_NAMES_VARIANT_A = [
  'Welcome and value',
  'Micro-assessment',
  'Guided first action',
  'First reward',
  'Learning path',
  'Community preview',
  'Goal and launch',
];

export function calculateFunnelProjections(
  scenario: ScenarioKey,
  registrations = 4700,
  exitRiskMultiplier = 1.0
): FunnelStepProjection[] {
  const baseRates = SCENARIO_STEP_RATES[scenario];
  let cumulative = 1.0;

  return baseRates.map((rate, index) => {
    const exitRisk = Math.min(0.95, Math.max(0.001, (1 - rate) * exitRiskMultiplier));
    const adjustedRate = 1 - exitRisk;
    cumulative *= adjustedRate;
    return {
      step: index + 1,
      stepName: STEP_NAMES_VARIANT_A[index],
      conditionalContinueRate: Number(adjustedRate.toFixed(4)),
      cumulativeConversion: Number(cumulative.toFixed(4)),
      registrations,
      usersReached: Math.round(registrations * cumulative),
    };
  });
}

export function calculateCohortRevenue(
  registrations: number,
  d30Rate: number,
  arpu = 2.4,
  baselineD30Rate = 0.08
): {
  d30ActiveUsers: number;
  monthlyRevenue: number;
  baselineRevenue: number;
  incrementalMonthly: number;
  annualisedIncremental: number;
} {
  const d30ActiveUsers = Math.round(registrations * d30Rate);
  const baselineUsers = Math.round(registrations * baselineD30Rate);
  const monthlyRevenue = d30ActiveUsers * arpu;
  const baselineRevenue = baselineUsers * arpu;
  const incrementalMonthly = monthlyRevenue - baselineRevenue;
  const annualisedIncremental = incrementalMonthly * 12;

  return {
    d30ActiveUsers,
    monthlyRevenue: Math.round(monthlyRevenue),
    baselineRevenue: Math.round(baselineRevenue),
    incrementalMonthly: Math.round(incrementalMonthly),
    annualisedIncremental: Math.round(annualisedIncremental),
  };
}

export function calculateAbSampleSize(
  pA: number,
  pB: number,
  allowanceFraction = 0.1,
  monthlyRegistrations = 4700
): {
  evaluablePerArm: number;
  plannedPerArm: number;
  totalPlanned: number;
  expectedDays: number;
  minimumDays: number;
  d30ReadoutDay: number;
} {
  const diff = Math.abs(pB - pA);
  if (diff <= 0.001) {
    return {
      evaluablePerArm: 0,
      plannedPerArm: 0,
      totalPlanned: 0,
      expectedDays: 0,
      minimumDays: 21,
      d30ReadoutDay: 51,
    };
  }
  const pBar = (pA + pB) / 2;
  const zAlpha = 1.959964; // two-sided 0.05
  const zBeta = 0.841621; // 80% power
  const numerator =
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
    zBeta * Math.sqrt(pA * (1 - pA) + pB * (1 - pB));
  const rawN = Math.pow(numerator / diff, 2);
  const evaluablePerArm = Math.ceil(rawN);
  const plannedPerArm = Math.ceil(evaluablePerArm / (1 - allowanceFraction));
  const signupsPerArmPerDay = monthlyRegistrations / 2 / 30;
  const expectedDays = Number((plannedPerArm / signupsPerArmPerDay).toFixed(1));
  const minimumDays = Math.max(21, Math.ceil(expectedDays));
  const d30ReadoutDay = minimumDays + 30;

  return {
    evaluablePerArm,
    plannedPerArm,
    totalPlanned: plannedPerArm * 2,
    expectedDays,
    minimumDays,
    d30ReadoutDay,
  };
}
