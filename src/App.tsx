import React, { useState, useEffect } from 'react';
import { VariantType } from './utils/onboardingLogic';
import { PrototypeView } from './components/PrototypeView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { JourneyMapView } from './components/JourneyMapView';
import { GamificationAbView } from './components/GamificationAbView';
import { PresentationDeckView } from './components/PresentationDeckView';

type ActiveTab = 'prototype' | 'analytics' | 'journey' | 'gamification' | 'deck';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('prototype');
  const [variant, setVariant] = useState<VariantType>('A');
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'analytics' || tabParam === 'journey' || tabParam === 'gamification' || tabParam === 'deck') {
      setActiveTab(tabParam);
    }
    const varParam = params.get('variant');
    if (varParam === 'B') {
      setVariant('B');
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'prototype', label: 'Interactive Prototype' },
    { id: 'analytics', label: 'Analytics & Funnel' },
    { id: 'journey', label: 'Journey Map' },
    { id: 'gamification', label: 'Gamification & A/B' },
    { id: 'deck', label: 'Board Deck' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7FA] text-[#243447]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-[#DCE5ED] sticky top-0 z-30">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('prototype');
            }}
            className="text-xl font-extrabold tracking-tight text-[#1B3A5C] whitespace-nowrap shrink-0 font-display"
          >
            workbridge
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-1" aria-label="Primary sections">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    isActive
                      ? 'text-[#1B3A5C] border-[#2E75B6]'
                      : 'text-[#586B7F] border-transparent hover:text-[#1B3A5C]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0 hidden sm:block">
            <button
              type="button"
              onClick={() => {
                const nextVar = variant === 'A' ? 'B' : 'A';
                setVariant(nextVar);
                setActiveTab('prototype');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3A5C] rounded-lg hover:bg-[#2E75B6] transition-colors whitespace-nowrap shrink-0"
            >
              Switch to Variant {variant === 'A' ? 'B' : 'A'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {activeTab === 'prototype' && (
          <PrototypeView
            variant={variant}
            onVariantChange={setVariant}
            reduceMotion={reduceMotion}
            onToggleReduceMotion={() => setReduceMotion((prev) => !prev)}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsDashboardView />}
        {activeTab === 'journey' && <JourneyMapView />}
        {activeTab === 'gamification' && <GamificationAbView />}
        {activeTab === 'deck' && <PresentationDeckView />}
      </main>

      {/* Clean Footer */}
      <footer className="max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-5 border-t border-[#DCE5ED] text-xs text-[#586B7F] flex flex-wrap items-center justify-between gap-4">
        <span>
          WorkBridge Gamified Onboarding Redesign · Practice with fictional assets and credits · Education, not
          financial advice
        </span>
        <span>
          Baseline reconciled at 11.0% (1,557 / 14,200) · Base projection 71.9% · Active Variant {variant}
        </span>
      </footer>
    </div>
  );
}
