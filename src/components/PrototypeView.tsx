import React, { useState } from 'react';
import {
  VariantType,
  AssessmentAnswers,
  getFlowSequence,
  getTrackRecommendation,
  awardXpIdempotent,
  getLevelForXp,
} from '../utils/onboardingLogic';
import { ASSESSMENT_QUESTIONS } from '../data/workbridgeData';

export interface TelemetryEventLog {
  id: string;
  timestamp: string;
  eventName: string;
  stepId: string;
  sequencePosition: number;
  variant: VariantType;
  personaType: string;
  cumulativeXp: number;
  properties: Record<string, string | number | boolean>;
}

interface PrototypeViewProps {
  variant: VariantType;
  onVariantChange: (v: VariantType) => void;
  reduceMotion: boolean;
  onToggleReduceMotion: () => void;
}

export const PrototypeView: React.FC<PrototypeViewProps> = ({
  variant,
  onVariantChange,
  reduceMotion,
  onToggleReduceMotion,
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [preferredName, setPreferredName] = useState<string>('');
  const [practiceDone, setPracticeDone] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [communityViewed, setCommunityViewed] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [goalMinutes, setGoalMinutes] = useState<'5' | '10' | '15'>('5');
  const [finished, setFinished] = useState<boolean>(false);
  const [xp, setXp] = useState<number>(0);
  const [awards, setAwards] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [overridePersona, setOverridePersona] = useState<string | null>(null);

  const flow = getFlowSequence(variant);
  const currentStep = flow[stepIndex];
  const baseTrack = getTrackRecommendation(answers);
  const track = overridePersona
    ? getTrackRecommendation(
        overridePersona === 'Aspiring Professional'
          ? { confidence: 'comfortable', goal: 'investing' }
          : overridePersona === 'Career Switcher'
          ? { confidence: 'some', goal: 'career' }
          : overridePersona === 'Passive Learner'
          ? {}
          : { confidence: 'new', goal: 'budgeting' }
      )
    : baseTrack;

  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEventLog[]>([
    {
      id: 'evt-init-1',
      timestamp: new Date().toISOString().slice(11, 19),
      eventName: 'onboarding_assigned_variant',
      stepId: 'welcome',
      sequencePosition: 1,
      variant: 'A',
      personaType: 'passive_learner',
      cumulativeXp: 0,
      properties: { experiment_id: 'wb-seq-2026', assignment_method: 'deterministic_hash', sequence_version: 'v1.0' },
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const emitEvent = (
    eventName: string,
    props: Record<string, string | number | boolean> = {},
    nextXpValue = xp,
    stepOverride = currentStep,
    posOverride = stepIndex + 1
  ) => {
    const entry: TelemetryEventLog = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().slice(11, 19),
      eventName,
      stepId: stepOverride,
      sequencePosition: posOverride,
      variant,
      personaType: track.personaCode,
      cumulativeXp: nextXpValue,
      properties: props,
    };
    setTelemetryLogs((prev) => [entry, ...prev.slice(0, 29)]);
  };

  const giveAward = (awardId: string, amount: number, label: string, eventName = 'gamification_earned_xp') => {
    const result = awardXpIdempotent(xp, awards, awardId, amount);
    if (result.awarded) {
      setXp(result.xp);
      setAwards(result.awards);
      showToast(label);
      emitEvent(eventName, { action_id: awardId, xp_amount: amount }, result.xp);
      return result.xp;
    }
    return xp;
  };

  const resetFlow = (nextVariant: VariantType = variant) => {
    setStepIndex(0);
    setQuestionIndex(0);
    setAnswers({});
    setPreferredName('');
    setPracticeDone(false);
    setTooltipOpen(false);
    setSelectedModules([]);
    setCommunityViewed(false);
    setSelectedGroup(null);
    setGoalMinutes('5');
    setFinished(false);
    setXp(0);
    setAwards({});
    setOverridePersona(null);
    if (nextVariant !== variant) {
      onVariantChange(nextVariant);
    }
    setTelemetryLogs([
      {
        id: `evt-reset-${Date.now()}`,
        timestamp: new Date().toISOString().slice(11, 19),
        eventName: 'onboarding_assigned_variant',
        stepId: 'welcome',
        sequencePosition: 1,
        variant: nextVariant,
        personaType: 'passive_learner',
        cumulativeXp: 0,
        properties: { experiment_id: 'wb-seq-2026', variant: nextVariant, sequence_version: 'v1.0' },
      },
    ]);
  };

  const advanceToStep = (nextIdx: number) => {
    const nextStepId = flow[nextIdx];
    setStepIndex(nextIdx);
    emitEvent('onboarding_viewed_step', { step_id: nextStepId, sequence_position: nextIdx + 1 }, xp, nextStepId, nextIdx + 1);
    if (nextStepId === 'community' && !communityViewed) {
      setCommunityViewed(true);
      const res = awardXpIdempotent(xp, awards, 'community-view', 10);
      if (res.awarded) {
        setXp(res.xp);
        setAwards(res.awards);
        showToast('+10 XP for exploring community');
        emitEvent('community_viewed_preview', { preview_version: 'illustrative_v1', xp_amount: 10 }, res.xp, 'community', nextIdx + 1);
      }
    }
  };

  const handlePrimaryNext = () => {
    if (currentStep === 'welcome') {
      const updatedXp = giveAward(
        'profile',
        20,
        preferredName.trim() ? 'Profile ready · +20 XP' : 'Let’s get started · +20 XP',
        'profile_completed_basics'
      );
      emitEvent('onboarding_completed_step', { step_id: 'welcome' }, updatedXp);
      advanceToStep(stepIndex + 1);
      return;
    }

    if (currentStep === 'assessment') {
      if (questionIndex < 3) {
        setQuestionIndex((q) => q + 1);
        emitEvent('assessment_viewed_question', { question_id: ASSESSMENT_QUESTIONS[questionIndex + 1].id, question_position: questionIndex + 2 });
        return;
      }
      setQuestionIndex(0);
      emitEvent('assessment_completed_flow', { answered_count: Object.keys(answers).length, assigned_persona: track.personaCode });
      advanceToStep(stepIndex + 1);
      return;
    }

    if (currentStep === 'practice') {
      if (!practiceDone) {
        setPracticeDone(true);
        const res1 = awardXpIdempotent(xp, awards, 'practice', 80);
        const res2 = awardXpIdempotent(res1.xp, res1.awards, 'first-practice-badge', 25);
        setXp(res2.xp);
        setAwards(res2.awards);
        showToast('Practice complete · +80 XP & First Practice Badge (+25 XP)');
        emitEvent(
          'simulation_completed_action',
          { asset_id: 'NFD', quantity: 1, outcome_code: 'explained_completion', xp_awarded: 105 },
          res2.xp
        );
        return;
      }
      advanceToStep(stepIndex + 1);
      return;
    }

    if (currentStep === 'launch') {
      const finalXp = giveAward('onboarding-complete', 50, 'Onboarding complete · +50 XP', 'launch_clicked_lesson');
      setFinished(true);
      emitEvent('onboarding_completed_step', { step_id: 'launch', final_xp: finalXp, track_id: track.title }, finalXp);
      return;
    }

    advanceToStep(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      emitEvent('onboarding_clicked_back', { from_step_id: currentStep, to_step_id: flow[prevIdx] });
      setStepIndex(prevIdx);
    }
  };

  const getStepMeta = (): { title: string; subtitle: string; primaryCta: string } => {
    if (finished) {
      return {
        title: 'Your first step is complete',
        subtitle: 'A first practice action, and a clear next lesson',
        primaryCta: 'Lesson ready in WorkBridge',
      };
    }
    switch (currentStep) {
      case 'welcome':
        return {
          title: 'Learn money skills by trying them',
          subtitle: 'A little practice, a lot more confidence',
          primaryCta: variant === 'A' ? 'Let’s find your starting point →' : 'Try a 30-second practice →',
        };
      case 'assessment':
        return {
          title: 'A few quick answers make your path more relevant',
          subtitle: `Your answers stay editable · ${track.persona}`,
          primaryCta: questionIndex < 3 ? 'Next question →' : 'See my learning path →',
        };
      case 'practice':
        return {
          title: 'Learn by doing, in a safe example',
          subtitle: 'One small action · Clear feedback · No real money',
          primaryCta: !practiceDone ? 'Place my practice order →' : 'See what I earned →',
        };
      case 'reward':
        return {
          title: 'Your effort earned the reward',
          subtitle: 'The badge follows the practice action · Not an outcome',
          primaryCta: 'Build my learning path →',
        };
      case 'path':
        return {
          title: `A path built around ${answers.goal ? 'your interests' : 'a clear first lesson'}`,
          subtitle: 'A helpful suggestion, not a commitment',
          primaryCta: 'Explore the community →',
        };
      case 'community':
        return {
          title: 'Connection is available when you want it',
          subtitle: 'Preview, continue, or choose a quiet start',
          primaryCta: 'Set my first learning goal →',
        };
      case 'launch':
        return {
          title: 'One clear next step, on your terms',
          subtitle: 'Your first full lesson is ready',
          primaryCta: 'Start my first lesson →',
        };
    }
  };

  const meta = getStepMeta();
  const levelInfo = getLevelForXp(xp);

  return (
    <div className="space-y-6">
      {/* Prototype Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#DCE5ED] rounded-xl px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#586B7F]">
          <span className="font-semibold text-[#1B3A5C] uppercase tracking-wider">Interactive Prototype</span>
          <span aria-hidden="true">·</span>
          <span>Sample data</span>
          <span aria-hidden="true">·</span>
          <span>No account or real money</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div
            className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-[#F3F7FA] border border-[#DCE5ED] rounded-lg w-full sm:w-auto"
            role="group"
            aria-label="Choose onboarding prototype variant"
          >
            <button
              type="button"
              onClick={() => resetFlow('A')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors truncate ${
                variant === 'A' ? 'bg-[#1B3A5C] text-white' : 'text-[#586B7F] hover:text-[#1B3A5C]'
              }`}
            >
              Variant A · Personalise first
            </button>
            <button
              type="button"
              onClick={() => resetFlow('B')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors truncate ${
                variant === 'B' ? 'bg-[#0F766E] text-white' : 'text-[#586B7F] hover:text-[#1B3A5C]'
              }`}
            >
              Variant B · Practice first
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleReduceMotion}
            aria-pressed={reduceMotion}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              reduceMotion
                ? 'bg-[#EAF3F9] border-[#2E75B6] text-[#1B3A5C]'
                : 'bg-white border-[#DCE5ED] text-[#586B7F] hover:text-[#1B3A5C]'
            }`}
          >
            {reduceMotion ? 'Motion reduced' : 'Reduce motion'}
          </button>

          <button
            type="button"
            onClick={() => setShowTelemetry((prev) => !prev)}
            aria-pressed={showTelemetry}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE5ED] bg-white text-[#1B3A5C] hover:bg-[#F3F7FA] transition-colors whitespace-nowrap shrink-0"
          >
            {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>

          <button
            type="button"
            onClick={() => resetFlow(variant)}
            className="px-3 py-1.5 text-xs font-semibold text-[#586B7F] hover:text-[#1B3A5C] underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            Restart Flow
          </button>
        </div>
      </div>

      {/* Main Split Grid: Onboarding Stage + Optional Live Event Telemetry */}
      <div className={`grid gap-6 items-start ${showTelemetry ? 'lg:grid-cols-[1fr_360px]' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
        {/* Left: Onboarding Flow Container */}
        <div className="bg-white border border-[#DCE5ED] rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Step Sequence Jumper & Progress Bar */}
          <div className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#2E75B6]">
                  YOUR FIRST SESSION · VARIANT {variant}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] mt-1">{meta.title}</h1>
              </div>
              <div className="text-xs text-[#586B7F] font-mono tabular-nums">
                {finished ? '7 of 7 complete' : `Step ${stepIndex + 1} of 7 · ~5 min`}
              </div>
            </div>

            <div
              className="h-2 rounded-full bg-[#E2EAF1] overflow-hidden"
              role="progressbar"
              aria-label="Onboarding progress"
              aria-valuemin={0}
              aria-valuemax={7}
              aria-valuenow={finished ? 7 : stepIndex + 1}
            >
              <div
                className="h-full bg-gradient-to-r from-[#2E75B6] to-[#0F766E] transition-transform duration-200 origin-left"
                style={{ transform: `scaleX(${(finished ? 7 : stepIndex + 1) / 7})` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs text-[#586B7F]">
              <span>{meta.subtitle}</span>
              <div className="flex flex-wrap items-center gap-1" role="navigation" aria-label="Direct step navigation">
                {flow.map((stepId, idx) => {
                  const isCurrent = !finished && idx === stepIndex;
                  const isDone = finished || idx < stepIndex;
                  return (
                    <button
                      key={stepId}
                      type="button"
                      onClick={() => {
                        setFinished(false);
                        advanceToStep(idx);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isCurrent
                          ? 'bg-[#1B3A5C] text-white font-semibold'
                          : isDone
                          ? 'bg-[#E7F4EF] text-[#0F766E] hover:bg-[#d3ebe2]'
                          : 'text-[#586B7F] hover:bg-[#F3F7FA]'
                      }`}
                    >
                      {idx + 1}. {stepId.charAt(0).toUpperCase() + stepId.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-[#DCE5ED] mb-6" />

          {/* Active Screen Stage */}
          <div className="min-h-[380px] flex flex-col justify-between" aria-live="polite">
            {finished ? (
              <div className="max-w-xl mx-auto text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#E7F4EF] text-[#0F766E] flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">LEARNING STARTED</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C]">
                  Nice work{preferredName.trim() ? `, ${preferredName.trim()}` : ''}. You’re ready for the next idea.
                </h2>
                <p className="text-[#586B7F] text-base leading-relaxed">
                  You completed a sandbox practice action and chose a learning path. Your demo session ends here; the
                  full lesson opens next in WorkBridge.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-5 bg-[#F3F7FA] border border-[#DCE5ED] rounded-xl text-sm text-[#243447] font-mono tabular-nums">
                  <span>
                    <strong className="text-[#1B3A5C]">{xp} / 260 XP</strong> earned ({levelInfo.name})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="text-[#0F766E]">First Practice</strong> badge
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="text-[#1B3A5C]">{track.title}</strong> track
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => resetFlow(variant === 'A' ? 'B' : 'A')}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#2E75B6] text-white hover:bg-[#1B3A5C] transition-colors"
                  >
                    Compare with Variant {variant === 'A' ? 'B (Practice first)' : 'A (Personalise first)'}
                  </button>
                </div>
              </div>
            ) : currentStep === 'welcome' ? (
              <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-8 items-center py-2">
                <div className="space-y-5">
                  <div className="text-xs font-bold tracking-wider uppercase text-[#2E75B6]">
                    01 · YOUR LEARNING JOURNEY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] leading-tight">
                    {preferredName.trim()
                      ? `Welcome, ${preferredName.trim()}. Let’s make money skills feel more doable.`
                      : 'Build money confidence by learning through practice, one small step at a time.'}
                  </h2>
                  <p className="text-base text-[#586B7F] leading-relaxed">
                    Explore financial ideas in a safe simulation, then follow a learning path made for your goals.
                  </p>
                  <div className="space-y-2 pt-1">
                    <label htmlFor="preferredName" className="block text-xs font-bold text-[#243447]">
                      What should we call you? <span className="font-normal text-[#586B7F]">· Optional</span>
                    </label>
                    <input
                      id="preferredName"
                      type="text"
                      maxLength={32}
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full max-w-xs h-11 px-3.5 rounded-lg border border-[#DCE5ED] bg-white text-sm text-[#243447] focus:outline-none focus:border-[#2E75B6]"
                    />
                  </div>
                  <ul className="space-y-2.5 pt-2 text-sm text-[#243447]">
                    {[
                      'Try a practice example with no real money',
                      'Get a short path that fits your starting point',
                      'About five minutes to your first full lesson',
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#E7F4EF] text-[#0F766E] flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right visual illustration */}
                <div className="bg-[#F3F7FA] border border-[#DCE5ED] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] relative">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#2E75B6] to-[#1B3A5C] text-white flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 100 100" className="w-20 h-20" role="img" aria-label="Practice coin symbol">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
                      <path
                        d="M36 56c2-15 12-24 30-26-2 18-11 28-27 30M39 61l22-24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M30 75h40" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="mt-5 text-center space-y-1">
                    <div className="text-xs font-semibold text-[#0F766E]">Practice Trade · Sandbox Only</div>
                    <div className="text-xs text-[#586B7F]">Zero financial risk · Immediate concept feedback</div>
                  </div>
                </div>
              </div>
            ) : currentStep === 'assessment' ? (
              <div className="max-w-2xl mx-auto w-full space-y-5 py-2">
                {(() => {
                  const q = ASSESSMENT_QUESTIONS[questionIndex];
                  const selectedVal = answers[q.id];
                  return (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                            A QUICK CHECK-IN
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C] mt-1">
                            Let’s shape your learning path
                          </h2>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {ASSESSMENT_QUESTIONS.map((item, qIdx) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setQuestionIndex(qIdx)}
                              className={`w-7 h-7 rounded-md text-xs font-mono font-bold transition-colors ${
                                qIdx === questionIndex
                                  ? 'bg-[#1B3A5C] text-white'
                                  : answers[item.id]
                                  ? 'bg-[#E7F4EF] text-[#0F766E]'
                                  : 'bg-[#F3F7FA] text-[#586B7F]'
                              }`}
                              aria-label={`Question ${qIdx + 1}`}
                            >
                              {qIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-base font-semibold text-[#243447]" id="questionPrompt">
                        {q.prompt}
                      </p>

                      <div className="grid sm:grid-cols-3 gap-3" role="group" aria-labelledby="questionPrompt">
                        {q.choices.map(([code, title, desc]) => {
                          const isSelected = selectedVal === code;
                          return (
                            <button
                              key={code}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                const wasAnswered = Boolean(answers[q.id]);
                                setAnswers((prev) => ({ ...prev, [q.id]: code as never }));
                                setOverridePersona(null);
                                if (!wasAnswered) {
                                  giveAward(
                                    `assessment-${q.id}`,
                                    10,
                                    '+10 XP for sharing what helps you learn',
                                    'assessment_answered_question'
                                  );
                                } else {
                                  emitEvent('assessment_answered_question', { question_id: q.id, answer_code: code });
                                }
                              }}
                              className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between min-h-[104px] ${
                                isSelected
                                  ? 'border-[#2E75B6] bg-[#EAF3F9] text-[#1B3A5C]'
                                  : 'border-[#DCE5ED] bg-white hover:bg-[#F3F7FA] text-[#243447]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-[#1B3A5C]">{title}</span>
                                {isSelected && <span className="text-xs font-bold text-[#2E75B6]">✓</span>}
                              </div>
                              <span className="text-xs text-[#586B7F] mt-2 leading-relaxed">{desc}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F3F7FA] border border-[#DCE5ED] text-xs text-[#243447] flex flex-wrap items-center justify-between gap-2">
                        <span>
                          {selectedVal
                            ? q.feedback
                            : 'Choose the answer that feels closest. There is no right or wrong response.'}
                        </span>
                        <span className="font-mono text-[#2E75B6]">Suggested persona: {track.persona}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-[#586B7F]">
                        <button
                          type="button"
                          onClick={() => {
                            emitEvent('assessment_skipped_question', { question_id: q.id, skip_reason: 'user_skipped' });
                            showToast('No problem. Your path will stay flexible.');
                            if (questionIndex < 3) {
                              setQuestionIndex((prev) => prev + 1);
                            } else {
                              setQuestionIndex(0);
                              advanceToStep(stepIndex + 1);
                            }
                          }}
                          className="underline underline-offset-4 hover:text-[#1B3A5C]"
                        >
                          Skip this question
                        </button>
                        <span>You can update your answers later · Not a financial suitability test</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : currentStep === 'practice' ? (
              <div className="space-y-5 py-1">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                    GUIDED PRACTICE · SANDBOX ONLY
                  </div>
                  <h2 className="text-2xl font-bold text-[#1B3A5C] mt-1">Try a small practice order</h2>
                  <p className="text-sm text-[#586B7F] mt-1 max-w-2xl">
                    Use a fictional company and practice credits to see how an order works. The learning win is
                    understanding the action, not making a profit.
                  </p>
                </div>

                <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
                  {/* Left: Fictional Market Quote Card */}
                  <div className="bg-[#F3F7FA] border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#1B3A5C]">Northstar Foods</h3>
                          <p className="text-xs text-[#586B7F]">Fictional learning example · NFD</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                          No Real Money
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline gap-2.5">
                        <span className="text-3xl font-bold font-mono tabular-nums text-[#1B3A5C]">INR 100.00</span>
                        <span className="text-xs text-[#586B7F]">Practice quote · 1 unit</span>
                      </div>

                      <svg
                        viewBox="0 0 420 130"
                        className="w-full h-32 mt-3"
                        role="img"
                        aria-label="Illustrative practice chart with a gently changing line, not a forecast"
                      >
                        <defs>
                          <linearGradient id="wbChartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="#2E75B6" stopOpacity="0.22" />
                            <stop offset="1" stopColor="#2E75B6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0 25H420M0 65H420M0 105H420" stroke="#DCE5ED" strokeWidth="1" />
                        <path
                          d="M4 98 L45 85 L83 91 L121 68 L159 74 L198 52 L238 58 L280 39 L322 50 L362 32 L416 43 L416 122 L4 122Z"
                          fill="url(#wbChartFill)"
                        />
                        <path
                          d="M4 98 L45 85 L83 91 L121 68 L159 74 L198 52 L238 58 L280 39 L322 50 L362 32 L416 43"
                          fill="none"
                          stroke="#2E75B6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex justify-between text-[11px] text-[#586B7F] mt-1">
                        <span>Example starts</span>
                        <span>Illustrative movement · not a forecast</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#DCE5ED] flex items-center justify-between gap-2 text-xs text-[#243447]">
                      <span>Market prices can move down as well as up.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTooltipOpen((prev) => !prev);
                          emitEvent('simulation_clicked_tooltip', { tooltip_id: 'price_risk', concept_id: 'volatility' });
                        }}
                        className="font-semibold text-[#2E75B6] hover:underline whitespace-nowrap shrink-0"
                      >
                        {tooltipOpen ? 'Hide risk note' : 'Why prices change?'}
                      </button>
                    </div>
                    {tooltipOpen && (
                      <div className="mt-2 p-3 rounded-lg bg-white border border-[#DCE5ED] text-xs text-[#243447]">
                        <strong>Concept check:</strong> A buy order executes at the current practice quote, while future
                        value fluctuates with supply, demand, and company fundamentals. Fixed XP rewards completing the
                        lesson, never price luck.
                      </div>
                    )}
                  </div>

                  {/* Right: Practice Order Execution Card */}
                  <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-[#1B3A5C]">Your first practice action</h3>
                      <p className="text-xs text-[#586B7F] leading-relaxed">
                        Place a one-unit simulated buy order. We will show what the confirmation means next.
                      </p>

                      <div className="divide-y divide-[#DCE5ED] border-t border-b border-[#DCE5ED] text-xs">
                        <div className="py-2.5 flex justify-between">
                          <span className="text-[#586B7F]">Action</span>
                          <strong className="text-[#1B3A5C] font-mono">Practice buy · 1 unit</strong>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-[#586B7F]">Practice balance</span>
                          <strong className="text-[#1B3A5C]">Learning credits</strong>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-[#586B7F]">Real funds</span>
                          <strong className="text-[#0F766E]">Never used</strong>
                        </div>
                      </div>

                      {practiceDone ? (
                        <div
                          className="p-3.5 rounded-xl bg-[#E7F4EF] border border-[#0F766E]/30 text-xs text-[#16745B] space-y-1"
                          role="status"
                        >
                          <strong className="block text-sm text-[#0F766E]">Practice action complete (+105 XP)</strong>
                          <span>
                            You placed a fictional order. Your lesson: a market price can change; the action does not
                            guarantee an outcome.
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePrimaryNext}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#16745B] transition-colors"
                        >
                          Confirm 1-Unit Practice Order
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-[#586B7F] mt-4">
                      Sandbox only. No security is bought or recommended. Fixed XP follows completion, never profit.
                    </p>
                  </div>
                </div>
              </div>
            ) : currentStep === 'reward' ? (
              <div className="max-w-lg mx-auto text-center py-6 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">03 · A FIRST LEARNING WIN</div>
                <div
                  className="w-20 h-20 rounded-full bg-[#0F766E] text-white flex items-center justify-center mx-auto text-3xl font-bold shadow-sm"
                  role="img"
                  aria-label="First Practice badge, earned"
                >
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-[#1B3A5C]">Your first practice is complete</h2>
                <p className="text-sm text-[#586B7F] leading-relaxed">
                  You earned this for completing an explained learning action. XP reflects participation, not trading
                  skill or profit.
                </p>
                <div className="py-2.5 px-4 bg-[#FBF5E8] border border-[#DCE5ED] rounded-xl text-sm font-mono font-bold text-[#B45309] inline-block">
                  105 XP · First Practice Badge (Common)
                </div>
                <div className="p-4 bg-[#F3F7FA] border border-[#DCE5ED] rounded-xl text-left flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF3F9] text-[#2E75B6] flex items-center justify-center font-bold shrink-0">
                    ↗
                  </div>
                  <div className="text-xs">
                    <strong className="block text-[#1B3A5C]">Next milestone · Build your learning path</strong>
                    <span className="text-[#586B7F]">
                      Preview the next three lessons and change them whenever you like.
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#586B7F]">
                  No streak pressure: your first day starts after onboarding when you begin learning.
                </p>
              </div>
            ) : currentStep === 'path' ? (
              <div className="space-y-5 py-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                    04 · A PATH THAT FITS YOU
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="personaSwitch" className="text-[#586B7F] font-medium">
                      Switch track:
                    </label>
                    <select
                      id="personaSwitch"
                      value={track.persona}
                      onChange={(e) => {
                        setOverridePersona(e.target.value);
                        emitEvent('path_changed_track', { new_track_id: e.target.value, change_reason: 'user_override' });
                      }}
                      className="px-2.5 py-1 rounded-lg border border-[#DCE5ED] bg-white text-[#1B3A5C] font-semibold text-xs"
                    >
                      <option value="Curious Beginner">Curious Beginner · Finance Foundations</option>
                      <option value="Aspiring Professional">Aspiring Professional · Portfolio Foundations</option>
                      <option value="Career Switcher">Career Switcher · Finance for Your Next Step</option>
                      <option value="Passive Learner">Passive Learner · Money Basics</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-[0.88fr_1.12fr] gap-6 items-start">
                  <div className="bg-[#1B3A5C] text-white rounded-xl p-5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#A6CDE6]">
                      YOUR SUGGESTED TRACK · {track.persona}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{track.title}</h2>
                    <p className="text-xs text-[#D7E4ED] leading-relaxed">{track.sub}</p>
                    <div className="pt-3 border-t border-white/15 text-xs text-[#D7E4ED]">
                      {track.why} · Change this track any time in your profile.
                    </div>
                  </div>

                  <div className="space-y-2.5" aria-label="Three learning milestones">
                    {track.modules.map((modName, idx) => {
                      const isPreviewed = selectedModules.includes(idx);
                      return (
                        <button
                          key={modName}
                          type="button"
                          aria-pressed={isPreviewed}
                          onClick={() => {
                            const nextSelected = isPreviewed
                              ? selectedModules.filter((i) => i !== idx)
                              : [...selectedModules, idx];
                            setSelectedModules(nextSelected);
                            if (idx > 0 && !isPreviewed && selectedModules.filter((i) => i > 0).length < 2) {
                              giveAward(
                                `module-${idx}`,
                                10,
                                '+10 XP for exploring a lesson preview',
                                'path_previewed_module'
                              );
                            } else {
                              emitEvent('path_previewed_module', { module_id: modName, track_id: track.title });
                            }
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                            isPreviewed
                              ? 'border-[#2E75B6] bg-[#EAF3F9]'
                              : 'border-[#DCE5ED] bg-white hover:bg-[#F3F7FA]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                idx === 0 ? 'bg-[#0F766E] text-white' : 'bg-[#EAF3F9] text-[#2E75B6]'
                              }`}
                            >
                              {idx === 0 ? '↗' : idx + 1}
                            </span>
                            <div>
                              <strong className="block text-sm text-[#1B3A5C]">{modName}</strong>
                              <span className="text-xs text-[#586B7F]">
                                {idx === 0
                                  ? 'Your next 5-minute lesson'
                                  : idx === 1
                                  ? 'A short concept with a practice example (+10 XP preview)'
                                  : 'Optional milestone · Preview anytime (+10 XP preview)'}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#2E75B6] font-mono whitespace-nowrap shrink-0">
                            {isPreviewed ? 'PREVIEWED' : idx === 0 ? 'STARTS NEXT' : 'PREVIEW'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#586B7F] pt-1">
                  <span>3 short milestones</span>
                  <span aria-hidden="true">·</span>
                  <span>No locked core lessons</span>
                  <span aria-hidden="true">·</span>
                  <span>Easy to change</span>
                </div>
              </div>
            ) : currentStep === 'community' ? (
              <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-6 items-center py-2">
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
                    05 · LEARN ALONGSIDE OTHERS
                  </div>
                  <h2 className="text-2xl font-bold text-[#1B3A5C]">Learning can feel easier together</h2>
                  <p className="text-sm text-[#586B7F] leading-relaxed">
                    Preview small study groups organised around shared learning goals. You can look around now, join
                    later, or keep learning on your own.
                  </p>
                  <div className="text-xs text-[#586B7F]">
                    Optional by design · You control what you share
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      emitEvent('community_skipped_preview', { skip_control: 'continue_without_community' });
                      showToast('Continuing without community · You can opt in anytime');
                      advanceToStep(stepIndex + 1);
                    }}
                    className="text-xs font-semibold text-[#2E75B6] underline underline-offset-4 hover:text-[#1B3A5C]"
                  >
                    Continue without community →
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'budget', letter: 'B', name: 'Budgeting basics', desc: 'Short lessons · Beginner friendly' },
                    {
                      id: 'markets',
                      letter: 'M',
                      name: 'Markets, one idea at a time',
                      desc: 'Guided practice · Learn at your pace',
                    },
                    {
                      id: 'career',
                      letter: 'C',
                      name: 'Career finance circle',
                      desc: 'Workplace concepts · Peer discussion',
                    },
                  ].map((grp) => {
                    const isSelected = selectedGroup === grp.id;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp.id);
                          emitEvent('community_clicked_group', { group_id: grp.id, group_size_band: 'small_circle' });
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#0F766E] bg-[#E7F4EF]'
                            : 'border-[#DCE5ED] bg-white hover:bg-[#F3F7FA]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-[#EAF3F9] text-[#1B3A5C] font-bold text-xs flex items-center justify-center shrink-0">
                            {grp.letter}
                          </span>
                          <div>
                            <strong className="block text-sm text-[#1B3A5C]">{grp.name}</strong>
                            <span className="text-xs text-[#586B7F]">{grp.desc}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#0F766E]">
                          {isSelected ? 'Previewing' : 'Preview'}
                        </span>
                      </button>
                    );
                  })}

                  <div className="p-3 rounded-lg bg-[#FBF5E8] border border-[#DCE5ED] text-xs text-[#B45309]">
                    Illustrative group cards for this prototype. A live product must use verified, consented community
                    data; no learner counts or quotes are implied here.
                  </div>
                </div>
              </div>
            ) : (
              /* Launch Step */
              <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch py-2">
                <div className="bg-[#F3F7FA] border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                      06 · READY FOR YOUR FIRST LESSON
                    </div>
                    <h2 className="text-2xl font-bold text-[#1B3A5C]">You’re ready to keep learning</h2>
                    <p className="text-xs text-[#586B7F] leading-relaxed">
                      Here’s the start you created. Your choices stay private and can be changed later.
                    </p>
                    <div className="pt-2 text-xs font-medium text-[#1B3A5C]">
                      {track.title} · {goalMinutes}-minute sessions · First Practice badge earned
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED] text-xs text-[#243447]">
                    <strong className="block text-[#B45309] mb-1">
                      Your learning streak starts with your next day of learning.
                    </strong>
                    Take a break whenever you need one. One free weekly freeze is included; no paid recovery or profit
                    rewards.
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B3A5C]">Choose a gentle first goal</h3>
                    <p className="text-xs text-[#586B7F] mt-0.5">
                      A private reminder for your session length. No notification permission is requested here.
                    </p>
                  </div>

                  <div className="space-y-2" role="radiogroup" aria-label="Choose a private learning session goal">
                    {[
                      { val: '5' as const, label: '5 minutes · a quick start' },
                      { val: '10' as const, label: '10 minutes · a little more depth' },
                      { val: '15' as const, label: '15 minutes · take your time' },
                    ].map((opt) => (
                      <label
                        key={opt.val}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                          goalMinutes === opt.val
                            ? 'border-[#2E75B6] bg-[#EAF3F9] text-[#1B3A5C] font-semibold'
                            : 'border-[#DCE5ED] bg-white text-[#243447] hover:bg-[#F3F7FA]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="goalMinutes"
                          value={opt.val}
                          checked={goalMinutes === opt.val}
                          onChange={() => {
                            setGoalMinutes(opt.val);
                            giveAward(
                              'goal-set',
                              15,
                              '+15 XP for setting a private learning goal',
                              'goal_set_private'
                            );
                          }}
                          className="accent-[#2E75B6] w-4 h-4"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setGoalMinutes('5');
                      emitEvent('goal_skipped_setup', { skip_reason: 'set_later' });
                      showToast('You can set a learning goal later.');
                    }}
                    className="text-xs text-[#586B7F] underline underline-offset-4 hover:text-[#1B3A5C]"
                  >
                    Skip goal setting
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation Bar inside Stage */}
            <div className="pt-6 mt-6 border-t border-[#DCE5ED] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={stepIndex === 0 || finished}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#586B7F] hover:bg-[#F3F7FA] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <div
                  className="px-3.5 py-2 rounded-lg bg-[#FBF5E8] border border-[#DCE5ED] text-xs font-mono tabular-nums text-[#B45309] font-bold flex items-center gap-1.5"
                  aria-label="Experience points earned"
                >
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
                    <path d="M8 1L10 6L15 8L10 10L8 15L6 10L1 8L6 6L8 1Z" />
                  </svg>
                  <span>
                    {xp} / 260 XP · L{levelInfo.level} {levelInfo.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePrimaryNext}
                  disabled={finished}
                  className="px-5 py-2.5 rounded-xl bg-[#1B3A5C] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E75B6] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                >
                  {meta.primaryCta}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Event Telemetry Stream */}
        {showTelemetry && (
          <aside
            className="bg-white border border-[#DCE5ED] rounded-2xl p-5 space-y-4"
            aria-label="Live event telemetry inspector"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#1B3A5C]">Event Telemetry Stream</h2>
                <p className="text-xs text-[#586B7F]">
                  Appendix B standard properties · Server-authoritative ledger
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTelemetryLogs([])}
                className="text-xs text-[#586B7F] hover:text-[#1B3A5C] underline"
              >
                Clear
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F3F7FA] border border-[#DCE5ED] text-xs space-y-1 font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#586B7F]">variant:</span>
                <strong className="text-[#1B3A5C]">{variant}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#586B7F]">persona_type:</span>
                <strong className="text-[#0F766E]">{track.personaCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#586B7F]">cumulative_xp:</span>
                <strong className="text-[#B45309]">{xp} XP</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#586B7F]">step_id (pos):</span>
                <strong className="text-[#2E75B6]">
                  {finished ? 'completed (7)' : `${currentStep} (${stepIndex + 1})`}
                </strong>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {telemetryLogs.length === 0 ? (
                <div className="text-xs text-[#586B7F] py-8 text-center">
                  Interact with the prototype to inspect emitted analytics events.
                </div>
              ) : (
                telemetryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-[#DCE5ED] bg-[#F3F7FA]/60 text-[11px] font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#1B3A5C] truncate">{log.eventName}</strong>
                      <span className="text-[#586B7F] shrink-0">{log.timestamp}</span>
                    </div>
                    <div className="text-[#586B7F]">
                      step={log.stepId} · pos={log.sequencePosition} · xp={log.cumulativeXp}
                    </div>
                    {Object.keys(log.properties).length > 0 && (
                      <div className="text-[#2E75B6] break-all">
                        {JSON.stringify(log.properties)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#1B3A5C] text-white text-xs font-semibold shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
