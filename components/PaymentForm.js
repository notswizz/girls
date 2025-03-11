import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function PaymentForm({ clientSecret, onSuccess, onError, amount = '$1.00' }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentMethodsAvailable, setPaymentMethodsAvailable] = useState({
    applePay: false,
    cashApp: false
  });

  // Check for available payment methods
  useEffect(() => {
    if (!stripe || !elements) return;
    
    const checkPaymentMethods = async () => {
      try {
        // Check if Apple Pay is available on this device
        if (window.ApplePaySession && stripe.applePay) {
          const canUseApplePay = await stripe.applePay.checkAvailability();
          setPaymentMethodsAvailable(prev => ({
            ...prev,
            applePay: canUseApplePay
          }));
          console.log('Apple Pay available:', canUseApplePay);
        }
      } catch (err) {
        console.error('Error checking Apple Pay availability:', err);
      }
    };
    
    checkPaymentMethods();
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-completion`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setMessage(error.message || 'An error occurred during payment');
        onError?.(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        setMessage('Payment successful!');
        onSuccess?.(paymentIntent);
      } else {
        console.log('Unexpected payment state:', paymentIntent);
        setMessage('Unexpected payment state.');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setMessage('An error occurred while processing your payment');
      onError?.(err);
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-3">
      <div className="mb-2">
        <PaymentElement 
          id="payment-element" 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: 'Instagram Reveal',
              }
            },
            paymentMethodOrder: ['card', 'cashapp'],
            // Show all available payment methods in their own tab
            paymentMethodTypes: {
              card: {
                // Always show card as an option
                enabled: true
              },
              cashapp: {
                // Show Cash App if available
                enabled: true
              }
            }
          }}
        />
      </div>
      
      <div className="py-1 text-center text-xs text-white/50">
        Secure payment processing by Stripe
      </div>
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple w-full py-2 flex items-center justify-center disabled:opacity-70 text-sm"
      >
        {isLoading ? (
          <div className="spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          `Pay ${amount}`
        )}
      </button>
      
      {message && <div className="text-xs text-white/80 mt-1">{message}</div>}
    </form>
  );
} 