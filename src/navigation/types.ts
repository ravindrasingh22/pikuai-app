import type { ChildProfile, VoiceExchange } from "../types/domain";

export type AppRoute =
  | "welcome"
  | "login"
  | "register"
  | "parentPinSetup"
  | "familyControls"
  | "dashboard"
  | "children"
  | "addChild"
  | "childPicker"
  | "childPin"
  | "childChat"
  | "voiceChat"
  | "safety"
  | "reports"
  | "transcripts"
  | "settings"
  | "parentPinGate";

export type Navigate = (route: AppRoute, params?: NavigationParams) => void;

export type NavigationParams = {
  child?: ChildProfile;
  protectedRoute?: AppRoute;
  resetHistory?: boolean;
  voiceExchange?: VoiceExchange;
  voiceExchanges?: VoiceExchange[];
  voiceThread?: {
    localThreadId: string;
    threadId?: string;
  };
};
