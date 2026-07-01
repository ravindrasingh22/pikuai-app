import { AppState, ChatMessage, ChatThread, KidProfile } from './types';
import { initialState } from './seedData';

export type AppAction =
  | { type: 'state/hydrate'; payload: Partial<AppState> }
  | { type: 'state/reset' }
  | { type: 'parent/update'; payload: Partial<AppState['parent']> }
  | { type: 'auth/update'; payload: Partial<AppState['auth']> }
  | { type: 'kid/add'; payload: KidProfile }
  | { type: 'kids/replace'; payload: KidProfile[] }
  | { type: 'kid/select'; payload: string }
  | { type: 'kid/update'; payload: { id: string; patch: Partial<KidProfile> } }
  | { type: 'kid/onboardingComplete'; payload: string }
  | { type: 'chat/send'; payload: { chatId: string; message: ChatMessage } }
  | { type: 'chat/backendReply'; payload: { chatId: string; backendThreadId: string; childMessage: ChatMessage; assistantMessage: ChatMessage; title?: string; policyBucket?: string } }
  | { type: 'chat/completeBackendReply'; payload: { chatId: string; pendingAssistantId: string; backendThreadId: string; assistantMessage: ChatMessage; title?: string; policyBucket?: string } }
  | { type: 'chat/failBackendReply'; payload: { chatId: string; pendingAssistantId: string; errorMessage: string } }
  | { type: 'chat/create'; payload: { id: string; kidId: string } }
  | { type: 'chat/replaceForKid'; payload: { kidId: string; chats: ChatThread[] } }
  | { type: 'chat/upsert'; payload: ChatThread }
  | { type: 'chat/togglePin'; payload: string }
  | { type: 'subscription/select'; payload: AppState['subscription']['planId'] }
  | { type: 'avatar/select'; payload: AppState['selectedAvatar'] };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'state/hydrate':
      return {
        ...state,
        ...action.payload,
        parent: { ...state.parent, ...action.payload.parent },
        auth: { ...state.auth, ...action.payload.auth, parentUnlocked: false }
      };
    case 'state/reset':
      return initialState;
    case 'parent/update':
      return { ...state, parent: { ...state.parent, ...action.payload } };
    case 'auth/update':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'kid/add':
      return { ...state, kids: [...state.kids, action.payload], activeKidId: action.payload.id };
    case 'kids/replace':
      return {
        ...state,
        kids: action.payload,
        activeKidId: action.payload.some((kid) => kid.id === state.activeKidId) ? state.activeKidId : action.payload[0]?.id ?? ''
      };
    case 'kid/select':
      return { ...state, activeKidId: action.payload };
    case 'kid/update':
      return { ...state, kids: state.kids.map((kid) => kid.id === action.payload.id ? { ...kid, ...action.payload.patch } : kid) };
    case 'kid/onboardingComplete':
      return { ...state, kidOnboardingCompleted: { ...state.kidOnboardingCompleted, [action.payload]: true } };
    case 'chat/send':
      return { ...state, chats: state.chats.map((chat) => chat.id === action.payload.chatId ? { ...chat, messages: [...chat.messages, action.payload.message], preview: action.payload.message.text } : chat) };
    case 'chat/backendReply':
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat.id !== action.payload.chatId) return chat;
          const nextMessages = [...chat.messages, action.payload.childMessage, action.payload.assistantMessage];
          return {
            ...chat,
            backendThreadId: action.payload.backendThreadId,
            title: chat.title === 'New question' ? action.payload.title ?? action.payload.childMessage.text : chat.title,
            preview: action.payload.assistantMessage.text,
            tag: action.payload.policyBucket === 'allowed' ? chat.tag : 'Safety',
            date: 'Today',
            messages: nextMessages
          };
        })
      };
    case 'chat/completeBackendReply':
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat.id !== action.payload.chatId) return chat;
          const nextMessages = chat.messages.map((message) => message.id === action.payload.pendingAssistantId ? action.payload.assistantMessage : message);
          return {
            ...chat,
            backendThreadId: action.payload.backendThreadId,
            title: chat.title === 'New question' ? action.payload.title ?? chat.messages.find((message) => message.role === 'kid')?.text ?? chat.title : chat.title,
            preview: action.payload.assistantMessage.text,
            tag: action.payload.policyBucket === 'allowed' ? chat.tag : 'Safety',
            date: 'Today',
            messages: nextMessages
          };
        })
      };
    case 'chat/failBackendReply':
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat.id !== action.payload.chatId) return chat;
          const nextMessages = chat.messages.map((message) => message.id === action.payload.pendingAssistantId ? { ...message, text: action.payload.errorMessage } : message);
          return { ...chat, preview: action.payload.errorMessage, messages: nextMessages };
        })
      };
    case 'chat/create': {
      if (state.chats.some((chat) => chat.id === action.payload.id)) return state;
      return { ...state, chats: [{ id: action.payload.id, kidId: action.payload.kidId, title: 'New question', preview: 'Start a protected conversation', tag: 'New', date: 'Today', pinned: false, paused: false, messages: [] }, ...state.chats] };
    }
    case 'chat/replaceForKid': {
      const pinnedById = new Map<string, boolean>();
      state.chats.forEach((chat) => {
        pinnedById.set(chat.id, chat.pinned);
        if (chat.backendThreadId) pinnedById.set(chat.backendThreadId, chat.pinned);
      });
      const incoming = action.payload.chats.map((chat) => ({ ...chat, pinned: pinnedById.get(chat.id) ?? pinnedById.get(chat.backendThreadId ?? '') ?? chat.pinned }));
      const localDrafts = state.chats.filter((chat) => chat.kidId === action.payload.kidId && !chat.backendThreadId && chat.messages.length === 0);
      const otherChats = state.chats.filter((chat) => chat.kidId !== action.payload.kidId);
      return { ...state, chats: [...localDrafts, ...incoming, ...otherChats] };
    }
    case 'chat/upsert': {
      const existing = state.chats.find((chat) => chat.id === action.payload.id || (action.payload.backendThreadId && chat.backendThreadId === action.payload.backendThreadId));
      const nextChat = existing ? { ...action.payload, pinned: existing.pinned || action.payload.pinned } : action.payload;
      return {
        ...state,
        chats: existing
          ? state.chats.map((chat) => (chat.id === existing.id ? nextChat : chat))
          : [nextChat, ...state.chats]
      };
    }
    case 'chat/togglePin':
      return { ...state, chats: state.chats.map((chat) => chat.id === action.payload ? { ...chat, pinned: !chat.pinned } : chat) };
    case 'subscription/select':
      return { ...state, subscription: { ...state.subscription, planId: action.payload, status: 'Active', validUntil: action.payload === 'annual' ? '30 Jun 2027' : action.payload === 'quarterly' ? '30 Sep 2026' : '30 Jul 2026', daysLeft: action.payload === 'annual' ? 365 : action.payload === 'quarterly' ? 90 : 30 } };
    case 'avatar/select':
      return { ...state, selectedAvatar: action.payload };
    default:
      return state;
  }
}
