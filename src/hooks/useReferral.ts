import { useEffect } from 'react';

const REFERRAL_KEY = 'ref_code';

/** Captures ?ref=CODE from the URL and stores it in localStorage */
export function useReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.length >= 3) {
      localStorage.setItem(REFERRAL_KEY, ref);
    }
  }, []);
}

/** Returns the stored referral code (if any) */
export function getStoredReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_KEY);
}

/** Clears the stored referral code after linking */
export function clearStoredReferralCode() {
  localStorage.removeItem(REFERRAL_KEY);
}
