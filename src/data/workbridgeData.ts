export interface AssessmentQuestion {
  id: 'confidence' | 'goal' | 'risk' | 'style';
  prompt: string;
  choices: [string, string, string][];
  feedback: string;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'confidence',
    prompt: 'How familiar are you with investing?',
    choices: [
      ['new', 'I’m just starting', 'A few concepts are new to me.'],
      ['some', 'I know a little', 'I’ve read or tried a few things.'],
      ['comfortable', 'I’m fairly comfortable', 'I know the basics and want to build.'],
    ],
    feedback: 'We’ll match the explanations to where you are today.',
  },
  {
    id: 'goal',
    prompt: 'What would you like to get better at?',
    choices: [
      ['investing', 'Investing basics', 'Understand markets and risk.'],
      ['budgeting', 'Personal money', 'Build confidence with everyday choices.'],
      ['career', 'Career skills', 'Learn finance for my next step.'],
    ],
    feedback: 'Your goal will shape the examples in your path.',
  },
  {
    id: 'risk',
    prompt: 'How should practice feel?',
    choices: [
      ['cautious', 'Take it step by step', 'Explain what can change before I act.'],
      ['balanced', 'A guided challenge', 'Give me context, then let me try.'],
      ['explore', 'Let me explore', 'I like trying examples as I learn.'],
    ],
    feedback: 'This sets a learning pace; it is not a real risk profile.',
  },
  {
    id: 'style',
    prompt: 'What helps you learn best?',
    choices: [
      ['examples', 'Short examples', 'Show me a concept in action.'],
      ['reading', 'Quick explanations', 'Give me a little context to read.'],
      ['guided', 'Step-by-step practice', 'Walk me through the first try.'],
    ],
    feedback: 'We’ll keep your first lesson in this style.',
  },
];

export interface JourneyTouchpoint {
  index: number;
  title: string;
  duration: string;
  userAction: string;
  systemResponse: string;
  riskResponse: string;
  valence: number;
  arousal: number;
  load: 'LOW' | 'MODERATE';
}

const VALENCE_POINTS = [5, 6, 5, 7, 6, 7, 6, 7, 7, 6, 7, 8, 8, 7, 7, 7, 8, 8];
const AROUSAL_POINTS = [4, 4, 5, 5, 4, 4, 4, 4, 4, 5, 6, 5, 6, 4, 4, 4, 5, 5];
const MODERATE_INDICES = new Set([2, 4, 6, 7, 8, 9, 10, 11, 17]);

const RAW_JOURNEY_ITEMS: [string, string, string, string, string][] = [
  ['Awareness link', '10s', 'Open a course or peer link.', 'See one promise: practise safely before real money.', 'Generic claim → name the safe first practice.'],
  ['Landing promise', '15s', 'Read how the platform works.', 'See sandbox, lessons, and time estimate.', 'Unclear difference → one benefit and one CTA.'],
  ['Account entry', '25s', 'Sign in with email or an identity provider.', 'Account confirmed; name remains optional.', 'Form and privacy friction → minimum fields, clear labels.'],
  ['Welcome', '30s', 'Enter an optional preferred name or continue.', 'See one value proposition and seven-step progress.', 'Value not understood → pass the five-second test.'],
  ['Confidence check', '10s', 'Choose new, some, or comfortable.', 'Wording level adjusts immediately.', 'Fear of judgment → neutral choices, editable later.'],
  ['Goal choice', '12s', 'Choose investing, budgeting, career, or explore.', 'Goal appears in the recommended path.', 'Irrelevant list → include “I’m exploring”.'],
  ['Learning pace', '10s', 'Choose cautious, balanced, or exploratory.', 'Explanations match the learning preference.', 'Sounds like advice → say this is not suitability.'],
  ['Learning style', '8s', 'Pick examples, quick explanations, or guidance.', 'Preference summary updates.', 'Too many settings → one choice, one “surprise me”.'],
  ['Path rationale', '5s', 'Review or edit the suggested track.', 'See “based on your answers” and change control.', 'Opaque inference → explain why and let users revise.'],
  ['Practice preview', '10s', 'Read fictional asset and practice-credit label.', 'See quote and risk note before action.', 'Feels like a real trade → repeat sandbox label by CTA.'],
  ['Guided action', '30s', 'Confirm a one-unit simulated order.', 'Order is confirmed with an explained result.', 'Fear or complexity → scaffold and preserve recovery.'],
  ['Outcome explanation', '15s', 'Open a risk or diversification tooltip.', 'Learn one concept in the context of the action.', 'Luck looks like skill → reward completion, not profit.'],
  ['First reward', '10s', 'Review First Practice badge and XP.', 'See exact criteria and next milestone.', 'Motion or pressure → static fallback, no forced share.'],
  ['Learning map', '20s', 'Open an optional module preview.', 'See the next short lesson and longer milestones.', 'Commitment pressure → no locked lessons.'],
  ['Community preview', '15s', 'Inspect a study group or continue alone.', 'See clearly labelled, illustrative group examples.', 'Fake proof → live counts need consent and audit.'],
  ['Private goal', '15s', 'Choose a session length or skip.', 'Save a reversible goal; no permission prompt.', 'Pressure or fatigue → private, optional, editable.'],
  ['Launch summary', '30s', 'Check path and press Start lesson.', 'Open the first full module with choices carried over.', 'Unclear next action → one primary lesson CTA.'],
  ['First lesson action', '45s', 'Answer one teach-back check and apply it.', 'Get an explanation, retry, and next lesson.', 'Another tutorial → a short active learning loop.'],
];

export const JOURNEY_TOUCHPOINTS: JourneyTouchpoint[] = RAW_JOURNEY_ITEMS.map((item, idx) => ({
  index: idx + 1,
  title: item[0],
  duration: item[1],
  userAction: item[2],
  systemResponse: item[3],
  riskResponse: item[4],
  valence: VALENCE_POINTS[idx],
  arousal: AROUSAL_POINTS[idx],
  load: MODERATE_INDICES.has(idx + 1) ? 'MODERATE' : 'LOW',
}));

export interface BadgeSpec {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
  criteria: string;
  driver: string;
  symbol: string;
  color: string;
}

export const CURRICULUM_BADGES: BadgeSpec[] = [
  { id: 'first_practice', name: 'First Practice', rarity: 'Common', criteria: 'Complete the explained first simulation', driver: 'Footsteps in a navy circle with teal ring · accomplishment', symbol: '01', color: '#0F766E' },
  { id: 'curious_mind', name: 'Curious Mind', rarity: 'Common', criteria: 'Complete the four-question assessment', driver: 'Open book with a small star · curiosity', symbol: 'Q4', color: '#2E75B6' },
  { id: 'path_finder', name: 'Path Finder', rarity: 'Common', criteria: 'Preview a recommended learning path', driver: 'Three connected nodes · autonomy', symbol: 'P1', color: '#16745B' },
  { id: 'risk_reader', name: 'Risk Reader', rarity: 'Uncommon', criteria: 'Correctly identify the sandbox risk note in a lesson check', driver: 'Shield and magnifier, amber rim · competence', symbol: 'RK', color: '#B45309' },
  { id: 'market_debut', name: 'Market Debut', rarity: 'Common', criteria: 'Complete the first full market lesson', driver: 'Simple rising-and-falling line, equal visual weight · practice', symbol: 'M1', color: '#2E75B6' },
  { id: 'concept_connector', name: 'Concept Connector', rarity: 'Uncommon', criteria: 'Match a concept to its use in two lesson checks', driver: 'Two linked tiles · mastery', symbol: 'C2', color: '#0F766E' },
  { id: 'consistent_learner', name: 'Consistent Learner', rarity: 'Uncommon', criteria: 'Complete learning actions on three separate days', driver: 'Three small calendar marks · habit', symbol: '3D', color: '#16745B' },
  { id: 'diversification_guide', name: 'Diversification Guide', rarity: 'Rare', criteria: 'Complete the diversification module and apply it in simulation', driver: 'Three balanced bars · understanding', symbol: 'DV', color: '#B45309' },
  { id: 'community_contributor', name: 'Community Contributor', rarity: 'Uncommon', criteria: 'Make one opted-in, moderated study-group contribution', driver: 'Speech bubble with book · relatedness', symbol: 'SG', color: '#2E75B6' },
  { id: 'reflection_builder', name: 'Reflection Builder', rarity: 'Rare', criteria: 'Complete three post-lesson reflections', driver: 'Mirror and pencil · self-awareness', symbol: 'R3', color: '#0F766E' },
  { id: 'learning_architect', name: 'Learning Architect', rarity: 'Epic', criteria: 'Complete an advanced pathway and its teach-back checks', driver: 'Layered map with route line · mastery', symbol: 'LA', color: '#1B3A5C' },
  { id: 'safety_first', name: 'Safety First', rarity: 'Rare', criteria: 'Finish the risk and simulation-safety curriculum', driver: 'Shield with check and label · care', symbol: 'SF', color: '#16745B' },
];

export interface XpAwardAction {
  id: string;
  action: string;
  award: number;
  maxAward: number;
  frequency: string;
  rationale: string;
  eventName: string;
}

export const ONBOARDING_XP_TABLE: XpAwardAction[] = [
  { id: 'profile', action: 'Complete profile basics', award: 20, maxAward: 20, frequency: 'Once per account', rationale: 'Credits setup without rewarding unnecessary personal data', eventName: 'gamification_earned_xp' },
  { id: 'assessment', action: 'Answer assessment (4 questions)', award: 10, maxAward: 40, frequency: '4 questions · 40 max', rationale: 'Acknowledges effort, not a “correct” personal preference', eventName: 'assessment_answered_question' },
  { id: 'simulation', action: 'Complete guided simulation', award: 80, maxAward: 80, frequency: 'Once per account', rationale: 'Largest award is for first meaningful, explained practice; independent of P/L', eventName: 'simulation_completed_action' },
  { id: 'badge', action: 'Earn First Practice badge', award: 25, maxAward: 25, frequency: 'Once', rationale: 'Clear reward tied to the completed learning action', eventName: 'gamification_unlocked_badge' },
  { id: 'preview', action: 'Preview a module', award: 10, maxAward: 20, frequency: '2 previews · 20 max', rationale: 'Encourages optional exploration, with a small cap', eventName: 'path_previewed_module' },
  { id: 'community', action: 'View community preview', award: 10, maxAward: 10, frequency: 'Once', rationale: 'Credits exploration without requiring joining or sharing', eventName: 'community_viewed_preview' },
  { id: 'goal', action: 'Set a private learning goal', award: 15, maxAward: 15, frequency: 'Once', rationale: 'Credits user-authored intention; skipping is always allowed', eventName: 'goal_set_private' },
  { id: 'launch', action: 'Complete onboarding and open lesson', award: 50, maxAward: 50, frequency: 'Once', rationale: 'Rewards transition into the actual learning loop', eventName: 'launch_clicked_lesson' },
];

export interface EventTaxonomyItem {
  eventName: string;
  category: string;
  description: string;
  properties: string[];
}

const RAW_EVENTS: [string, string, string][] = [
  ['onboarding_assigned_variant', 'Server assigns user to an experiment arm', 'experiment_id|assignment_method|sequence_version'],
  ['onboarding_started_flow', 'First onboarding screen is rendered', 'entry_point|screen_load_ms'],
  ['onboarding_viewed_step', 'Logical onboarding screen becomes visible', 'step_id|sequence_position|view_source'],
  ['onboarding_completed_step', 'User completes a required or explicit pass-through step', 'step_id|sequence_position|completion_type'],
  ['onboarding_skipped_step', 'User skips an optional question or detail', 'step_id|skip_reason'],
  ['onboarding_clicked_back', 'User navigates to previous logical step', 'from_step_id|to_step_id'],
  ['onboarding_clicked_exit', 'User requests to leave onboarding', 'step_id|exit_target'],
  ['onboarding_resumed_session', 'User resumes an incomplete onboarding flow', 'resume_gap_hours|step_id'],
  ['profile_completed_basics', 'Minimum profile setup is confirmed', 'profile_field_count|auth_method'],
  ['profile_completed_auth', 'Account authentication is confirmed', 'auth_method|verification_state'],
  ['assessment_viewed_question', 'Assessment question enters the viewport', 'question_id|question_position'],
  ['assessment_answered_question', 'User selects an assessment answer', 'question_id|answer_code|response_time_ms'],
  ['assessment_skipped_question', 'User skips an assessment answer', 'question_id|skip_reason'],
  ['assessment_completed_flow', 'Assessment has four answers or explicit skips', 'answered_count|skipped_count'],
  ['assessment_assigned_persona', 'System assigns a learning persona', 'persona_type|confidence_band'],
  ['path_generated_recommendation', 'Recommendation service returns a track', 'track_id|reason_code|fallback_used'],
  ['path_viewed_map', 'Personalised learning map is displayed', 'track_id|node_count'],
  ['path_changed_track', 'User selects a different track', 'previous_track_id|new_track_id|change_reason'],
  ['path_previewed_module', 'User opens an optional module preview', 'module_id|track_id|preview_duration_ms'],
  ['simulation_viewed_preview', 'Fictional asset and practice-credit preview is shown', 'asset_id|market_scenario_id'],
  ['simulation_opened_order', 'User opens the sandbox order control', 'asset_id|order_type'],
  ['simulation_submitted_order', 'Order request is sent to the sandbox', 'asset_id|quantity|order_type|idempotency_key'],
  ['simulation_completed_action', 'Server confirms the explained practice action', 'asset_id|outcome_code|lesson_concept|latency_ms'],
  ['simulation_viewed_explanation', 'User sees the outcome and concept explanation', 'concept_id|explanation_version'],
  ['simulation_clicked_tooltip', 'User opens a contextual term explanation', 'tooltip_id|concept_id'],
  ['gamification_earned_xp', 'Valid XP ledger award is written', 'action_id|xp_amount|ledger_entry_id'],
  ['gamification_unlocked_badge', 'Badge eligibility is fulfilled', 'badge_id|rarity|criteria_version'],
  ['gamification_viewed_badge', 'User opens a badge detail', 'badge_id|display_location'],
  ['gamification_viewed_level', 'Level progress detail is opened', 'level_id|xp_to_next_level'],
  ['gamification_completed_streak_action', 'Qualifying daily learning action is confirmed', 'streak_day|action_type|registered_timezone'],
  ['gamification_activated_streak', 'User chooses to view or enable streak tracking', 'reminder_opt_in|current_streak'],
  ['gamification_used_streak_freeze', 'One permitted streak freeze is applied', 'freeze_reason|streak_day'],
  ['gamification_viewed_reward', 'User views a reward explanation', 'reward_id|reward_type'],
  ['community_viewed_preview', 'Optional study-group preview is rendered', 'preview_version|source_label'],
  ['community_clicked_group', 'User opens a group detail', 'group_id|group_size_band'],
  ['community_skipped_preview', 'User explicitly continues without community', 'skip_control'],
  ['goal_set_private', 'User saves a private learning goal', 'goal_type|target_minutes|reminder_requested'],
  ['goal_skipped_setup', 'User skips goal selection', 'skip_reason'],
  ['launch_clicked_lesson', 'User starts the first full lesson', 'lesson_id|track_id'],
  ['lesson_started_module', 'Lesson module is opened', 'lesson_id|module_id'],
  ['lesson_answered_check', 'User submits a concept check', 'lesson_id|question_id|correct|attempt_number'],
  ['lesson_completed_module', 'Server confirms lesson completion', 'lesson_id|duration_ms|comprehension_score'],
  ['notification_viewed_primer', 'User sees value explanation before permission', 'notification_type|primer_version'],
  ['notification_accepted_permission', 'User grants an optional notification permission', 'notification_type|platform_permission'],
  ['notification_declined_permission', 'User declines an optional notification permission', 'notification_type|platform_permission'],
  ['error_viewed_message', 'User sees a field or system error', 'error_code|step_id|recoverable'],
  ['error_retried_action', 'User retries after an error', 'error_code|retry_number|action_id'],
  ['support_opened_contact', 'User opens a support channel', 'issue_category|step_id'],
  ['accessibility_changed_motion', 'User changes motion preference', 'motion_preference|settings_surface'],
  ['accessibility_changed_text_size', 'User changes text scale', 'text_scale_percent|settings_surface'],
  ['feedback_submitted_nps', 'User submits onboarding recommendation score', 'nps_score|comment_category'],
  ['analytics_failed_sync', 'Client event batch cannot sync and is queued', 'failed_event_count|retry_state'],
];

export const EVENT_TAXONOMY: EventTaxonomyItem[] = RAW_EVENTS.map(([eventName, description, props]) => ({
  eventName,
  category: eventName.split('_')[0],
  description,
  properties: props.split('|'),
}));

export const SOURCE_ERRATA = [
  {
    id: 1,
    statement: 'Overview and KPI table describe current completion as 22%; A3.1 provides 1,557 completions from 14,200 registrations.',
    reconciliation: '1,557 / 14,200 = 10.96%, rounded to 11%; A8.3 also lists 11%.',
    handling: 'Use 11% for funnel and revenue baseline; retain 22% as unresolved narrative conflict.',
  },
  {
    id: 2,
    statement: 'A2.1 says 61% leave before screen 8; A3.1 shows 3,129 users enter screen 8 from 14,200.',
    reconciliation: '(14,200 - 3,129) / 14,200 = 78.0% do not reach screen 8.',
    handling: 'Use screen-level counts; do not use 61% without a definition or corrected denominator.',
  },
  {
    id: 3,
    statement: 'A3.3 cohort shares and D7 rates imply an overall weighted D7 of 18.79%.',
    reconciliation: '31%×8% + 27%×34% + 11%×62% + 31%×1% = 18.79%; A3.5 separately reports 14%.',
    handling: 'Use A3.5’s explicit overall D7 table rate (14%) as the model baseline; mark cohort rates as non-reconciled.',
  },
  {
    id: 4,
    statement: 'A3.3 cohort shares and D30 rates imply an overall weighted D30 of about 10.08%.',
    reconciliation: '31%×2% + 27%×18% + 11%×41% + 31%×0.3% = 10.08%; A8.3 lists 8%.',
    handling: 'Use 8% for financial comparison because A8.3 is the specified financial baseline; flag cohort data mismatch.',
  },
  {
    id: 5,
    statement: '“68% Day-1 drop-off before first meaningful action” is used alongside 32% D1 retention.',
    reconciliation: 'The labels refer to different outcomes: pre-action conversion versus return within 24 hours.',
    handling: 'Define separate events and dashboards; never treat them as complements without matched definitions.',
  },
  {
    id: 6,
    statement: 'A8.1 requests confidence intervals and a projection, but supplied source gives no uncertainty for benchmark rates.',
    reconciliation: 'No confidence interval for the future uplift can be calculated from baseline counts alone.',
    handling: 'Show a binomial interval conditional on the base assumption (70.6%–73.1%), label it as sampling uncertainty only, and separately plan an A/B test.',
  },
];

export const BOARD_SLIDES = [
  {
    num: 1,
    kicker: 'WORKBRIDGE · RETENTION BOARD',
    title: 'Learning starts with a safe first try',
    subtitle: 'A seven-step gamified onboarding redesign for financial literacy',
    theme: 'navy' as const,
    speakerNotes:
      'Open with the customer problem: the current tutorial asks for attention before it demonstrates useful value. This proposal gives new learners a safe, explained practice action, then uses that experience to shape their learning path. WorkBridge and all user-facing examples are fictional. No real-money trading or investment recommendation is part of this design. Source context: supplied assessment, pp. 1-5.',
  },
  {
    num: 2,
    kicker: '01 · BASELINE',
    title: 'Most users leave before the first learning action',
    subtitle: 'The screen-level funnel ends with 1,557 of 14,200 registrations.',
    theme: 'white' as const,
    speakerNotes:
      'The supplied funnel has 14,200 registrations and 1,557 completions: 10.96%, rounded to 11%. Screen 2 loses 2,842 entrants (22% of those reaching it); screen 4 loses 2,097 (26%). The 3,129 users reaching screen 8 are 22% of registrations, meaning 78% did not reach that screen, which conflicts with a separate 61% statement in the brief. Use 11% pending reconciliation.',
  },
  {
    num: 3,
    kicker: '02 · EVIDENCE',
    title: 'The friction is about timing, relevance, and length',
    subtitle: 'Simulated user feedback points to an action-first route with fewer demands upfront.',
    theme: 'pale' as const,
    speakerNotes:
      'Lead with the shape of the problem: 54% say onboarding is too long, 42% say information comes too early, and 37% want hands-on use earlier. A further 31% feel the product is generic and 19% say there is no early reward. Heatmap reinforces this: only 8% interact with the feature overview; screen 4 has 34% back-button use.',
  },
  {
    num: 4,
    kicker: '03 · SOLUTION',
    title: 'Seven steps put practice near the start',
    subtitle: 'Both routes keep the learning action, reward, path, community, and launch.',
    theme: 'white' as const,
    speakerNotes:
      'Variant A asks four low-effort questions before guided practice. Variant B uses the same components and content but moves practice and its fixed reward before the questions. The rest of the flow stays in the same order. This makes the primary experiment a sequence test while preserving the brief’s seven required stages.',
  },
  {
    num: 5,
    kicker: '04 · PROTOTYPE',
    title: 'The first practice teaches, not trading',
    subtitle: 'Fictional asset, practice credits, clear risk language, and a fixed learning reward.',
    theme: 'pale' as const,
    speakerNotes:
      'The user practices an order for one unit of a fictional asset (Northstar Foods · NFD) using learning credits. The explanation teaches order mechanics; it does not celebrate gains. Fixed XP and the badge are awarded for completing the action, not for profit or risk-taking.',
  },
  {
    num: 6,
    kicker: '05 · PERSONALISATION',
    title: 'Learners stay in control of their path',
    subtitle: 'Four personas receive a clear next step, with the reason visible and easy to change.',
    theme: 'white' as const,
    speakerNotes:
      'The assessment asks about confidence, goal, comfort with a learning pace, and preferred learning style. The resulting path is a recommendation with a visible rationale and an easy way to change it. The four personas are Curious Beginner, Aspiring Professional, Career Switcher, and Passive Learner.',
  },
  {
    num: 7,
    kicker: '06 · GAMIFICATION',
    title: 'XP reinforces actions that teach',
    subtitle: 'A bounded 260 XP onboarding economy, with private curriculum badges and a forgiving streak.',
    theme: 'pale' as const,
    speakerNotes:
      'Onboarding XP totals 260 at the maximum: profile 20, four answers 40, completed practice 80, badge 25, two previews 20, community 10, goal 15, launch 50. Core lessons remain available regardless of level. Twelve badges reflect curriculum milestones; simulated profit never earns a reward.',
  },
  {
    num: 8,
    kicker: '07 · EXPERIMENT',
    title: 'Test the sequence with a fixed-horizon A/B',
    subtitle: 'One primary contrast: ask for assessment effort before or after a safe practice action.',
    theme: 'white' as const,
    speakerNotes:
      'The falsifiable primary hypothesis is that B increases completion by at least five absolute percentage points (72% vs 77%). With two-sided alpha .05 and 80% power, the normal two-proportion formula gives 1,192 evaluable users per arm. A 10% allowance yields 1,325 assignments per arm over a minimum 21-day enrollment window. D30 matures around day 51.',
  },
  {
    num: 9,
    kicker: '08 · FORECAST',
    title: 'The base case clears completion and time targets; retention remains a risk',
    subtitle: 'Scenario ranges use conditional step rates and are not validated outcomes.',
    theme: 'pale' as const,
    speakerNotes:
      'Completion projections are 61.9% (pessimistic), 71.9% (base), and 79.9% (optimistic). Base first-action rate by step 3 is 82.1% (18% exit vs <30% target). Base 95% sampling interval is 70.6%–73.1%. Base D30 cohort revenue is +$1,128/month ($13,536 annualised). However, base D1 (55%) and D7 (30%) remain below the 70%+ and 40%+ targets.',
  },
  {
    num: 10,
    kicker: '09 · MEASUREMENT',
    title: 'Measure learning quality alongside conversion',
    subtitle: '52 event definitions support six funnels; guardrails keep the reward system honest.',
    theme: 'white' as const,
    speakerNotes:
      'The framework defines 52 events using snake_case category_action_object format and Appendix B standard properties. Six funnels separately measure Activation, First value, Comprehension, Gamification, Social, and Retention. Guardrails pause the experiment if comprehension falls >0.3, simulation errors exceed 3% or +1pp, event loss >1%, or any privacy incident occurs.',
  },
  {
    num: 11,
    kicker: '10 · DELIVERY',
    title: 'A 12-week rollout starts with data quality',
    subtitle: 'Reconcile definitions before exposure; earn each rollout step with a quality gate.',
    theme: 'pale' as const,
    speakerNotes:
      'Phase 0 (W1-2) resolves the denominator conflict and establishes event parity; Phase 1 (W3-4) validates with users and accessibility; Phase 2 (W5-7) builds the responsive flow and server ledger; Phase 3 (W8) runs A/A assignment and privacy gates; Phase 4 (W9-10) executes the 21-day test; Phase 5 (W11-12) rolls out 5% → 25% → 100%.',
  },
  {
    num: 12,
    kicker: 'BOARD DECISION',
    title: 'Approve the learning loop, then test the sequence',
    subtitle: 'Four decisions get WorkBridge to a measurable, safer launch.',
    theme: 'navy' as const,
    speakerNotes:
      'Close with four asks: (01) Reconcile the baseline (confirm 11% vs 22% completion and D1 definitions), (02) Validate the prototype across personas, (03) Fund instrumentation and privacy gates, and (04) Run the fixed 21-day A/B test.',
  },
];
