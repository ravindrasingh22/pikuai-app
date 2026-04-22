import { api } from "./client";
import type { ChildProfile, Controls, DashboardOverview, ParentProfile, ReportSummary, TranscriptThread } from "../types/domain";

export type RegisterParentInput = {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  country: string;
  preferredLanguage: string;
};

export type LoginResult = {
  login_status: "authenticated" | "two_factor_required";
  access_token_optional: string | null;
  refresh_token_optional: string | null;
  two_factor_required: boolean;
  pin_enabled?: boolean;
  next_step: string;
};

export type BootstrapSnapshot = {
  profile: ParentProfile | null;
  children: ChildProfile[];
  overview: DashboardOverview | null;
  controls: Controls | null;
  transcripts: TranscriptThread[];
  reports: ReportSummary | null;
};

export async function loadBootstrap(): Promise<BootstrapSnapshot> {
  const [profile, children, overview, controls, transcripts, reports] = await Promise.allSettled([
    api.get<ParentProfile>("/parent/profile"),
    api.get<ChildProfile[]>("/children"),
    api.get<DashboardOverview>("/dashboard/overview"),
    api.get<Controls>("/controls"),
    api.get<TranscriptThread[]>("/transcripts"),
    api.get<ReportSummary>("/reports/summary")
  ]);

  return {
    profile: profile.status === "fulfilled" ? profile.value : null,
    children: children.status === "fulfilled" ? children.value : [],
    overview: overview.status === "fulfilled" ? overview.value : null,
    controls: controls.status === "fulfilled" ? controls.value : null,
    transcripts: transcripts.status === "fulfilled" ? transcripts.value : [],
    reports: reports.status === "fulfilled" ? reports.value : null
  };
}

export async function registerParent(input: RegisterParentInput): Promise<LoginResult | null> {
  await api.post("/auth/register-parent", {
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    mobile_number: input.mobile?.trim(),
    country: input.country.trim().toUpperCase(),
    preferred_language: input.preferredLanguage.trim().toLowerCase()
  });
  return null;
}

export async function loginParent(email: string, password: string): Promise<LoginResult> {
  const result = await api.post<LoginResult>("/auth/login", {
    email: email.trim().toLowerCase(),
    password
  });
  if (result.access_token_optional) {
    api.setAuthToken(result.access_token_optional);
  }
  return result;
}

export function setupParentPin(pin: string): Promise<{ pin_enabled: boolean }> {
  return api.post("/parent/pin/setup", { pin });
}

export function verifyParentPin(pin: string): Promise<{ verified: boolean }> {
  return api.post("/parent/pin/verify", { pin });
}

export function createChildProfile(input: {
  displayName: string;
  ageBand: string;
  dailyTimeLimitMinutes: number;
}): Promise<ChildProfile> {
  return api.post("/children", {
    display_name: input.displayName.trim(),
    age_band: input.ageBand,
    daily_time_limit_minutes: input.dailyTimeLimitMinutes
  });
}

export function updateControls(input: Partial<Controls>): Promise<Controls> {
  return api.patch("/controls", input);
}

export function updateChildVoice(childId: string, voiceEnabled: boolean): Promise<ChildProfile> {
  return api.patch(`/children/${childId}`, { voice_enabled: voiceEnabled });
}

export function setupChildPin(childId: string, pin: string): Promise<{ child_profile_id: string; child_pin_enabled: boolean }> {
  return api.post(`/children/${childId}/pin/setup`, { pin });
}

export function verifyChildPin(childId: string, pin: string): Promise<{ verified: boolean; child_profile_id: string }> {
  return api.post(`/children/${childId}/pin/verify`, { pin });
}

export async function sendChildMessage(input: {
  childProfileId: string;
  threadId?: string;
  message: string;
  answerMode?: string;
}): Promise<{
  thread_id: string;
  message_id: string;
  answer_text: string;
  policy_bucket: string;
  explanation_summary: string;
  alert_created: boolean;
  child_safe_status: string;
}> {
  return api.post("/chat/message", {
    child_profile_id: input.childProfileId,
    thread_id_optional: input.threadId,
    message: input.message,
    answer_mode_optional: input.answerMode ?? "short_answer",
    language_optional: "en"
  });
}
