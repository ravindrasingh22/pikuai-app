import type { ChildProfile, Controls, DashboardOverview, ParentProfile, ReportSummary, TranscriptThread } from "../types/domain";

export const sampleParent: ParentProfile = {
  id: "parent-demo",
  full_name: "Priya Sharma",
  email: "priya@example.com",
  preferred_language: "en",
  pin_enabled: true,
  two_factor_enabled: true
};

export const sampleChildren: ChildProfile[] = [
  { id: "anaya", display_name: "Anaya", age_band: "6-8", daily_time_limit_minutes: 30, voice_enabled: true, avatar_key: "girl", gender: "girl", child_pin_enabled: false },
  { id: "vihaan", display_name: "Vihaan", age_band: "9-11", daily_time_limit_minutes: 40, voice_enabled: true, avatar_key: "boy", gender: "boy", child_pin_enabled: true },
  { id: "meera", display_name: "Meera", age_band: "11-13", daily_time_limit_minutes: 45, voice_enabled: true, avatar_key: "girl", gender: "not_disclosed", child_pin_enabled: false }
];

export const sampleOverview: DashboardOverview = {
  child_count: 3,
  current_plan: "family_plus",
  weekly_sessions: 12,
  pending_alerts: 0,
  recent_activity: [
    { id: "1", title: "Asked about planets and stars", last_policy_bucket: "allowed", updated_at: "10:30 AM" },
    { id: "2", title: "Explored dinosaurs", last_policy_bucket: "allowed", updated_at: "Yesterday" },
    { id: "3", title: "Voice chat - ocean animals", last_policy_bucket: "allowed_with_adaptation", updated_at: "Yesterday" }
  ]
};

export const sampleControls: Controls = {
  transcript_visibility_enabled: true,
  content_strictness_level: "strict",
  session_limit_enabled: true,
  default_session_limit_minutes: 30,
  sensitive_topic_alerts_enabled: true,
  weekly_summary_enabled: true,
  optional_personalization_enabled: false,
  retention_policy_code: "90_days"
};

export const sampleTranscripts: TranscriptThread[] = [
  {
    id: "thread-1",
    child_profile_id: "anaya",
    title: "Why do stars twinkle at night?",
    last_policy_bucket: "allowed",
    messages: [
      { id: "m1", sender_type: "child", rendered_text: "Why do stars twinkle at night?", policy_bucket: "allowed", explanation_text: "Safe science question." },
      { id: "m2", sender_type: "assistant", rendered_text: "Stars twinkle because their light passes through moving air before it reaches our eyes.", policy_bucket: "allowed", explanation_text: "Age-shaped explanation." }
    ]
  },
  {
    id: "thread-2",
    child_profile_id: "vihaan",
    title: "How do rainbows form?",
    last_policy_bucket: "allowed",
    messages: []
  }
];

export const sampleReports: ReportSummary = {
  usage: { children: 3, threads: 8, child_messages: 24, assistant_messages: 24 },
  safety: {
    policy_buckets: { allowed: 22, allowed_with_adaptation: 2, block_and_redirect: 0, escalate: 0 },
    top_categories: { science: 8, animals: 5, feelings: 3 },
    open_alerts: 0,
    reviewed_alerts: 2,
    resolved_alerts: 1
  },
  oversight: [],
  report_types: ["usage", "safety", "alerts", "transcripts"]
};
