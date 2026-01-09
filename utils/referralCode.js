/**
 * Generate a unique referral code
 * Format: 8 characters alphanumeric, easy to read and share
 */
export function generateReferralCode() {
  // Use characters that are easy to read (avoiding 0/O, 1/l/I confusion)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z0-9]{8}$/i.test(code);
}

/**
 * Tokens rewarded for a successful referral
 */
export const REFERRAL_REWARD_TOKENS = 50;

/**
 * Tokens given to new user who signed up via referral
 */
export const REFERRAL_BONUS_TOKENS = 25;

