import React, { useState, useEffect } from 'react';
import { BOARD_SLIDES } from '../data/workbridgeData';

export const PresentationDeckView: React.FC = () => {
  const [slideIdx, setSlideIdx] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  const slide = BOARD_SLIDES[slideIdx];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowRight') {
        setSlideIdx((i) => Math.min(BOARD_SLIDES.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setSlideIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const renderSlideBody = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="flex flex-col justify-between h-full text-white">
            <div className="space-y-5 max-w-3xl">
              <div className="text-xs font-bold tracking-widest uppercase text-[#A6CDE6]">
                WORKBRIDGE · RETENTION BOARD
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
                Learning starts
                <br />
                with a safe first try
              </h2>
              <p className="text-lg sm:text-xl text-[#D7E4ED]">
                A seven-step gamified onboarding redesign for financial literacy
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-[#53718B]">
              <div className="relative grid grid-cols-7 gap-2">
                <div className="absolute top-4 left-[7%] right-[7%] h-0.5 bg-[#53718B] z-0" aria-hidden="true" />
                {['Value', 'Practice', 'Reward', 'Personalise', 'Explore', 'Connect', 'Launch'].map((label, i) => (
                  <div key={label} className="relative z-10 flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i < 3 ? 'bg-[#0F766E]' : 'bg-[#40617C]'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-[#D7E4ED]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold tracking-wider uppercase text-[#AEC3D3]">
                DESIGN PROPOSAL · SIMULATED ANALYTICS · OCTOBER 2026
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid md:grid-cols-[1.45fr_0.55fr] gap-6 items-start">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#586B7F]">
                CURRENT 12-SCREEN FLOW
              </div>
              {[
                ['Registered', 100, '14,200'],
                ['Reach screen 2', 91, '12,922'],
                ['Reach screen 4', 57, '8,064'],
                ['Reach screen 8', 22, '3,129'],
                ['Complete', 11, '1,557'],
              ].map(([label, pct, count], idx) => (
                <div key={String(label)} className="grid grid-cols-[130px_1fr_56px_74px] items-center gap-3 text-xs">
                  <strong className="text-[#243447]">{label}</strong>
                  <div className="h-4 rounded-full bg-[#EDF2F6] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 4 ? 'bg-[#0F766E]' : 'bg-[#2E75B6]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <strong className="text-right font-mono tabular-nums text-[#1B3A5C]">{pct}%</strong>
                  <span className="text-right font-mono tabular-nums text-[#586B7F]">{count}</span>
                </div>
              ))}

              <div className="p-3.5 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED] text-xs flex flex-wrap items-center gap-3 mt-4">
                <strong className="text-[#B45309] uppercase tracking-wider">BASELINE CONFLICT</strong>
                <span className="text-[#243447]">
                  Overview says 22%; 1,557 / 14,200 and the financial model imply 11%. Use 11% pending reconciliation.
                </span>
              </div>
            </div>

            <div className="md:border-l md:border-[#DCE5ED] md:pl-6 space-y-5">
              <div>
                <div className="text-xs font-bold uppercase text-[#586B7F]">SCREEN 2 EXIT</div>
                <div className="text-3xl font-bold font-mono tabular-nums text-[#B42318] mt-1">22%</div>
                <p className="text-xs text-[#586B7F] mt-1">2,842 users leave the feature overview</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-[#586B7F]">SCREEN 4 EXIT</div>
                <div className="text-3xl font-bold font-mono tabular-nums text-[#B45309] mt-1">26%</div>
                <p className="text-xs text-[#586B7F] mt-1">Highest conditional loss; 34% click Back</p>
              </div>
              <div className="text-[11px] text-[#586B7F] pt-2">Source: assessment pp. 8–10, 25</div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ['54%', 'say onboarding is too long', '“I lost patience after the third screen.”', 'text-[#B42318]'],
                ['42%', 'say information comes too early', '“I just wanted to try trading.”', 'text-[#B45309]'],
                ['37%', 'want hands-on use earlier', '“Let me try first, then explain.”', 'text-[#0F766E]'],
                ['31%', 'feel the experience is generic', '“It felt like a template.”', 'text-[#2E75B6]'],
                ['19%', 'report no early reward', '“Nothing happened.”', 'text-[#16745B]'],
              ].map(([pct, label, quote, color]) => (
                <div key={pct} className="bg-white border border-[#DCE5ED] rounded-xl p-4 space-y-1.5">
                  <div className={`text-3xl font-bold font-mono tabular-nums ${color}`}>{pct}</div>
                  <div className="text-sm font-bold text-[#1B3A5C]">{label}</div>
                  <p className="text-xs text-[#586B7F] pt-1">{quote}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#DCE5ED] flex flex-wrap items-center gap-3 text-xs">
              <strong className="text-[#2E75B6] uppercase tracking-wider">DESIGN RESPONSE</strong>
              <span className="font-bold text-[#1B3A5C]">
                Show value early · teach through practice · personalise without pressure · reward the learning action
              </span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-7 gap-2">
              {['Welcome', 'Assessment', 'Practice', 'Reward', 'Learning path', 'Community', 'Launch'].map(
                (label, i) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                        i < 3 ? 'bg-[#0F766E]' : 'bg-[#2E75B6]'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-[#1B3A5C]">{label}</span>
                  </div>
                )
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-[#2E75B6]">
                VARIANT A · PERSONALISED BEFORE PRACTICE
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs text-center font-semibold">
                {['Welcome', 'Assessment', 'Practice', 'Reward', 'Learning path', 'Community', 'Launch'].map(
                  (step, i) => (
                    <div
                      key={step}
                      className={`py-2 px-1 rounded-lg border border-[#DCE5ED] ${
                        i === 2 ? 'bg-[#E7F4EF] text-[#0F766E]' : i === 1 ? 'bg-[#EAF3F9] text-[#1B3A5C]' : 'bg-[#F3F7FA] text-[#1B3A5C]'
                      }`}
                    >
                      {step}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-[#0F766E]">
                VARIANT B · VALUE BEFORE QUESTIONS
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs text-center font-semibold">
                {['Welcome', 'Practice', 'Reward', 'Assessment', 'Learning path', 'Community', 'Launch'].map(
                  (step, i) => (
                    <div
                      key={step}
                      className={`py-2 px-1 rounded-lg border border-[#DCE5ED] ${
                        i === 1 || i === 2 ? 'bg-[#E7F4EF] text-[#0F766E]' : 'bg-[#F3F7FA] text-[#1B3A5C]'
                      }`}
                    >
                      {step}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF3F9] border border-[#DCE5ED] text-xs flex flex-wrap items-center gap-3">
              <strong className="text-sm text-[#1B3A5C]">The differentiator is order:</strong>
              <span className="text-[#243447]">
                A shows the personal path first. B lets the learner try a safe action before answering questions.
                Content and reward rules stay the same.
              </span>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-5">
            <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-base text-[#1B3A5C]">NORTHSTAR FOODS</strong>
                  <div className="text-xs text-[#586B7F]">Fictional example · NFD</div>
                </div>
                <span className="text-xs font-bold text-[#0F766E] uppercase">SANDBOX ONLY</span>
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-[#1B3A5C]">INR 100.00</div>
              <div className="text-xs text-[#586B7F]">Practice quote</div>
              <svg viewBox="0 0 420 110" className="w-full h-24">
                <path d="M0 20H420M0 55H420M0 90H420" stroke="#E5EBF0" strokeWidth="1" />
                <path
                  d="M8 85 L52 72 L96 77 L140 54 L184 60 L228 38 L272 45 L316 25 L360 35 L410 18"
                  fill="none"
                  stroke="#2E75B6"
                  strokeWidth="3"
                />
              </svg>
              <div className="text-[11px] text-[#586B7F]">Illustrative movement · not a forecast</div>
            </div>

            <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-[#1B3A5C]">Your first practice action</h3>
              <p className="text-xs text-[#586B7F]">
                Place a one-unit simulated buy order. We will show what the confirmation means next.
              </p>
              <div className="divide-y divide-[#DCE5ED] text-xs border-t border-b border-[#DCE5ED]">
                <div className="py-2 flex justify-between">
                  <span className="text-[#586B7F]">Action</span>
                  <strong className="text-[#1B3A5C]">Practice buy · 1 unit</strong>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#586B7F]">Practice balance</span>
                  <strong className="text-[#1B3A5C]">Learning credits</strong>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#586B7F]">Real funds</span>
                  <strong className="text-[#0F766E]">Never used</strong>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#E7F4EF] text-xs text-[#16745B]">
                <strong className="block">Practice complete</strong>
                Your learning win is knowing what the action does. Fixed XP follows completion, never profit.
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="divide-y divide-[#DCE5ED] border-t border-b border-[#DCE5ED]">
              {[
                ['1', 'Curious Beginner', 'Finance Foundations', 'One concept at a time · plain-language definitions', 'bg-[#2E75B6]'],
                ['2', 'Aspiring Professional', 'Portfolio Foundations', 'Faster examples · risk context remains visible', 'bg-[#0F766E]'],
                ['3', 'Career Switcher', 'Finance for Your Next Step', 'Guided structure · workplace-relevant concepts', 'bg-[#B45309]'],
                ['4', 'Passive Learner', 'Money Basics', 'Short sessions · community stays optional', 'bg-[#16745B]'],
              ].map(([n, persona, track, desc, bg]) => (
                <div key={n} className="py-3 grid sm:grid-cols-[36px_190px_230px_1fr] items-center gap-3 text-xs">
                  <span className={`w-7 h-7 rounded-full ${bg} text-white font-bold flex items-center justify-center`}>
                    {n}
                  </span>
                  <strong className="text-sm text-[#1B3A5C]">{persona}</strong>
                  <strong className="text-sm text-[#243447]">{track}</strong>
                  <span className="text-[#586B7F]">{desc}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED] text-xs flex flex-wrap items-center gap-3">
              <strong className="text-[#B45309]">Personalisation promise:</strong>
              <span className="text-[#243447]">
                “Based on your answers” · skip or edit any choice · no suitability score · no locked core lessons
              </span>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase text-[#2E75B6]">ONBOARDING XP (260 MAX)</div>
              {[
                ['Profile + four questions', 60],
                ['First practice + badge', 105],
                ['Previews + community', 30],
                ['Goal + launch', 65],
              ].map(([label, val], idx) => (
                <div key={String(label)} className="grid grid-cols-[160px_1fr_44px] items-center gap-3 text-xs">
                  <strong className="text-[#1B3A5C]">{label}</strong>
                  <div className="h-3.5 rounded-full bg-[#E3EAF0] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 1 ? 'bg-[#0F766E]' : 'bg-[#2E75B6]'}`}
                      style={{ width: `${(Number(val) / 105) * 100}%` }}
                    />
                  </div>
                  <strong className="text-right font-mono tabular-nums text-[#1B3A5C]">{val}</strong>
                </div>
              ))}
              <div className="pt-2 text-xs text-[#586B7F]">
                <strong className="text-sm text-[#1B3A5C] block">260 XP MAX</strong>
                Core lessons stay open at every level.
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-[#DCE5ED] md:pl-6">
              <div>
                <h3 className="text-base font-bold text-[#1B3A5C]">12 curriculum badges</h3>
                <p className="text-xs text-[#586B7F]">
                  Milestones for practice, concepts, reflection, risk, and consistency.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['First Practice', 'Common', '01', 'bg-[#0F766E]'],
                  ['Risk Reader', 'Uncommon', 'RK', 'bg-[#2E75B6]'],
                  ['Diversification Guide', 'Rare', 'DV', 'bg-[#B45309]'],
                  ['Learning Architect', 'Epic', 'LA', 'bg-[#1B3A5C]'],
                ].map(([name, rarity, sym, bg]) => (
                  <div key={name} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#DCE5ED]">
                    <span className={`w-8 h-8 rounded-full ${bg} text-white font-bold flex items-center justify-center shrink-0`}>
                      {sym}
                    </span>
                    <div>
                      <strong className="block text-[#1B3A5C]">{name}</strong>
                      <span className="text-[#586B7F]">{rarity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#E7F4EF] text-xs text-[#16745B]">
                <strong className="block">Streaks reward learning, not attendance</strong>
                One qualifying lesson a day · one free freeze weekly · no paid recovery or profit rewards
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE5ED] space-y-2.5">
                <div className="text-xs font-bold uppercase text-[#2E75B6]">A · PERSONALISE FIRST</div>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                  {['Welcome', 'Assessment', 'Practice', 'Reward', 'Path', 'Community', 'Launch'].map((s) => (
                    <span
                      key={s}
                      className={`px-2.5 py-1 rounded border border-[#DCE5ED] ${
                        s === 'Practice' ? 'bg-[#E7F4EF] text-[#0F766E]' : 'bg-white text-[#1B3A5C]'
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F0F8F6] border border-[#DCE5ED] space-y-2.5">
                <div className="text-xs font-bold uppercase text-[#0F766E]">B · PRACTICE FIRST</div>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                  {['Welcome', 'Practice', 'Reward', 'Assessment', 'Path', 'Community', 'Launch'].map((s) => (
                    <span
                      key={s}
                      className={`px-2.5 py-1 rounded border border-[#DCE5ED] ${
                        s === 'Practice' || s === 'Reward' ? 'bg-[#E7F4EF] text-[#0F766E]' : 'bg-white text-[#1B3A5C]'
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 pt-2">
              <div>
                <div className="text-xs font-bold uppercase text-[#586B7F]">PRIMARY ENDPOINT</div>
                <div className="text-2xl font-bold text-[#1B3A5C] mt-1">Completion</div>
                <div className="text-xs text-[#586B7F]">Target 72% vs 77% (+5 pp)</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-[#586B7F]">SAMPLE SIZE</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#2E75B6] mt-1">1,325 / arm</div>
                <div className="text-xs text-[#586B7F]">10% enrollment allowance</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-[#586B7F]">ENROLLMENT</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0F766E] mt-1">21 days</div>
                <div className="text-xs text-[#586B7F]">At 4,700 signups / month</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED] text-xs">
                <strong className="block text-[#B45309]">Read D30 later</strong>
                <span className="text-[#243447]">
                  About 51 days from first assignment after the 30-day window matures.
                </span>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="grid md:grid-cols-[1.35fr_0.65fr] gap-6">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase text-[#586B7F]">7-STEP COMPLETION (70% SOURCE GOAL)</div>
              {[
                ['Pessimistic', 61.9, 'bg-[#B45309]', 'text-[#B45309]'],
                ['Base case', 71.9, 'bg-[#2E75B6]', 'text-[#2E75B6]'],
                ['Optimistic', 79.9, 'bg-[#0F766E]', 'text-[#0F766E]'],
              ].map(([label, val, barColor, textColor]) => (
                <div key={String(label)} className="grid grid-cols-[110px_1fr_64px] items-center gap-3 text-xs">
                  <strong className="text-[#1B3A5C]">{label}</strong>
                  <div className="h-4 rounded-full bg-[#E5EBF0] overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${val}%` }} />
                  </div>
                  <strong className={`text-right font-mono tabular-nums ${textColor}`}>{val}%</strong>
                </div>
              ))}

              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-[#DCE5ED]">
                <div>
                  <div className="text-xs font-bold text-[#1B3A5C]">Base completion · 95% sampling interval</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-[#2E75B6] mt-1">70.6% — 73.1%</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1B3A5C]">Base D30 cohort revenue</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-[#0F766E] mt-1">+$1,128 / month</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1B3A5C] text-white rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#AED0E6]">
                RETENTION IS NOT YET SOLVED
              </div>
              {[
                ['D1', '55%', 'target 70%+'],
                ['D7', '30%', 'target 40%+'],
                ['D30', '18%', 'baseline 8%'],
              ].map(([d, val, note]) => (
                <div key={d} className="flex items-baseline justify-between border-b border-white/15 pb-2">
                  <strong className="text-sm text-[#EAF4FA]">{d}</strong>
                  <strong className="text-2xl font-mono tabular-nums text-white">{val}</strong>
                  <span className="text-xs text-[#B9D0E0]">{note}</span>
                </div>
              ))}
              <p className="text-xs text-[#E1EDF5]">
                Base 3.6 min to first value · D1 55% remains below the brief’s target.
              </p>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            <div className="divide-y divide-[#DCE5ED] border-t border-b border-[#DCE5ED]">
              {[
                ['01', 'Activation', '7-step completion', 'Primary experiment'],
                ['02', 'First value', 'Practice preview → explained outcome', 'Time and first-action rate'],
                ['03', 'Comprehension', 'Concept check → teach-back', 'Learning quality'],
                ['04', 'Gamification', 'XP → badge → later action', 'Mechanics separately'],
                ['05', 'Social', 'Preview → opt-in group', 'Optional relevance'],
                ['06', 'Retention', 'Qualifying D1 / D7 / D30 action', 'Mature cohorts'],
              ].map(([num, name, flowText, purpose]) => (
                <div key={num} className="py-2.5 grid sm:grid-cols-[40px_160px_1fr_200px] items-center gap-3 text-xs">
                  <strong className="font-mono text-[#0F766E]">{num}</strong>
                  <strong className="text-sm text-[#1B3A5C]">{name}</strong>
                  <span className="text-[#243447]">{flowText}</span>
                  <span className="text-[#586B7F]">{purpose}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#FBF5E8] border border-[#DCE5ED] text-xs flex flex-wrap items-center gap-3">
              <strong className="text-[#B45309] uppercase">PAUSE RULES</strong>
              <span className="text-[#243447]">
                Comprehension falls &gt;0.3 · simulation errors &gt;3% or +1pp · event loss &gt;1% · any privacy
                incident
              </span>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              {[
                ['0', 'Baseline', 'W1-2', 'Metric contract · Event QA', 'bg-[#2E75B6]'],
                ['1', 'Validate', 'W3-4', 'Prototype sessions · Accessibility', 'bg-[#0F766E]'],
                ['2', 'Build', 'W5-7', 'Responsive flow · Server ledger', 'bg-[#1B3A5C]'],
                ['3', 'Ready', 'W8', 'A/A assignment · Privacy gate', 'bg-[#B45309]'],
                ['4', 'Experiment', 'W9-10', '21-day test · Guardrails', 'bg-[#2E75B6]'],
                ['5', 'Roll out', 'W11-12', '5% → 25% → 100% · D30 review', 'bg-[#0F766E]'],
              ].map(([n, name, wk, sub, bg]) => (
                <div key={n} className="p-3 rounded-xl bg-white border border-[#DCE5ED] space-y-1.5">
                  <div className={`w-9 h-9 rounded-full ${bg} text-white font-bold text-sm flex items-center justify-center mx-auto`}>
                    {n}
                  </div>
                  <div className="text-sm font-bold text-[#1B3A5C]">{name}</div>
                  <div className="text-xs font-mono font-bold text-[#2E75B6]">{wk}</div>
                  <div className="text-[11px] text-[#586B7F]">{sub}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#DCE5ED] space-y-3">
              <div className="text-sm font-bold text-[#1B3A5C]">Key risks with an owner</div>
              <div className="grid sm:grid-cols-5 gap-3 text-xs">
                {[
                  ['Baseline conflict', 'Data Science'],
                  ['Rewards distort learning', 'Product'],
                  ['Variant leakage', 'Engineering'],
                  ['Social proof validity', 'Data + Legal'],
                  ['Low-end performance', 'Engineering'],
                ].map(([risk, owner]) => (
                  <div key={risk} className="p-2.5 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED]">
                    <strong className="block text-[#1B3A5C]">{risk}</strong>
                    <span className="text-[#586B7F]">{owner}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 12:
      default:
        return (
          <div className="flex flex-col justify-between h-full text-white space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-bold tracking-widest uppercase text-[#A6CDE6]">BOARD DECISION</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Approve the learning loop,
                <br />
                then test the sequence
              </h2>
              <p className="text-base text-[#D7E4ED]">
                Four decisions get WorkBridge to a measurable, safer launch.
              </p>
            </div>

            <div className="divide-y divide-white/15 border-t border-b border-white/15">
              {[
                ['01', 'Reconcile the baseline', 'Confirm 11% vs 22% completion and D1 definitions.'],
                ['02', 'Validate the prototype', 'Test five-second value and first-action comprehension across personas.'],
                ['03', 'Fund instrumentation', 'Approve stable assignment, event QA, privacy and stop rules.'],
                ['04', 'Run the fixed test', 'Compare A and B for 21 days; expand only after matured evidence.'],
              ].map(([num, ask, detail]) => (
                <div key={num} className="py-3 grid sm:grid-cols-[48px_240px_1fr] items-center gap-3 text-xs sm:text-sm">
                  <strong className="font-mono text-[#83C9BA]">{num}</strong>
                  <strong className="text-white">{ask}</strong>
                  <span className="text-[#D7E4ED]">{detail}</span>
                </div>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#AFC3D1]">
              Design proposal only · No live users or experiment results supplied
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Deck Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#DCE5ED] rounded-xl px-5 py-3.5">
        <div className="flex items-center gap-3 text-xs">
          <strong className="text-[#1B3A5C] uppercase tracking-wider">12-Slide Retention Board Review</strong>
          <span aria-hidden="true" className="text-[#586B7F]">·</span>
          <span className="font-mono tabular-nums text-[#2E75B6] font-bold">
            Slide {String(slide.num).padStart(2, '0')} of 12
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg border border-[#DCE5ED] text-xs font-semibold text-[#1B3A5C] hover:bg-[#F3F7FA]"
          >
            {showGrid ? 'Hide Slide Grid' : 'All 12 Slides'}
          </button>
          <button
            type="button"
            onClick={() => setShowNotes((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg border border-[#DCE5ED] text-xs font-semibold text-[#1B3A5C] hover:bg-[#F3F7FA]"
          >
            {showNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
          </button>
          <button
            type="button"
            disabled={slideIdx === 0}
            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
            className="px-3 py-1.5 rounded-lg border border-[#DCE5ED] text-xs font-semibold text-[#1B3A5C] hover:bg-[#F3F7FA] disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={slideIdx === BOARD_SLIDES.length - 1}
            onClick={() => setSlideIdx((i) => Math.min(BOARD_SLIDES.length - 1, i + 1))}
            className="px-3.5 py-1.5 rounded-lg bg-[#1B3A5C] text-white text-xs font-semibold hover:bg-[#2E75B6] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Optional 12-Slide Overview Grid */}
      {showGrid && (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white border border-[#DCE5ED] rounded-xl p-4">
          {BOARD_SLIDES.map((s, idx) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                setSlideIdx(idx);
                setShowGrid(false);
              }}
              className={`text-left p-3 rounded-lg border transition-colors ${
                idx === slideIdx
                  ? 'border-[#2E75B6] bg-[#EAF3F9]'
                  : 'border-[#DCE5ED] bg-[#F3F7FA]/60 hover:bg-[#F3F7FA]'
              }`}
            >
              <div className="text-[11px] font-mono font-bold text-[#2E75B6]">
                SLIDE {String(s.num).padStart(2, '0')} · {s.kicker}
              </div>
              <div className="text-xs font-bold text-[#1B3A5C] mt-1 line-clamp-2">{s.title}</div>
            </button>
          ))}
        </div>
      )}

      {/* Main 16:9 Slide Canvas */}
      <div
        className={`rounded-2xl border border-[#DCE5ED] p-6 sm:p-10 min-h-[480px] flex flex-col justify-between shadow-xs ${
          slide.theme === 'navy'
            ? 'bg-[#1B3A5C] text-white'
            : slide.theme === 'pale'
            ? 'bg-[#F3F7FA] text-[#243447]'
            : 'bg-white text-[#243447]'
        }`}
      >
        {slide.theme !== 'navy' && (
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">{slide.kicker}</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1B3A5C] mt-1">{slide.title}</h2>
            <p className="text-sm sm:text-base text-[#586B7F] mt-1.5">{slide.subtitle}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">{renderSlideBody(slide.num)}</div>

        {slide.theme !== 'navy' && (
          <div className="pt-4 mt-6 border-t border-[#DCE5ED] flex items-center justify-between text-xs font-bold text-[#586B7F]">
            <span>WORKBRIDGE · RETENTION BOARD</span>
            <span className="font-mono tabular-nums">{String(slide.num).padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Speaker Notes Drawer */}
      {showNotes && (
        <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
            SPEAKER NOTES · SLIDE {String(slide.num).padStart(2, '0')}
          </div>
          <p className="text-sm text-[#243447] leading-relaxed">{slide.speakerNotes}</p>
        </div>
      )}
    </div>
  );
};
