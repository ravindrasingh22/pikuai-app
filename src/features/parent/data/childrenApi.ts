import { KidProfile } from '../../../app/state/types';
import { apiRequest } from '../../../core/api/client';

type ChildGender = 'girl' | 'boy' | 'not_disclosed';
type ChildAgeBand = '3-5' | '6-8' | '9-11' | '11-13' | '14-17';

export type ChildProfileResponse = {
  id: string;
  display_name: string;
  age_band: ChildAgeBand;
  daily_time_limit_minutes: number | null;
  avatar_key: string | null;
  gender: ChildGender;
  child_pin_enabled: boolean;
};

export type CreateChildPayload = {
  displayName: string;
  age: number;
  gender: KidProfile['gender'];
  pin: string;
  avatar: KidProfile['avatar'];
};

export async function listChildren(token: string): Promise<KidProfile[]> {
  const children = await apiRequest<ChildProfileResponse[]>('/children', undefined, { token });
  return children.map(toKidProfile);
}

export async function createChildProfile(payload: CreateChildPayload, token: string): Promise<KidProfile> {
  const child = await apiRequest<ChildProfileResponse>('/children', {
    display_name: payload.displayName,
    age_band: ageToBand(payload.age),
    daily_time_limit_minutes: 30,
    avatar_key: avatarToKey(payload.avatar),
    gender: genderToApi(payload.gender),
    voice_enabled: true
  }, { token });

  await apiRequest<{ child_profile_id: string; child_pin_enabled: boolean }>(`/children/${child.id}/pin/setup`, {
    pin: payload.pin
  }, { token });

  return { ...toKidProfile(child), pin: payload.pin };
}

export function verifyChildPin(childId: string, pin: string, token: string): Promise<{ verified: boolean; child_profile_id: string }> {
  return apiRequest(`/children/${childId}/pin/verify`, { pin }, { token });
}

function toKidProfile(child: ChildProfileResponse): KidProfile {
  return {
    id: child.id,
    name: child.display_name,
    age: bandToAge(child.age_band),
    gender: genderFromApi(child.gender),
    pin: '',
    avatar: keyToAvatar(child.avatar_key),
    streak: 0,
    dailyMinutes: 0,
    alerts: 0,
    topics: [],
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0]
  };
}

function ageToBand(age: number): ChildAgeBand {
  if (age <= 5) return '3-5';
  if (age <= 8) return '6-8';
  if (age <= 11) return '9-11';
  if (age <= 13) return '11-13';
  return '14-17';
}

function bandToAge(ageBand: ChildAgeBand): number {
  if (ageBand === '3-5') return 5;
  if (ageBand === '6-8') return 8;
  if (ageBand === '9-11') return 10;
  if (ageBand === '11-13') return 12;
  return 14;
}

function genderToApi(gender: KidProfile['gender']): ChildGender {
  if (gender === 'Girl') return 'girl';
  if (gender === 'Boy') return 'boy';
  return 'not_disclosed';
}

function genderFromApi(gender: ChildGender): KidProfile['gender'] {
  if (gender === 'girl') return 'Girl';
  if (gender === 'boy') return 'Boy';
  return 'Prefer not to say';
}

function avatarToKey(avatar: KidProfile['avatar']): string {
  if (avatar === 'maya') return 'maya';
  if (avatar === 'ravin') return 'ravin';
  return 'kid';
}

function keyToAvatar(avatarKey: string | null): KidProfile['avatar'] {
  if (avatarKey === 'maya') return 'maya';
  if (avatarKey === 'ravin') return 'ravin';
  return 'generated';
}
