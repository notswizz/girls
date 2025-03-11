import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaCheck, FaArrowLeft } from 'react-icons/fa';

export default function PaymentCompletion() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState('processing');
  const [paymentIntent, setPaymentIntent] = useState(null);
  
  useEffect(() => {
    // Check the payment status from the URL parameters
    const { payment_intent, payment_intent_client_secret, redirect_status } = router.query;
    
    if (redirect_status === 'succeeded') {
      setStatus('success');
      
      // You would typically verify this on the server side as well
      if (payment_intent) {
        setPaymentIntent(payment_intent);
        
        // Here you would normally update user permissions in your database
        // to grant access to the Instagram handle for this model
      }
    } else if (redirect_status === 'failed') {
      setStatus('failed');
    }
  }, [router.query]);
  
  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-cyber-dark-lighter border border-cyber-blue/30 rounded-lg p-6 shadow-lg">
        <div className="text-center mb-6">
          {status === 'success' ? (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <FaCheck className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-white/70">
                Thank you for your payment. You now have access to view this model's Instagram.
              </p>
            </>
          ) : status === 'failed' ? (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
                <span className="h-8 w-8 text-red-500">✕</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-white/70">
                There was an issue processing your payment. Please try again.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-white/70">
                Please wait while we process your payment...
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-center mt-6">
          <Link href="/">
            <a className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyber-purple hover:bg-cyber-blue">
              <FaArrowLeft className="mr-2" />
              Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
} 