import { useCallback, useMemo, useState } from 'react';
import { useAppStore } from '../../../../app/state/AppStore';
import { ApiRequestError } from '../../../../core/api/client';
import { confirmParentEmail, registerParentEmail, resendParentConfirmationCode, setParentPassword, updateParentProfile, verifyParentPin } from '../../data/parentAuthApi';
import { listChildren, verifyChildPin } from '../../../parent/data/childrenApi';

export function useAuthViewModel() {
  const { state, dispatch } = useAppStore();
  const [email, setEmail] = useState(state.parent.email);
  const [firstName, setFirstName] = useState(state.parent.firstName);
  const [lastName, setLastName] = useState(state.parent.lastName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'kid' | 'parent'>('kid');
  const [loading, setLoading] = useState(false);
  const [loadingKids, setLoadingKids] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmitDetails = useMemo(() => firstName.trim().length > 1 && lastName.trim().length > 1 && password.length >= 8 && password === confirmPassword, [firstName, lastName, password, confirmPassword]);
  const maskedEmail = useMemo(() => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    return `${local.slice(0, 2)}${'*'.repeat(Math.min(Math.max(local.length - 2, 2), 4))}@${domain}`;
  }, [email]);

  function saveParentDetails() {
    dispatch({ type: 'parent/update', payload: { email, firstName, lastName } });
  }

  function errorMessage(caught: unknown, fallback: string) {
    if (caught instanceof ApiRequestError) return caught.message;
    if (caught instanceof Error) return caught.message;
    return fallback;
  }

  async function submitParentEmailRegistration() {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await registerParentEmail(normalizedEmail);
      dispatch({ type: 'parent/update', payload: { email: response.email } });
      dispatch({ type: 'auth/update', payload: { parentUserId: response.parent_user_id, nextStep: response.next_step } });
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to start parent registration.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function submitEmailConfirmation(code: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await confirmParentEmail(email.trim().toLowerCase(), code.trim());
      dispatch({
        type: 'auth/update',
        payload: {
          accessToken: response.access_token_optional ?? undefined,
          refreshToken: response.refresh_token_optional ?? undefined,
          nextStep: response.next_step
        }
      });
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to confirm email.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmationCode() {
    setLoading(true);
    setError(null);
    try {
      await resendParentConfirmationCode(email.trim().toLowerCase());
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to resend confirmation code.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function submitParentDetails() {
    const token = state.auth.accessToken;
    if (!token) {
      setError('Confirm your email before continuing.');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateParentProfile(fullName, token);
      await setParentPassword(password, token);
      dispatch({ type: 'parent/update', payload: { email, firstName, lastName } });
      dispatch({ type: 'auth/update', payload: { nextStep: 'parent_onboarding' } });
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to save parent details.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function submitParentPin() {
    if (!/^\d{4}$/.test(pin)) {
      setError('Enter your 4-digit parent PIN.');
      return false;
    }

    const token = state.auth.accessToken;
    if (!token) {
      setError('Use parent email login first, then unlock parent mode with your PIN.');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyParentPin(pin, token);
      dispatch({ type: 'auth/update', payload: { parentUnlocked: true, nextStep: 'dashboard' } });
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Invalid parent PIN.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  const refreshKidProfiles = useCallback(async () => {
    const token = state.auth.accessToken;
    if (!token) {
      setError('Parent login is required before a child can start learning.');
      return false;
    }

    setLoadingKids(true);
    setError(null);
    try {
      const children = await listChildren(token);
      dispatch({ type: 'kids/replace', payload: children });
      return true;
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to load child profiles.'));
      return false;
    } finally {
      setLoadingKids(false);
    }
  }, [dispatch, state.auth.accessToken]);

  async function submitKidPin(childId?: string) {
    if (!childId) {
      setError('Choose who is learning today.');
      return null;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('Enter the 4-digit child PIN.');
      return null;
    }

    const token = state.auth.accessToken;
    if (!token) {
      setError('Parent login is required before a child can start learning.');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await verifyChildPin(childId, pin, token);
      const verifiedChildId = response.child_profile_id || childId;
      dispatch({ type: 'kid/select', payload: verifiedChildId });
      return verifiedChildId;
    } catch (caught) {
      setError(errorMessage(caught, 'Invalid child PIN.'));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    state,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    pin,
    setPin,
    mode,
    setMode,
    loading,
    loadingKids,
    error,
    setError,
    canSubmitDetails,
    maskedEmail,
    saveParentDetails,
    submitParentEmailRegistration,
    submitEmailConfirmation,
    resendConfirmationCode,
    submitParentDetails,
    submitParentPin,
    refreshKidProfiles,
    submitKidPin
  };
}
