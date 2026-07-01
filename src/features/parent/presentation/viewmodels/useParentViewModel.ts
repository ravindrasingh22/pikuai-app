import { useCallback, useMemo, useState } from 'react';
import { Images } from '../../../../core/assets/assets';
import { useAppStore } from '../../../../app/state/AppStore';
import { KidProfile } from '../../../../app/state/types';
import { ApiRequestError } from '../../../../core/api/client';
import { createChildProfile, listChildren } from '../../data/childrenApi';

export function avatarForKid(avatar: KidProfile['avatar']) {
  if (avatar === 'maya') return Images.kidMaya;
  return Images.kidRavin;
}

export function useParentViewModel() {
  const { state, dispatch } = useAppStore();
  const [kidName, setKidName] = useState('Ravin');
  const [kidAge, setKidAge] = useState('9');
  const [kidGender, setKidGender] = useState<KidProfile['gender']>('Boy');
  const [kidPin, setKidPin] = useState('1234');
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [savingKid, setSavingKid] = useState(false);
  const [kidError, setKidError] = useState<string | null>(null);

  const activeKid = useMemo(() => state.kids.find((kid) => kid.id === state.activeKidId) ?? state.kids[0], [state.kids, state.activeKidId]);
  const totalAlerts = useMemo(() => state.kids.reduce((sum, kid) => sum + kid.alerts, 0), [state.kids]);
  const parentName = `${state.parent.firstName} ${state.parent.lastName}`.trim();

  function selectKid(id: string) {
    dispatch({ type: 'kid/select', payload: id });
  }

  const refreshChildren = useCallback(async () => {
    const token = state.auth.accessToken;
    if (!token) return false;

    setLoadingChildren(true);
    setKidError(null);
    try {
      const children = await listChildren(token);
      dispatch({ type: 'kids/replace', payload: children });
      return true;
    } catch (caught) {
      setKidError(errorMessage(caught, 'Unable to load child profiles.'));
      return false;
    } finally {
      setLoadingChildren(false);
    }
  }, [dispatch, state.auth.accessToken]);

  async function addKid() {
    const token = state.auth.accessToken;
    if (!token) {
      setKidError('Parent login is required before adding a child profile.');
      return false;
    }

    const cleanName = kidName.trim();
    const age = Number(kidAge);
    if (cleanName.length < 1) {
      setKidError('Enter a child nickname.');
      return false;
    }
    if (!Number.isFinite(age) || age < 3 || age > 17) {
      setKidError('Enter an age between 3 and 17.');
      return false;
    }
    if (!/^\d{4}$/.test(kidPin)) {
      setKidError('Enter a 4-digit child PIN.');
      return false;
    }

    setSavingKid(true);
    setKidError(null);
    try {
      const newKid = await createChildProfile({
        displayName: cleanName,
        age,
        gender: kidGender,
        pin: kidPin,
        avatar: state.kids.length % 2 === 0 ? 'ravin' : 'maya'
      }, token);
      dispatch({ type: 'kid/add', payload: newKid });
      await refreshChildren();
    } catch (caught) {
      setKidError(errorMessage(caught, 'Unable to add child profile.'));
      return false;
    } finally {
      setSavingKid(false);
    }

    setKidName('');
    setKidAge('');
    setKidGender('');
    setKidPin('');
    return true;
  }

  function errorMessage(caught: unknown, fallback: string) {
    if (caught instanceof ApiRequestError) return caught.message;
    if (caught instanceof Error) return caught.message;
    return fallback;
  }

  return {
    state,
    parentName,
    kids: state.kids,
    activeKid,
    totalAlerts,
    subscription: state.subscription,
    kidName,
    setKidName,
    kidAge,
    setKidAge,
    kidGender,
    setKidGender,
    kidPin,
    setKidPin,
    loadingChildren,
    savingKid,
    kidError,
    refreshChildren,
    addKid,
    selectKid,
    dispatch
  };
}
