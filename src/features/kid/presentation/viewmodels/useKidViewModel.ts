import { useMemo } from 'react';
import { useAppStore } from '../../../../app/state/AppStore';

export function useKidViewModel() {
  const { state, dispatch } = useAppStore();
  const activeKid = useMemo(() => state.kids.find((kid) => kid.id === state.activeKidId) ?? state.kids[0], [state.kids, state.activeKidId]);
  const kidChats = useMemo(() => state.chats.filter((chat) => chat.kidId === activeKid?.id), [state.chats, activeKid?.id]);
  const pinnedChats = kidChats.filter((chat) => chat.pinned);
  const recentChats = kidChats.filter((chat) => !chat.pinned);
  return { state, dispatch, activeKid, kidChats, pinnedChats, recentChats };
}
