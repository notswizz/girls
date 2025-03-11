// Constants used across the HeadToHead components
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of component render to avoid recreating it on each render
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Get the cost from environment variable or default to $1
export const REVEAL_COST = parseFloat(process.env.NEXT_PUBLIC_INSTAGRAM_REVEAL_COST || '1').toFixed(2);
export const REVEAL_COST_DISPLAY = `$${REVEAL_COST}`;
