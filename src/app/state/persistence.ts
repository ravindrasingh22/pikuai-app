import { AppState } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pratvim_mobile_progress';

type PersistedState = Pick<AppState, 'auth' | 'parent' | 'kids' | 'activeKidId' | 'kidOnboardingCompleted' | 'chats'>;

export async function loadPersistedState(): Promise<Partial<AppState> | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      ...parsed,
      auth: {
        ...parsed.auth,
        parentUnlocked: false
      }
    };
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function persistState(state: AppState): Promise<void> {
  const persisted: PersistedState = {
    auth: {
      ...state.auth,
      parentUnlocked: false
    },
    parent: state.parent,
    kids: state.kids,
    activeKidId: state.activeKidId,
    kidOnboardingCompleted: state.kidOnboardingCompleted,
    chats: state.chats
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
