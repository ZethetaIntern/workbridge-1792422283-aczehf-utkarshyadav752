import React, { useState, useMemo } from 'react';
import {
  ScenarioKey,
  calculateFunnelProjections,
  calculateCohortRevenue,
} from '../utils/onboardingLogic';
import { EVENT_TAXONOMY, SOURCE_ERRATA } from '../data/workbridgeData';

export const AnalyticsDashboardView: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioKey>('base');
  const [personaFilter, setPersonaFilter] = useState<string>('All learners');
  const [deviceFilter, setDeviceFilter] = useState<string>('All devices');
  const [channelFilter, setChannelFilter] = useState<string>('All channels');
  const [variantFilter, setVariantFilter] = useState<string>('All variants');
  const [exitRiskMultiplier, setExitRiskMultiplier] = useState<number>(1.0);
  const [eventSearch, setEventSearch] = useState<string>('');
  const [eventCategory, setEventCategory] = useState<string>('all');

  const funnelSteps = useMemo(
    () => calculateFunnelProjections(scenario, 4700, exitRiskMultiplier),
    [scenario, exitRiskMultiplier]
  );

  const scenarioStats = {
    pessimistic: {
      completion: 61.9,
      firstAction: 76.8,
      timeToValue: '4.8 min',
      d1: 45,
      d7: 22,
      d30: 0.12,
      xpAdoption: 68,
      badgeAdoption: 52,
      streakEngagement: 40,
      comprehension: '5.8 / 10',
      nps: '+5',
    },
    base: {
      completion: 71.9,
      firstAction: 82.1,
      timeToValue: '3.6 min',
      d1: 55,
      d7: 30,
      d30: 0.18,
      xpAdoption: 78,
      badgeAdoption: 68,
      streakEngagement: 55,
      comprehension: '7.0 / 10',
      nps: '+22',
    },
    optimistic: {
      completion: 79.9,
      firstAction: 88.4,
      timeToValue: '2.8 min',
      d1: 65,
      d7: 38,
      d30: 0.24,
      xpAdoption: 86,
      badgeAdoption: 76,
      streakEngagement: 65,
      comprehension: '7.8 / 10',
      nps: '+35',
    },
  }[scenario];

  const adjustedCompletion = Number((funnelSteps[6].cumulativeConversion * 100).toFixed(1));
  const adjustedFirstAction = Number((funnelSteps[2].cumulativeConversion * 100).toFixed(1));
  const revenueModel = calculateCohortRevenue(4700, scenarioStats.d30, 2.4, 0.08);

  const activeSegments = [personaFilter, deviceFilter, channelFilter, variantFilter].filter(
    (x) => !x.startsWith('All ')
  );

  const filteredEvents = useMemo(() => {
    return EVENT_TAXONOMY.filter((evt) => {
      const matchesCat = eventCategory === 'all' || evt.category === eventCategory;
      const q = eventSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        evt.eventName.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.properties.some((p) => p.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [eventSearch, eventCategory]);

  const categories = ['all', 'onboarding', 'profile', 'assessment', 'path', 'simulation', 'gamification', 'community', 'goal', 'launch', 'lesson', 'notification', 'error', 'accessibility'];

  const kpiCards = [
    { label: 'Monthly registrations', value: '4,700', delta: 'Scenario input', status: 'INPUT', spark: '2,20 12,17 22,19 32,10 42,14 52,8 62,11 72,4' },
    { label: 'Onboarding completion', value: `${adjustedCompletion}%`, delta: `+${(adjustedCompletion - 11).toFixed(1)} pp vs 11% baseline`, status: 'MODELLED', spark: '2,23 12,21 22,20 32,16 42,13 52,11 62,7 72,5' },
    { label: 'First meaningful action', value: `${adjustedFirstAction}%`, delta: 'Reach practice outcome by step 3', status: 'GOAL <30% EXIT', spark: '2,24 12,18 22,18 32,13 42,11 52,10 62,6 72,4' },
    { label: 'Time to first value', value: scenarioStats.timeToValue, delta: 'vs 8.4 min legacy baseline', status: '<5 MIN TARGET', spark: '2,5 12,8 22,7 32,12 42,15 52,18 62,19 72,23' },
    { label: 'D1 retention', value: `${scenarioStats.d1}%`, delta: `+${scenarioStats.d1 - 32} pp vs 32% baseline`, status: 'BELOW 70% GOAL', spark: '2,23 12,20 22,17 32,18 42,12 52,10 62,8 72,5' },
    { label: 'D7 retention', value: `${scenarioStats.d7}%`, delta: `+${scenarioStats.d7 - 14} pp vs 14% baseline`, status: 'BELOW 40% GOAL', spark: '2,22 12,18 22,19 32,16 42,13 52,12 62,8 72,6' },
    { label: 'D30 retention', value: `${Math.round(scenarioStats.d30 * 100)}%`, delta: `+${Math.round(scenarioStats.d30 * 100) - 8} pp vs 8% baseline`, status: 'MODELLED', spark: '2,24 12,23 22,19 32,19 42,15 52,14 62,10 72,7' },
    { label: 'XP adoption', value: `${scenarioStats.xpAdoption}%`, delta: 'Earns valid XP / registrations', status: 'MODELLED', spark: '2,21 12,18 22,18 32,12 42,11 52,8 62,9 72,4' },
    { label: 'First badge adoption', value: `${scenarioStats.badgeAdoption}%`, delta: 'Earns First Practice badge', status: 'MODELLED', spark: '2,22 12,20 22,16 32,15 42,12 52,10 62,8 72,5' },
    { label: 'Streak engagement', value: `${scenarioStats.streakEngagement}%`, delta: 'Qualifying action on a later day', status: 'OPT-IN', spark: '2,23 12,18 22,20 32,15 42,13 52,14 62,8 72,6' },
    { label: 'Comprehension', value: scenarioStats.comprehension, delta: 'vs 3.1 / 10 baseline', status: 'GUARDRAIL', spark: '2,23 12,19 22,16 32,16 42,12 52,9 62,7 72,5' },
    { label: 'Onboarding NPS', value: scenarioStats.nps, delta: 'vs −12 baseline', status: 'LOW CONFIDENCE', spark: '2,22 12,20 22,17 32,13 42,15 52,10 62,8 72,4' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Scenario Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
            WORKBRIDGE · PRODUCT ANALYTICS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] mt-1">
            Onboarding performance & scenario projections
          </h1>
          <p className="text-sm text-[#586B7F] mt-1 max-w-2xl">
            Activation, learning quality, and retention in one view. Thresholds are pre-registered for the A/B
            experiment; figures are scenario projections anchored to the supplied 14,200-registration baseline.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#DCE5ED] rounded-xl" role="group" aria-label="Projection scenario selector">
          {(['pessimistic', 'base', 'optimistic'] as ScenarioKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setScenario(key);
                setExitRiskMultiplier(1.0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap shrink-0 ${
                scenario === key ? 'bg-[#1B3A5C] text-white' : 'text-[#586B7F] hover:text-[#1B3A5C]'
              }`}
            >
              {key === 'base' ? 'Base case (71.9%)' : key === 'pessimistic' ? 'Pessimistic (61.9%)' : 'Optimistic (79.9%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Segment Filters + Exit Risk Sensitivity Slider */}
      <section
        className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4"
        aria-label="Dashboard segment filters and sensitivity controls"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <label className="block space-y-1 text-xs font-bold uppercase tracking-wider text-[#586B7F]">
            <span>Persona</span>
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] bg-white text-sm font-medium text-[#243447] normal-case tracking-normal"
            >
              <option>All learners</option>
              <option>Curious Beginner</option>
              <option>Aspiring Professional</option>
              <option>Career Switcher</option>
              <option>Passive Learner</option>
            </select>
          </label>

          <label className="block space-y-1 text-xs font-bold uppercase tracking-wider text-[#586B7F]">
            <span>Device</span>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] bg-white text-sm font-medium text-[#243447] normal-case tracking-normal"
            >
              <option>All devices</option>
              <option>Mobile</option>
              <option>Desktop</option>
            </select>
          </label>

          <label className="block space-y-1 text-xs font-bold uppercase tracking-wider text-[#586B7F]">
            <span>Channel</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] bg-white text-sm font-medium text-[#243447] normal-case tracking-normal"
            >
              <option>All channels</option>
              <option>Organic</option>
              <option>Campus referral</option>
              <option>Paid</option>
            </select>
          </label>

          <label className="block space-y-1 text-xs font-bold uppercase tracking-wider text-[#586B7F]">
            <span>Variant</span>
            <select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] bg-white text-sm font-medium text-[#243447] normal-case tracking-normal"
            >
              <option>All variants</option>
              <option>Variant A</option>
              <option>Variant B</option>
            </select>
          </label>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-[#1B3A5C]">
              <label htmlFor="exitRiskSlider">Per-step exit risk</label>
              <span className="font-mono tabular-nums">
                {exitRiskMultiplier === 1
                  ? 'Baseline (0%)'
                  : `${exitRiskMultiplier > 1 ? '+' : ''}${Math.round((exitRiskMultiplier - 1) * 100)}%`}
              </span>
            </div>
            <input
              id="exitRiskSlider"
              type="range"
              min={0.8}
              max={1.2}
              step={0.05}
              value={exitRiskMultiplier}
              onChange={(e) => setExitRiskMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#2E75B6]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#DCE5ED] flex flex-wrap items-center justify-between gap-2 text-xs text-[#586B7F]" aria-live="polite">
          <span>
            {activeSegments.length > 0
              ? `Selected segment: ${activeSegments.join(' · ')}. Segment-level estimates are intentionally not fabricated; connect this filter to event data after the experiment.`
              : 'Interpretation: current completion is 11% from 1,557 / 14,200 supplied counts; the brief also states 22%. Model uses the count-based figure.'}
          </span>
          {exitRiskMultiplier !== 1.0 && (
            <button
              type="button"
              onClick={() => setExitRiskMultiplier(1.0)}
              className="font-semibold text-[#2E75B6] underline"
            >
              Reset sensitivity to 0%
            </button>
          )}
        </div>
      </section>

      {/* 12 Core Outcomes KPI Grid */}
      <section aria-label="Twelve onboarding metrics">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-[#1B3A5C]">Core outcomes</h2>
          <span className="text-xs text-[#586B7F] font-mono tabular-nums">
            {scenario.toUpperCase()} CASE VS SUPPLIED BASELINE · 4,700 REGISTRATIONS / MONTH
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {kpiCards.map((card) => (
            <article
              key={card.label}
              className="bg-white border border-[#DCE5ED] rounded-xl p-4 flex flex-col justify-between min-h-[132px] relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-semibold text-[#586B7F]">{card.label}</div>
                <svg className="w-16 h-6 shrink-0 opacity-85" viewBox="0 0 74 28" aria-hidden="true">
                  <polyline
                    points={card.spark}
                    fill="none"
                    stroke="#2E75B6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#1B3A5C] my-2">
                {card.value}
              </div>
              <div className="text-[11px] text-[#586B7F] flex items-center justify-between gap-2">
                <span>{card.delta}</span>
                <span className="font-mono font-bold text-[#1B3A5C]">{card.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Funnel Comparison & Alert Thresholds */}
      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1B3A5C]">7-step conversion funnel vs 12-screen baseline</h2>
              <p className="text-xs text-[#586B7F] mt-0.5">
                Share of 4,700 monthly registrations reaching each logical step ({scenario} scenario).
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F766E] tabular-nums">
              {funnelSteps[6].usersReached.toLocaleString()} completions
            </span>
          </div>

          <div className="space-y-3">
            {funnelSteps.map((row) => {
              const pct = Number((row.cumulativeConversion * 100).toFixed(1));
              return (
                <div key={row.step} className="grid grid-cols-[150px_1fr_110px] items-center gap-3 text-xs">
                  <span className="font-semibold text-[#243447] truncate">
                    {row.step} · {row.stepName}
                  </span>
                  <div className="h-3.5 bg-[#EAF3F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2E75B6] to-[#0F766E] rounded-full transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right font-mono tabular-nums text-[#1B3A5C]">
                    <strong>{pct}%</strong>{' '}
                    <span className="text-[#586B7F]">({row.usersReached.toLocaleString()})</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#DCE5ED] flex flex-wrap items-center justify-between gap-2 text-xs text-[#586B7F]">
            <span>Legacy 12-screen baseline: 11.0% (1,557 / 14,200) · Screen 2 exit 22% · Screen 4 exit 26%</span>
            <span className="font-mono text-[#1B3A5C]">Base 95% sampling interval: 70.6%–73.1%</span>
          </div>
        </article>

        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">Alert thresholds & guardrails</h2>
            <p className="text-xs text-[#586B7F] mt-0.5">
              Pre-registered severity and escalation rules for the live experiment dashboard.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                sev: 'WATCH',
                color: 'text-[#B45309]',
                title: 'D1 retention below 70%',
                desc: 'Base case is 55%; review first-session value and next-day return path.',
              },
              {
                sev: 'WATCH',
                color: 'text-[#B45309]',
                title: 'D7 retention below 40%',
                desc: 'Base case is 30%; inspect lesson quality and cohort differences.',
              },
              {
                sev: 'TARGET',
                color: 'text-[#16745B]',
                title: 'Comprehension below 7/10',
                desc: 'Pause the affected variant if score falls by more than 0.3 vs control.',
              },
              {
                sev: 'CRITICAL',
                color: 'text-[#B42318]',
                title: 'Simulation error rate above 3%',
                desc: 'Pause if the arm exceeds threshold or is more than 1pp worse.',
              },
              {
                sev: 'CRITICAL',
                color: 'text-[#B42318]',
                title: 'Analytics event loss above 1%',
                desc: 'Stop experiment interpretation until event health recovers.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-[72px_1fr] gap-3 p-3 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED]/70 text-xs"
              >
                <span className={`font-mono font-bold uppercase tracking-wider ${item.color}`}>{item.sev}</span>
                <div>
                  <strong className="block text-[#1B3A5C]">{item.title}</strong>
                  <span className="text-[#586B7F]">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Monthly Cohort Revenue Model & Sensitivity Table */}
      <section className="grid lg:grid-cols-2 gap-6">
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1B3A5C]">Monthly cohort revenue model</h2>
              <p className="text-xs text-[#586B7F]">
                4,700 monthly registrations × D30 active rate × $2.40 simulated monthly ARPU.
              </p>
            </div>
            <span className="text-sm font-mono font-bold text-[#0F766E] tabular-nums">
              +${revenueModel.incrementalMonthly.toLocaleString()} / mo ({scenario})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono tabular-nums">
              <thead>
                <tr className="border-b border-[#DCE5ED] text-[#586B7F] font-sans">
                  <th className="py-2 pr-3">Metric</th>
                  <th className="py-2 px-2 text-right">Current</th>
                  <th className="py-2 px-2 text-right">Pessimistic</th>
                  <th className="py-2 px-2 text-right">Base</th>
                  <th className="py-2 pl-2 text-right">Optimistic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5ED]">
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">Completion rate</td>
                  <td className="py-2 px-2 text-right">11.0%</td>
                  <td className="py-2 px-2 text-right">61.9%</td>
                  <td className="py-2 px-2 text-right font-bold text-[#1B3A5C]">71.9%</td>
                  <td className="py-2 pl-2 text-right">79.9%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">D30 active rate</td>
                  <td className="py-2 px-2 text-right">8%</td>
                  <td className="py-2 px-2 text-right">12%</td>
                  <td className="py-2 px-2 text-right font-bold text-[#1B3A5C]">18%</td>
                  <td className="py-2 pl-2 text-right">24%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">D30 active users</td>
                  <td className="py-2 px-2 text-right">376</td>
                  <td className="py-2 px-2 text-right">564</td>
                  <td className="py-2 px-2 text-right font-bold text-[#1B3A5C]">846</td>
                  <td className="py-2 pl-2 text-right">1,128</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">Monthly cohort revenue</td>
                  <td className="py-2 px-2 text-right">$902</td>
                  <td className="py-2 px-2 text-right">$1,354</td>
                  <td className="py-2 px-2 text-right font-bold text-[#1B3A5C]">$2,030</td>
                  <td className="py-2 pl-2 text-right">$2,707</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">Incremental / month</td>
                  <td className="py-2 px-2 text-right">—</td>
                  <td className="py-2 px-2 text-right text-[#0F766E]">+$451</td>
                  <td className="py-2 px-2 text-right font-bold text-[#0F766E]">+$1,128</td>
                  <td className="py-2 pl-2 text-right text-[#0F766E]">+$1,805</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-sans font-medium text-[#243447]">Annualised incremental</td>
                  <td className="py-2 px-2 text-right">—</td>
                  <td className="py-2 px-2 text-right">$5,414</td>
                  <td className="py-2 px-2 text-right font-bold text-[#1B3A5C]">$13,536</td>
                  <td className="py-2 pl-2 text-right">$21,658</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        {/* Source Errata & Reconciliation Log */}
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">Source errata & reconciliation log</h2>
            <p className="text-xs text-[#586B7F]">
              Explicit handling of internal inconsistencies in the supplied assessment analytics.
            </p>
          </div>
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {SOURCE_ERRATA.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED] text-xs space-y-1">
                <div className="font-semibold text-[#1B3A5C]">
                  0{item.id} · {item.statement}
                </div>
                <div className="text-[#586B7F]">
                  <strong className="text-[#243447]">Reconciliation:</strong> {item.reconciliation}
                </div>
                <div className="text-[#0F766E] font-medium">
                  <strong>Decision:</strong> {item.handling}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* 52-Event Taxonomy Explorer */}
      <section className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">
              52-event analytics dictionary (`category_action_object`)
            </h2>
            <p className="text-xs text-[#586B7F]">
              Shared properties: user_id · session_id · timestamp · platform · viewport_width · onboarding_step · variant · persona_type · cumulative_xp · time_in_step_ms
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search 52 events or properties..."
              aria-label="Search event taxonomy"
              className="h-9 px-3 rounded-lg border border-[#DCE5ED] text-xs text-[#243447] w-56"
            />
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              aria-label="Filter events by category"
              className="h-9 px-2.5 rounded-lg border border-[#DCE5ED] text-xs text-[#1B3A5C] font-semibold bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All categories (52)' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[340px] overflow-y-auto border border-[#DCE5ED] rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F3F7FA] sticky top-0 border-b border-[#DCE5ED]">
              <tr>
                <th className="py-2.5 px-3 font-semibold text-[#1B3A5C]">Event Name ({filteredEvents.length})</th>
                <th className="py-2.5 px-3 font-semibold text-[#1B3A5C]">Description</th>
                <th className="py-2.5 px-3 font-semibold text-[#1B3A5C]">Event-Specific Properties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5ED]">
              {filteredEvents.map((evt) => (
                <tr key={evt.eventName} className="hover:bg-[#F3F7FA]/60">
                  <td className="py-2 px-3 font-mono font-semibold text-[#1B3A5C] whitespace-nowrap">
                    {evt.eventName}
                  </td>
                  <td className="py-2 px-3 text-[#243447]">{evt.description}</td>
                  <td className="py-2 px-3 font-mono text-[#2E75B6]">{evt.properties.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
