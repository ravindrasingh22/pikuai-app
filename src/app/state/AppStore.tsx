import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState } from './types';
import { initialState } from './seedData';
import { AppAction, appReducer } from './appReducer';
import { loadPersistedState, persistState } from './persistence';

type StoreValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  hydrated: boolean;
};

const StoreContext = createContext<StoreValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadPersistedState()
      .then((persisted) => {
        if (!cancelled && persisted) dispatch({ type: 'state/hydrate', payload: persisted });
      })
      .finally(() => {
        if (!cancelled) {
          didHydrate.current = true;
          setHydrated(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!didHydrate.current) return;
    persistState(state).catch(() => undefined);
  }, [state.auth, state.parent, state.kids, state.activeKidId, state.kidOnboardingCompleted, state.chats]);

  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider');
  return context;
}
