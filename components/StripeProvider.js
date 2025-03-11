import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

// Load Stripe outside of component render to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeProvider({ children }) {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe is loaded
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log('Stripe publishable key exists');
      setStripeLoaded(true);
    } else {
      console.error('Stripe publishable key is missing');
    }
  }, []);

  if (!stripeLoaded) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
} 