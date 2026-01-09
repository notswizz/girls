import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const REFERRAL_CODE_KEY = 'fapbank_referral_code';
const REFERRAL_COMPLETED_KEY = 'fapbank_referral_completed';

/**
 * ReferralTracker component - handles referral link detection and attribution
 * Place this in _app.js to track referrals across the entire app
 */
export default function ReferralTracker() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check for referral code in URL and store it
  useEffect(() => {
    const { ref } = router.query;
    
    if (ref && typeof ref === 'string' && ref.length === 8) {
      // Don't track if user is already logged in (can't be referred if already a user)
      if (session) {
        return;
      }

      // Store referral code in localStorage
      const existingCode = localStorage.getItem(REFERRAL_CODE_KEY);
      if (!existingCode) {
        localStorage.setItem(REFERRAL_CODE_KEY, ref.toUpperCase());
        
        // Track the click
        trackReferralClick(ref);
      }

      // Clean URL (remove ref param)
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, [router.query, session]);

  // Track referral click via API
  const trackReferralClick = async (code) => {
    try {
      await fetch('/api/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, source: document.referrer || 'direct' }),
      });
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  };

  // Complete referral when user signs up
  const completeReferral = useCallback(async () => {
    const referralCode = localStorage.getItem(REFERRAL_CODE_KEY);
    const alreadyCompleted = localStorage.getItem(REFERRAL_COMPLETED_KEY);

    if (!referralCode || alreadyCompleted) {
      return;
    }

    try {
      const res = await fetch('/api/referrals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode }),
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem(REFERRAL_COMPLETED_KEY, 'true');
        localStorage.removeItem(REFERRAL_CODE_KEY);
        
        // Optional: Show a toast notification about bonus tokens
        console.log(`🎉 Referral complete! You earned ${data.tokensEarned} tokens`);
      } else if (data.error === 'You have already been referred' || 
                 data.error === 'Referral already completed' ||
                 data.error === 'Cannot refer yourself') {
        // Clear the code if it can't be used
        localStorage.removeItem(REFERRAL_CODE_KEY);
      }
    } catch (error) {
      console.error('Error completing referral:', error);
    }
  }, []);

  // When user becomes authenticated, try to complete referral
  useEffect(() => {
    if (session && status === 'authenticated') {
      completeReferral();
    }
  }, [session, status, completeReferral]);

  // This component doesn't render anything
  return null;
}

