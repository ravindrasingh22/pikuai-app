import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../../../app/state/AppStore';
import { ChatMessage, ChatThread } from '../../../../app/state/types';
import { ApiRequestError } from '../../../../core/api/client';
import { ChatMessageResponse, ChatThreadResponse, getChatThread, listChatThreads, sendChatMessage } from '../../data/chatApi';

export function useChatViewModel(chatId?: string, options: { autoLoadThreads?: boolean } = {}) {
  const { state, dispatch } = useAppStore();
  const activeKid = state.kids.find((kid) => kid.id === state.activeKidId) ?? state.kids[0];
  const childChats = useMemo(() => state.chats.filter((chat) => chat.kidId === activeKid?.id), [activeKid?.id, state.chats]);
  const currentChat = useMemo(() => {
    const byId = chatId ? childChats.find((chat) => chat.id === chatId || chat.backendThreadId === chatId) : undefined;
    return byId ?? childChats[0];
  }, [chatId, childChats]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = state.auth.accessToken;
  const autoLoadThreads = options.autoLoadThreads ?? true;

  const loadThreads = useCallback(async () => {
    if (!activeKid?.id || !token) return;
    setLoadingThreads(true);
    setError(null);
    try {
      const threads = await listChatThreads(activeKid.id, token);
      dispatch({ type: 'chat/replaceForKid', payload: { kidId: activeKid.id, chats: threads.map((thread) => toChatThread(thread)) } });
    } catch (caught) {
      if (caught instanceof ApiRequestError) setError(caught.message);
      else if (caught instanceof Error) setError(caught.message);
      else setError('Unable to load chat history.');
    } finally {
      setLoadingThreads(false);
    }
  }, [activeKid?.id, dispatch, token]);

  const loadThread = useCallback(async (threadId: string) => {
    if (!token) return;
    setError(null);
    try {
      const detail = await getChatThread(threadId, token);
      dispatch({ type: 'chat/upsert', payload: toChatThread(detail.thread, detail.messages) });
    } catch (caught) {
      if (caught instanceof ApiRequestError) setError(caught.message);
      else if (caught instanceof Error) setError(caught.message);
      else setError('Unable to load this chat.');
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (!autoLoadThreads) return;
    loadThreads().catch(() => undefined);
  }, [autoLoadThreads, loadThreads]);

  useEffect(() => {
    const selected = chatId ? childChats.find((chat) => chat.id === chatId || chat.backendThreadId === chatId) : currentChat;
    const backendThreadId = selected?.backendThreadId ?? (chatId && !chatId.startsWith('chat-') ? chatId : undefined);
    if (backendThreadId && (!selected || selected.messages.length === 0)) {
      loadThread(backendThreadId).catch(() => undefined);
    }
  }, [chatId, childChats, currentChat, loadThread]);

  function startNewChat() {
    const id = `chat-${Date.now()}`;
    if (activeKid?.id) dispatch({ type: 'chat/create', payload: { id, kidId: activeKid.id } });
    return id;
  }

  async function send() {
    const clean = draft.trim();
    if (!clean || !activeKid?.id) return;
    if (!token) {
      setError('Parent login is required before chat can start.');
      return;
    }
    const chat = currentChat ?? {
      id: startNewChat(),
      kidId: activeKid.id,
      title: 'New question',
      preview: 'Start a protected conversation',
      tag: 'New',
      date: 'Today',
      pinned: false,
      paused: false,
      messages: []
    };

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMessageId = `kid-${Date.now()}`;
    const pendingAssistantId = `assistant-pending-${Date.now()}`;
    const childMessage: ChatMessage = { id: localMessageId, role: 'kid', text: clean, time };
    const pendingAssistantMessage: ChatMessage = { id: pendingAssistantId, role: 'ai', text: 'Thinking...', time: '' };
    setSending(true);
    setError(null);
    setDraft('');
    dispatch({ type: 'chat/send', payload: { chatId: chat.id, message: childMessage } });
    dispatch({ type: 'chat/send', payload: { chatId: chat.id, message: pendingAssistantMessage } });
    try {
      const response = await sendChatMessage({
        childProfileId: activeKid.id,
        message: clean,
        threadId: chat.backendThreadId,
        inputMode: 'text',
        language: 'en'
      }, token);
      const assistantMessage: ChatMessage = { id: `assistant-${response.thread_id}-${Date.now()}`, role: 'ai', text: response.answer_text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      dispatch({
        type: 'chat/completeBackendReply',
        payload: {
          chatId: chat.id,
          pendingAssistantId,
          backendThreadId: response.thread_id,
          assistantMessage,
          title: clean.slice(0, 54),
          policyBucket: response.policy_bucket
        }
      });
    } catch (caught) {
      const message = caught instanceof ApiRequestError || caught instanceof Error ? caught.message : 'Unable to send message.';
      setError(message);
      dispatch({ type: 'chat/failBackendReply', payload: { chatId: chat.id, pendingAssistantId, errorMessage: 'I could not get an answer just now. Please try again.' } });
    } finally {
      setSending(false);
    }
  }

  return { state, dispatch, activeKid, childChats, currentChat, draft, setDraft, sending, loadingThreads, error, send, loadThreads, startNewChat };
}

function toChatThread(thread: ChatThreadResponse, messages: ChatMessageResponse[] = []): ChatThread {
  const mappedMessages = messages.map((message) => ({
    id: message.id,
    role: message.sender_type === 'assistant' ? 'ai' as const : 'kid' as const,
    text: message.rendered_text,
    time: formatTime(message.created_at)
  }));
  const lastMessage = mappedMessages[mappedMessages.length - 1];
  return {
    id: thread.id,
    backendThreadId: thread.id,
    kidId: thread.child_profile_id,
    title: thread.title || 'Learning Chat',
    preview: lastMessage?.text ?? (thread.status === 'active' ? 'Continue this conversation' : 'Chat history'),
    tag: thread.last_policy_bucket === 'allowed' || !thread.last_policy_bucket ? 'Learning' : 'Safety',
    date: formatDate(thread.updated_at || thread.created_at),
    pinned: false,
    paused: thread.status !== 'active',
    messages: mappedMessages
  };
}

function formatTime(value?: string | null) {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return extractClockTime(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value?: string | null) {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseApiDate(value?: string | null) {
  if (!value) return new Date(Number.NaN);
  const normalized = value.trim().replace(' ', 'T');
  const direct = new Date(normalized);
  if (!Number.isNaN(direct.getTime())) return direct;

  const withoutFraction = normalized.replace(/\.\d+/, '');
  const fallback = new Date(withoutFraction);
  return fallback;
}

function extractClockTime(value?: string | null) {
  const match = value?.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = match[2];
  if (!Number.isFinite(hour)) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}
