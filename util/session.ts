// Session management - all cookie, localStorage, sessionStorage logic in one place
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const COOKIE_CONSENT_KEY = 'localCommandHistoryEnabled';
const USER_ID_COOKIE = 'azsh_session_id';
const PENDING_EMAIL_KEY = 'azsh_pending_email';
const PENDING_CHECK_KEY = 'azsh_pending_check';
const ASKED_SESSION_KEY = 'azsh_asked_session';

// Backend API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pesti.azsh.fi';

// --- Cookie helpers ---

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

// --- Cookie consent ---

export function hasCookieConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'TRUE';
}

export function enableCookies(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, 'TRUE');
}

// --- User ID ---

export function getUserId(): { userId: string; isNew: boolean } | null {
  if (!hasCookieConsent()) return null;

  let userId = getCookie(USER_ID_COOKIE);
  const isNew = !userId;

  if (!userId) {
    userId = uuidv4();
    setCookie(USER_ID_COOKIE, userId);
  }

  return { userId, isNew };
}

export function getExistingUserId(): string | null {
  if (!hasCookieConsent()) return null;
  return getCookie(USER_ID_COOKIE);
}

// --- Pending prompts (for Y/n confirmation flow) ---

export function setPendingEmail(email: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function getPendingEmail(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const email = localStorage.getItem(PENDING_EMAIL_KEY);
  localStorage.removeItem(PENDING_EMAIL_KEY);
  return email;
}

export function hasPendingEmail(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return !!localStorage.getItem(PENDING_EMAIL_KEY);
}

export function setPendingCheck(answer: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_CHECK_KEY, answer);
}

export function getPendingCheck(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const answer = sessionStorage.getItem(PENDING_CHECK_KEY);
  sessionStorage.removeItem(PENDING_CHECK_KEY);
  return answer;
}

export function hasPendingCheck(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return !!sessionStorage.getItem(PENDING_CHECK_KEY);
}

export function hasPendingPrompt(): boolean {
  return hasPendingEmail() || hasPendingCheck();
}

// --- Session tracking (to avoid re-asking within same session) ---

export function hasAskedThisSession(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(ASKED_SESSION_KEY) === 'true';
}

export function markAskedThisSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ASKED_SESSION_KEY, 'true');
}
