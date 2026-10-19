import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFlowSequence,
  resolvePersona,
  getTrackRecommendation,
  awardXpIdempotent,
  getLevelForXp,
  calculateFunnelProjections,
  calculateCohortRevenue,
  calculateAbSampleSize,
} from './onboardingLogic.ts';

test('Variant A and B sequences preserve 7 steps and swap assessment vs practice/reward', () => {
  const seqA = getFlowSequence('A');
  const seqB = getFlowSequence('B');
  assert.equal(seqA.length, 7);
  assert.equal(seqB.length, 7);
  assert.deepEqual(seqA.slice(0, 4), ['welcome', 'assessment', 'practice', 'reward']);
  assert.deepEqual(seqB.slice(0, 4), ['welcome', 'practice', 'reward', 'assessment']);
});

test('Persona resolution maps answers accurately', () => {
  assert.equal(resolvePersona({}), 'Passive Learner');
  assert.equal(resolvePersona({ confidence: 'new', goal: 'investing' }), 'Curious Beginner');
  assert.equal(resolvePersona({ confidence: 'comfortable', goal: 'investing' }), 'Aspiring Professional');
  assert.equal(resolvePersona({ confidence: 'some', goal: 'career' }), 'Career Switcher');

  const rec = getTrackRecommendation({ confidence: 'comfortable', goal: 'investing' });
  assert.equal(rec.title, 'Portfolio Foundations');
});

test('XP economy awards idempotently and caps at 260 XP', () => {
  let state = { xp: 0, awards: {} as Record<string, boolean> };
  const r1 = awardXpIdempotent(state.xp, state.awards, 'profile', 20);
  assert.equal(r1.xp, 20);
  assert.equal(r1.awarded, true);

  // Duplicate award is blocked
  const r2 = awardXpIdempotent(r1.xp, r1.awards, 'profile', 20);
  assert.equal(r2.xp, 20);
  assert.equal(r2.awarded, false);

  // Cap at 260 XP
  const r3 = awardXpIdempotent(240, r2.awards, 'launch', 50);
  assert.equal(r3.xp, 260);
  assert.equal(getLevelForXp(260).name, 'Explorer');
});

test('Funnel projections match base, pessimistic, and optimistic rates and sensitivity math', () => {
  const baseSteps = calculateFunnelProjections('base', 4700, 1.0);
  assert.equal(baseSteps.length, 7);
  assert.equal(baseSteps[0].usersReached, 4606);
  assert.equal(baseSteps[2].usersReached, 3856); // 82.05% first action
  assert.equal(baseSteps[6].usersReached, 3377); // 71.86% completion

  const highExitSteps = calculateFunnelProjections('base', 4700, 1.2);
  // +20% exit risk reduces completion to ~67.1%
  assert.equal(Math.round(highExitSteps[6].cumulativeConversion * 1000) / 10, 67.1);
});

test('Cohort revenue and A/B sample size match pre-registered calculations', () => {
  const rev = calculateCohortRevenue(4700, 0.18, 2.4, 0.08);
  assert.equal(rev.d30ActiveUsers, 846);
  assert.equal(rev.monthlyRevenue, 2030);
  assert.equal(rev.baselineRevenue, 902);
  assert.equal(rev.incrementalMonthly, 1128);
  assert.equal(rev.annualisedIncremental, 13536);

  const ab = calculateAbSampleSize(0.72, 0.77, 0.1, 4700);
  assert.equal(ab.evaluablePerArm, 1192);
  assert.equal(ab.plannedPerArm, 1325);
  assert.equal(ab.minimumDays, 21);
  assert.equal(ab.d30ReadoutDay, 51);
});
