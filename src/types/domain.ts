export type AgeBand = "3-5" | "6-8" | "9-11" | "11-13" | "14-17";
export type ChildGender = "girl" | "boy" | "not_disclosed";

export type ParentProfile = {
  id: string;
  full_name: string;
  email: string;
  preferred_language: string;
  pin_enabled?: boolean;
  two_factor_enabled?: boolean;
};

export type ChildProfile = {
  id: string;
  display_name: string;
  age_band: AgeBand;
  daily_time_limit_minutes?: number;
  topic_restrictions_json?: string[];
  voice_enabled?: boolean;
  avatar_key?: string;
  gender?: ChildGender;
  child_pin_enabled?: boolean;
  active_status?: string;
};

export type Controls = {
  transcript_visibility_enabled: boolean;
  content_strictness_level: "low" | "balanced" | "strict";
  session_limit_enabled?: boolean;
  default_session_limit_minutes?: number;
  sensitive_topic_alerts_enabled: boolean;
  weekly_summary_enabled?: boolean;
  optional_personalization_enabled?: boolean;
  retention_policy_code?: string;
};

export type DashboardOverview = {
  child_count: number;
  current_plan: string;
  weekly_sessions: number;
  pending_alerts: number;
  recent_activity?: Array<{
    id: string;
    title: string;
    last_policy_bucket: string;
    updated_at: string;
  }>;
};

export type TranscriptThread = {
  id: string;
  child_profile_id?: string;
  title: string;
  status?: string;
  last_policy_bucket: string;
  created_at?: string;
  updated_at?: string;
  messages: Array<{
    id: string;
    sender_type: string;
    rendered_text: string;
    policy_bucket: string;
    explanation_text: string;
    created_at?: string;
    input_mode?: "text" | "voice" | null;
  }>;
};

export type ReportSummary = {
  usage: Record<string, number>;
  safety: {
    policy_buckets: Record<string, number>;
    top_categories: Record<string, number>;
    open_alerts: number;
    reviewed_alerts: number;
    resolved_alerts: number;
  };
  oversight: Array<{
    message_id: string;
    thread_id: string;
    highlight: string;
    policy_bucket: string;
    explanation: string;
    created_at: string;
  }>;
  report_types: string[];
};

export type ChatMessage = {
  id: string;
  role: "child" | "assistant";
  text: string;
  time: string;
  isVoice?: boolean;
  policyBucket?: string;
};

export type VoiceExchange = {
  id: string;
  answerText: string;
  childText: string;
  policyBucket?: string;
  sourceLocalThreadId?: string;
  threadId?: string;
};
