import { apiRequest } from '../../../core/api/client';

export type ParentEmailRegisterResponse = {
  parent_user_id: string;
  email: string;
  account_status: string;
  next_step: string;
};

export type ParentConfirmEmailResponse = {
  login_status: string;
  access_token_optional: string | null;
  refresh_token_optional: string | null;
  two_factor_required: boolean;
  pin_enabled: boolean;
  next_step: string;
};

export type ParentProfileResponse = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  country: string;
  preferred_language: string;
  onboarding_status: string;
  pin_enabled: boolean;
};

export function registerParentEmail(email: string): Promise<ParentEmailRegisterResponse> {
  return apiRequest('/auth/parent/register', {
    email,
    acceptedTerms: true,
    acceptedPrivacyPolicy: true
  });
}

export function confirmParentEmail(email: string, code: string): Promise<ParentConfirmEmailResponse> {
  return apiRequest('/auth/parent/confirm-email', { email, code });
}

export function loginParent(email: string, password: string): Promise<ParentConfirmEmailResponse> {
  return apiRequest('/auth/parent/login', { email, password });
}

export function resendParentConfirmationCode(email: string): Promise<{ delivery_status: string; expires_in_seconds: number }> {
  return apiRequest('/auth/parent/resend-confirmation-code', { email });
}

export function setParentPassword(password: string, token: string): Promise<{ password_set: boolean }> {
  return apiRequest('/auth/parent/set-password', { password }, { token });
}

export function updateParentProfile(fullName: string, token: string): Promise<ParentProfileResponse> {
  return apiRequest('/parent/profile', {
    full_name: fullName,
    country: 'IN',
    preferred_language: 'en'
  }, { token, method: 'PATCH' });
}

export function completeParentOnboarding(token: string): Promise<{ onboarding_status: string }> {
  return apiRequest('/parent/me/onboarding', { onboardingComplete: true }, { token, method: 'PATCH' });
}

export function setupParentPin(pin: string, token: string): Promise<{ pin_enabled: boolean }> {
  return apiRequest('/parent/me/pin', { pin }, { token });
}

export function verifyParentPin(pin: string, token: string): Promise<{ verified: boolean }> {
  return apiRequest('/parent/pin/verify', { pin }, { token });
}
