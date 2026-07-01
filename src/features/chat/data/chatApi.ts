import { apiRequest } from '../../../core/api/client';

export type ChatThreadResponse = {
  id: string;
  child_profile_id: string;
  title: string | null;
  status: string;
  last_policy_bucket: string | null;
  last_alert_id_optional: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessageResponse = {
  id: string;
  sender_type: string;
  rendered_text: string;
  policy_bucket: string | null;
  explanation_text: string | null;
  safety_category: string | null;
  created_at: string;
};

export type ChatThreadDetailResponse = {
  thread: ChatThreadResponse;
  messages: ChatMessageResponse[];
};

export type SendChatMessageResponse = {
  thread_id: string;
  message_id: string;
  answer_text: string;
  ai_model_used: string;
  llm_provider: string;
  llm_used_fallback: boolean;
  policy_bucket: string;
  explanation_summary: string;
  alert_created: boolean;
  child_safe_status: string;
};

export function sendChatMessage(
  payload: {
    childProfileId: string;
    message: string;
    threadId?: string;
    answerMode?: string;
    inputMode?: 'text' | 'voice';
    language?: string;
  },
  token: string
): Promise<SendChatMessageResponse> {
  return apiRequest('/chat/message', {
    child_profile_id: payload.childProfileId,
    thread_id_optional: payload.threadId,
    message: payload.message,
    answer_mode_optional: payload.answerMode,
    input_mode_optional: payload.inputMode ?? 'text',
    language_optional: payload.language ?? 'en'
  }, { token });
}

export function listChatThreads(childProfileId: string, token: string): Promise<ChatThreadResponse[]> {
  return apiRequest(`/chat/threads?child_profile_id=${encodeURIComponent(childProfileId)}`, undefined, { token });
}

export function getChatThread(threadId: string, token: string): Promise<ChatThreadDetailResponse> {
  return apiRequest(`/chat/threads/${encodeURIComponent(threadId)}`, undefined, { token });
}
