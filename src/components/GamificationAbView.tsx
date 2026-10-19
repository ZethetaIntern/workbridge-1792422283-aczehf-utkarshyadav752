import React, { useState } from 'react';
import { CURRICULUM_BADGES, ONBOARDING_XP_TABLE } from '../data/workbridgeData';
import { calculateAbSampleSize, getLevelForXp } from '../utils/onboardingLogic';

export const GamificationAbView: React.FC = () => {
  // Interactive XP Economy Simulator state
  const [simSelectedActions, setSimSelectedActions] = useState<Record<string, boolean>>({
    profile: true,
    assessment: true,
    simulation: true,
    badge: true,
    preview: false,
    community: true,
    goal: true,
    launch: true,
  });

  // Interactive Badge Filter
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  // Interactive A/B Sample Size Calculator state
  const [pA, setPA] = useState<number>(0.72);
  const [pB, setPB] = useState<number>(0.77);
  const [allowance, setAllowance] = useState<number>(0.10);
  const [monthlyTraffic, setMonthlyTraffic] = useState<number>(4700);

  const simulatedXp = Math.min(
    260,
    ONBOARDING_XP_TABLE.reduce((acc, row) => (simSelectedActions[row.id] ? acc + row.maxAward : acc), 0)
  );
  const levelInfo = getLevelForXp(simulatedXp);

  const abCalc = calculateAbSampleSize(pA, pB, allowance, monthlyTraffic);

  const filteredBadges = CURRICULUM_BADGES.filter(
    (b) => rarityFilter === 'All' || b.rarity === rarityFilter
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
          GAMIFICATION ECONOMY & PRE-REGISTERED A/B PROTOCOL
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] mt-1">
          XP economy, 12 curriculum badges & A/B test lab
        </h1>
        <p className="text-sm text-[#586B7F] mt-1 max-w-3xl">
          XP makes learning progress visible and never measures trading profit or risk appetite. Below, test the
          bounded 260 XP onboarding ledger, inspect the 12 private curriculum badges, and verify the fixed-horizon A/B
          sample-size calculation.
        </p>
      </div>

      {/* Section 1: 260 XP Economy Simulator + Level Access */}
      <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1B3A5C]">Interactive 260 XP Onboarding Ledger</h2>
              <p className="text-xs text-[#586B7F]">
                Toggle onboarding actions below to simulate learner paths (Speed Runner, Explorer, Completer, Bouncer).
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xl font-bold text-[#0F766E]">{simulatedXp} / 260 XP</span>
              <span className="block text-[11px] text-[#586B7F]">
                Level {levelInfo.level} · {levelInfo.name}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE5ED] text-[#586B7F]">
                  <th className="py-2 pr-2">Include</th>
                  <th className="py-2 px-2">Onboarding Action</th>
                  <th className="py-2 px-2 text-right font-mono">Max XP</th>
                  <th className="py-2 px-2">Cap / Frequency</th>
                  <th className="py-2 pl-2">Canonical Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5ED]">
                {ONBOARDING_XP_TABLE.map((row) => {
                  const checked = Boolean(simSelectedActions[row.id]);
                  return (
                    <tr key={row.id} className={checked ? 'bg-[#EAF3F9]/40' : ''}>
                      <td className="py-2.5 pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSimSelectedActions((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                          }
                          aria-label={`Toggle ${row.action}`}
                          className="accent-[#2E75B6] w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-[#1B3A5C]">{row.action}</td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-[#0F766E]">
                        +{row.maxAward} XP
                      </td>
                      <td className="py-2.5 px-2 text-[#586B7F]">{row.frequency}</td>
                      <td className="py-2.5 pl-2 font-mono text-[11px] text-[#2E75B6]">{row.eventName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-[#586B7F]">Quick cohort presets:</span>
            <button
              type="button"
              onClick={() =>
                setSimSelectedActions({
                  profile: true,
                  assessment: false,
                  simulation: true,
                  badge: true,
                  preview: false,
                  community: false,
                  goal: false,
                  launch: true,
                })
              }
              className="px-2.5 py-1 rounded-md bg-[#F3F7FA] border border-[#DCE5ED] text-xs font-medium text-[#1B3A5C] hover:bg-[#EAF3F9]"
            >
              Speed Runner (175 XP)
            </button>
            <button
              type="button"
              onClick={() =>
                setSimSelectedActions({
                  profile: true,
                  assessment: true,
                  simulation: true,
                  badge: true,
                  preview: true,
                  community: true,
                  goal: true,
                  launch: true,
                })
              }
              className="px-2.5 py-1 rounded-md bg-[#F3F7FA] border border-[#DCE5ED] text-xs font-medium text-[#1B3A5C] hover:bg-[#EAF3F9]"
            >
              Full Explorer (260 XP Cap)
            </button>
            <button
              type="button"
              onClick={() =>
                setSimSelectedActions({
                  profile: true,
                  assessment: true,
                  simulation: false,
                  badge: false,
                  preview: false,
                  community: false,
                  goal: false,
                  launch: false,
                })
              }
              className="px-2.5 py-1 rounded-md bg-[#F3F7FA] border border-[#DCE5ED] text-xs font-medium text-[#1B3A5C] hover:bg-[#EAF3F9]"
            >
              Early Bouncer (60 XP)
            </button>
          </div>
        </article>

        {/* Lifetime Levels & Streak Safeguards */}
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#1B3A5C]">Lifetime Levels & Streak Safeguards</h2>
            <p className="text-xs text-[#586B7F]">
              Core lessons stay open at every level. XP unlocks optional profile flair and deeper progress summaries.
            </p>

            <div className="divide-y divide-[#DCE5ED] border-t border-b border-[#DCE5ED] text-xs font-mono tabular-nums">
              {[
                { lvl: 1, name: 'Starter', xp: '0 XP', desc: 'Full core learning path' },
                { lvl: 2, name: 'Builder', xp: '100 XP', desc: 'Optional avatar trim & progress detail' },
                { lvl: 3, name: 'Explorer', xp: '250 XP', desc: 'Optional profile theme & summary' },
                { lvl: 4, name: 'Practitioner', xp: '500 XP', desc: 'Advanced practice sandbox settings' },
                { lvl: 5, name: 'Guide', xp: '900 XP', desc: 'Profile flair & peer mentoring interest' },
              ].map((l) => (
                <div
                  key={l.lvl}
                  className={`py-2 flex items-center justify-between gap-2 ${
                    levelInfo.level === l.lvl ? 'text-[#0F766E] font-bold' : 'text-[#243447]'
                  }`}
                >
                  <span>
                    L{l.lvl} · {l.name} ({l.xp})
                  </span>
                  <span className="font-sans text-[#586B7F] text-right">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E7F4EF] border border-[#0F766E]/25 space-y-1.5 text-xs">
            <strong className="block text-[#0F766E] text-sm">
              Streaks reward learning, not attendance
            </strong>
            <p className="text-[#243447] leading-relaxed">
              Credited only after a qualifying lesson, teach-back question, or explained simulation in IST (00:00–23:59).
              Includes <strong>1 free weekly freeze</strong> and automatic freeze on &gt;4h service downtime. Paid 100
              XP recovery and random loot-box rarity upgrades from the brief are explicitly rejected.
            </p>
          </div>
        </article>
      </section>

      {/* Section 2: 12 Private Curriculum Badges */}
      <section className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">12 Private Curriculum Badges</h2>
            <p className="text-xs text-[#586B7F]">
              Deterministic milestones for practice, concepts, reflection, risk, and consistency. Never tied to
              simulated profit.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-[#F3F7FA] border border-[#DCE5ED] rounded-lg" role="group" aria-label="Filter badges by rarity">
            {['All', 'Common', 'Uncommon', 'Rare', 'Epic'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRarityFilter(r)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  rarityFilter === r ? 'bg-[#1B3A5C] text-white' : 'text-[#586B7F] hover:text-[#1B3A5C]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredBadges.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-[#F3F7FA] border border-[#DCE5ED] flex items-start gap-3.5">
              <div
                className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-base shrink-0"
                style={{ backgroundColor: b.color }}
                aria-hidden="true"
              >
                {b.symbol}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <strong className="text-[#1B3A5C] text-sm">{b.name}</strong>
                  <span className="text-[#586B7F]">· {b.rarity}</span>
                </div>
                <p className="text-[#243447] leading-snug">{b.criteria}</p>
                <p className="text-[11px] text-[#586B7F]">{b.driver}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Pre-Registered A/B Test Sample-Size Calculator & Decision Matrix */}
      <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">
              Two-proportion A/B sample-size & duration calculator
            </h2>
            <p className="text-xs text-[#586B7F]">
              Two-sided α = 0.05 · Power (1 − β) = 0.80 · Equal 1:1 sticky hash allocation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <label className="block space-y-1">
              <span className="font-bold text-[#1B3A5C]">Variant A completion assumption (pA)</span>
              <input
                type="number"
                step={0.01}
                min={0.1}
                max={0.95}
                value={pA}
                onChange={(e) => setPA(Math.min(0.94, Math.max(0.1, Number(e.target.value) || 0.72)))}
                className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] font-mono tabular-nums text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold text-[#1B3A5C]">Variant B target completion (pB)</span>
              <input
                type="number"
                step={0.01}
                min={0.15}
                max={0.99}
                value={pB}
                onChange={(e) => setPB(Math.min(0.99, Math.max(0.15, Number(e.target.value) || 0.77)))}
                className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] font-mono tabular-nums text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold text-[#1B3A5C]">Enrollment allowance fraction</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={0.3}
                value={allowance}
                onChange={(e) => setAllowance(Math.min(0.3, Math.max(0, Number(e.target.value) || 0.1)))}
                className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] font-mono tabular-nums text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold text-[#1B3A5C]">Monthly new registrations</span>
              <input
                type="number"
                step={100}
                min={1000}
                max={50000}
                value={monthlyTraffic}
                onChange={(e) => setMonthlyTraffic(Math.max(1000, Number(e.target.value) || 4700))}
                className="w-full h-10 px-3 rounded-lg border border-[#DCE5ED] font-mono tabular-nums text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono tabular-nums">
            <div className="p-3 rounded-xl bg-[#F3F7FA] border border-[#DCE5ED]">
              <div className="text-[11px] font-sans text-[#586B7F]">Evaluable / arm</div>
              <div className="text-xl font-bold text-[#1B3A5C] mt-1">{abCalc.evaluablePerArm.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#EAF3F9] border border-[#2E75B6]/30">
              <div className="text-[11px] font-sans text-[#2E75B6] font-semibold">Planned / arm</div>
              <div className="text-xl font-bold text-[#1B3A5C] mt-1">{abCalc.plannedPerArm.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#E7F4EF] border border-[#0F766E]/30">
              <div className="text-[11px] font-sans text-[#0F766E] font-semibold">Min enrollment</div>
              <div className="text-xl font-bold text-[#0F766E] mt-1">{abCalc.minimumDays} days</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED]">
              <div className="text-[11px] font-sans text-[#B45309] font-semibold">D30 readout</div>
              <div className="text-xl font-bold text-[#B45309] mt-1">~Day {abCalc.d30ReadoutDay}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#586B7F] pt-1">
            <span>
              MDE: {((pB - pA) * 100).toFixed(1)} percentage points · Expected arrival: {abCalc.expectedDays} days
            </span>
            <button
              type="button"
              onClick={() => {
                setPA(0.72);
                setPB(0.77);
                setAllowance(0.1);
                setMonthlyTraffic(4700);
              }}
              className="text-[#2E75B6] font-semibold underline"
            >
              Reset to pre-registered defaults
            </button>
          </div>
        </article>

        {/* Decision Rules & Variant Comparison */}
        <article className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1B3A5C]">Pre-registered decision framework</h2>
            <p className="text-xs text-[#586B7F]">
              Holm-corrected secondaries: Time-to-value (−45s), First-action (+5pp), First-badge (+5pp), D1 (+3pp).
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                outcome: 'B wins',
                rule: 'Primary B−A ≥ +5pp, two-sided p < .05, 95% CI excludes 0, all guardrails pass',
                action: 'Adopt B for staged rollout (5% → 25% → 100%); retain 5% holdout through D30.',
              },
              {
                outcome: 'A wins',
                rule: 'A−B ≥ +5pp under the same criteria; guardrails pass',
                action: 'Adopt A; retain B insights for a separate action-first investigation.',
              },
              {
                outcome: 'Small / null effect',
                rule: 'CI includes zero or observed effect < 5pp',
                action: 'Do not claim a winner; choose simpler sequence after product review.',
              },
              {
                outcome: 'Guardrail breach',
                rule: 'Comprehension drops >0.3, simulation errors >3% or +1pp, or event loss >1%',
                action: 'Pause affected experience immediately, preserve assignment data, and fix.',
              },
            ].map((row) => (
              <div key={row.outcome} className="p-3 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED]">
                <div className="font-bold text-[#1B3A5C]">
                  {row.outcome} <span className="font-normal text-[#586B7F]">· {row.rule}</span>
                </div>
                <div className="text-[#0F766E] font-medium mt-0.5">{row.action}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
