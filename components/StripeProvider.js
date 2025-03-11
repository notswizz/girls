import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

// Load Stripe outside of component render to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Default appearance for Stripe Elements
const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#4CC9F0',
    colorBackground: '#0F1223',
    colorText: '#FFFFFF',
    colorDanger: '#FF0080',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px'
  }
};

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

  // Basic options that won't conflict with specific Element instances
  const elementsOptions = {
    appearance,
    loader: 'auto'
  };

  if (!stripeLoaded) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
} 