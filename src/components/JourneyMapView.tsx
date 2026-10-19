import React, { useState } from 'react';
import { JOURNEY_TOUCHPOINTS, JourneyTouchpoint } from '../data/workbridgeData';

export const JourneyMapView: React.FC = () => {
  const [loadFilter, setLoadFilter] = useState<'ALL' | 'LOW' | 'MODERATE'>('ALL');
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint>(JOURNEY_TOUCHPOINTS[10]); // #11 Guided action

  const filteredTouchpoints = JOURNEY_TOUCHPOINTS.filter(
    (tp) => loadFilter === 'ALL' || tp.load === loadFilter
  );

  // SVG chart coordinates matching the journey map generation script
  const yForScore = (score: number) => 220 - (score - 1) * 21;
  const xForIndex = (idx: number) => 56 + idx * 52;

  const valencePolyline = JOURNEY_TOUCHPOINTS.map((tp, i) => `${xForIndex(i)},${yForScore(tp.valence)}`).join(' ');
  const arousalPolyline = JOURNEY_TOUCHPOINTS.map((tp, i) => `${xForIndex(i)},${yForScore(tp.arousal)}`).join(' ');

  return (
    <div className="space-y-8">
      {/* Header & Cognitive Load Filter */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
            END-TO-END ONBOARDING ARCHITECTURE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] mt-1">
            18-touchpoint onboarding journey map
          </h1>
          <p className="text-sm text-[#586B7F] mt-1 max-w-2xl">
            SAM valence / arousal curves are design hypotheses, not observations. Cards show user action, system
            response, cognitive load, and design risk mitigation from awareness link to first lesson action.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#DCE5ED] rounded-xl" role="group" aria-label="Filter touchpoints by cognitive load">
          {(['ALL', 'LOW', 'MODERATE'] as const).map((filterVal) => (
            <button
              key={filterVal}
              type="button"
              onClick={() => setLoadFilter(filterVal)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                loadFilter === filterVal ? 'bg-[#1B3A5C] text-white' : 'text-[#586B7F] hover:text-[#1B3A5C]'
              }`}
            >
              {filterVal === 'ALL' ? 'All 18 Touchpoints' : `${filterVal} Load (${JOURNEY_TOUCHPOINTS.filter((t) => t.load === filterVal).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SAM Valence / Arousal Curve & Selected Touchpoint Inspector */}
      <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 items-stretch">
        <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-bold text-[#1B3A5C]">SAM Valence & Arousal Trajectory (1–9 Scale)</h2>
              <p className="text-xs text-[#586B7F]">Click any node (1–18) on the chart to inspect that touchpoint.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[#1B3A5C]">― Valence / Pleasure</span>
              <span className="text-[#0F766E]">-- Arousal</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 980 265"
              className="w-full min-w-[680px] h-auto select-none"
              role="img"
              aria-label="WorkBridge 18 touchpoint SAM valence and arousal curve"
            >
              {[1, 3, 5, 7, 9].map((score) => {
                const yy = yForScore(score);
                return (
                  <g key={score}>
                    <line x1="40" y1={yy} x2="955" y2={yy} stroke="#DCE5ED" strokeWidth="1" />
                    <text x="28" y={yy + 4} textAnchor="end" fill="#586B7F" fontSize="11" fontFamily="JetBrains Mono">
                      {score}
                    </text>
                  </g>
                );
              })}

              <polyline
                points={valencePolyline}
                fill="none"
                stroke="#1B3A5C"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={arousalPolyline}
                fill="none"
                stroke="#0F766E"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {JOURNEY_TOUCHPOINTS.map((tp, i) => {
                const cx = xForIndex(i);
                const yv = yForScore(tp.valence);
                const ya = yForScore(tp.arousal);
                const isSelected = selectedTouchpoint.index === tp.index;
                return (
                  <g
                    key={tp.index}
                    className="cursor-pointer"
                    onClick={() => setSelectedTouchpoint(tp)}
                  >
                    {isSelected && (
                      <line x1={cx} y1={35} x2={cx} y2={230} stroke="#2E75B6" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}
                    <circle
                      cx={cx}
                      cy={yv}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? '#2E75B6' : '#1B3A5C'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <circle cx={cx} cy={ya} r={isSelected ? 5.5 : 4} fill="#0F766E" />
                    <text
                      x={cx}
                      y={248}
                      textAnchor="middle"
                      fill={isSelected ? '#1B3A5C' : '#586B7F'}
                      fontWeight={isSelected ? '700' : '500'}
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                    >
                      {String(tp.index).padStart(2, '0')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Touchpoint Deep Inspector */}
        <aside className="bg-white border border-[#DCE5ED] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#2E75B6]">
                TOUCHPOINT {String(selectedTouchpoint.index).padStart(2, '0')} OF 18
              </span>
              <span
                className={`font-bold ${
                  selectedTouchpoint.load === 'MODERATE' ? 'text-[#B45309]' : 'text-[#0F766E]'
                }`}
              >
                {selectedTouchpoint.duration} · SAM V{selectedTouchpoint.valence}/A{selectedTouchpoint.arousal} · {selectedTouchpoint.load} LOAD
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#1B3A5C]">{selectedTouchpoint.title}</h3>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED]">
                <div className="font-bold uppercase tracking-wider text-[#0F766E] mb-1">User Action</div>
                <div className="text-[#243447]">{selectedTouchpoint.userAction}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F7FA] border border-[#DCE5ED]">
                <div className="font-bold uppercase tracking-wider text-[#2E75B6] mb-1">System Response</div>
                <div className="text-[#243447]">{selectedTouchpoint.systemResponse}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FBF5E8] border border-[#DCE5ED]">
                <div className="font-bold uppercase tracking-wider text-[#B45309] mb-1">Risk → Design Response</div>
                <div className="text-[#243447]">{selectedTouchpoint.riskResponse}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#DCE5ED]">
            <button
              type="button"
              onClick={() => {
                const prevIdx = (selectedTouchpoint.index - 2 + 18) % 18;
                setSelectedTouchpoint(JOURNEY_TOUCHPOINTS[prevIdx]);
              }}
              className="text-xs font-semibold text-[#1B3A5C] hover:underline"
            >
              ← Prev touchpoint
            </button>
            <button
              type="button"
              onClick={() => {
                const nextIdx = selectedTouchpoint.index % 18;
                setSelectedTouchpoint(JOURNEY_TOUCHPOINTS[nextIdx]);
              }}
              className="text-xs font-semibold text-[#1B3A5C] hover:underline"
            >
              Next touchpoint →
            </button>
          </div>
        </aside>
      </div>

      {/* 18-Touchpoint Grid */}
      <section aria-label="18 touchpoint cards">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTouchpoints.map((tp) => {
            const isSelected = selectedTouchpoint.index === tp.index;
            return (
              <article
                key={tp.index}
                onClick={() => setSelectedTouchpoint(tp)}
                className={`bg-white rounded-xl p-4 border transition-colors cursor-pointer space-y-2.5 ${
                  isSelected ? 'border-[#2E75B6] bg-[#EAF3F9]/30' : 'border-[#DCE5ED] hover:border-[#2E75B6]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#1B3A5C]">
                    {String(tp.index).padStart(2, '0')} · {tp.title}
                  </h3>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      tp.load === 'MODERATE' ? 'text-[#B45309]' : 'text-[#0F766E]'
                    }`}
                  >
                    {tp.duration} · V{tp.valence}/A{tp.arousal} · {tp.load}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div>
                    <strong className="text-[#0F766E] uppercase text-[10px] tracking-wider block">User Action</strong>
                    <span className="text-[#243447]">{tp.userAction}</span>
                  </div>
                  <div>
                    <strong className="text-[#2E75B6] uppercase text-[10px] tracking-wider block">
                      System Response
                    </strong>
                    <span className="text-[#243447]">{tp.systemResponse}</span>
                  </div>
                  <div className="pt-1 border-t border-[#DCE5ED] text-[#586B7F]">
                    <strong className="text-[#B45309] uppercase text-[10px] tracking-wider block">
                      Risk → Design Response
                    </strong>
                    <span>{tp.riskResponse}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Four Persona Tracks */}
      <section className="bg-white border border-[#DCE5ED] rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1B3A5C]">
            Persona branches & personalisation promise
          </h2>
          <p className="text-xs text-[#586B7F]">
            “Based on your answers” · skip or edit any choice · no suitability score · no locked core lessons
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              num: 1,
              name: 'Curious Beginner',
              track: 'Finance Foundations',
              desc: 'One concept at a time · plain-language definitions',
              color: 'bg-[#2E75B6]',
            },
            {
              num: 2,
              name: 'Aspiring Professional',
              track: 'Portfolio Foundations',
              desc: 'Faster examples · risk context remains visible',
              color: 'bg-[#0F766E]',
            },
            {
              num: 3,
              name: 'Career Switcher',
              track: 'Finance for Your Next Step',
              desc: 'Guided structure · workplace-relevant concepts',
              color: 'bg-[#B45309]',
            },
            {
              num: 4,
              name: 'Passive Learner',
              track: 'Money Basics',
              desc: 'Short sessions · community stays optional',
              color: 'bg-[#16745B]',
            },
          ].map((p) => (
            <div key={p.name} className="p-4 rounded-xl bg-[#F3F7FA] border border-[#DCE5ED] space-y-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full ${p.color} text-white text-xs font-bold flex items-center justify-center`}>
                  {p.num}
                </span>
                <strong className="text-sm text-[#1B3A5C]">{p.name}</strong>
              </div>
              <div className="text-xs font-bold text-[#243447]">{p.track}</div>
              <p className="text-xs text-[#586B7F]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
