import React from 'react';
import { FaTimes, FaInstagram, FaCreditCard, FaGoogle } from 'react-icons/fa';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../PaymentForm';
import { stripePromise } from '../utils/constants';

/**
 * Modal for revealing Instagram handle of a model
 */
const InstagramRevealModal = ({ 
  modalState, 
  onClose, 
  onSuccess, 
  onError, 
  onRevealRequest 
}) => {
  const { 
    open, 
    modelUsername, 
    instagram, 
    paid, 
    clientSecret, 
    loading, 
    error, 
    amount 
  } = modalState;
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="relative bg-cyber-dark border-2 border-cyber-blue/50 rounded-lg w-full max-w-md p-4 shadow-xl max-h-[90vh] overflow-y-auto my-8">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white bg-cyber-dark/80 rounded-full z-10"
        >
          <FaTimes />
        </button>
        
        <div className="text-center mb-4">
          <div className="h-12 w-12 mx-auto bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center mb-2">
            <FaInstagram className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Instagram Reveal</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-cyber-blue border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-white">Initializing payment...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple px-6 py-2"
            >
              Close
            </button>
          </div>
        ) : paid ? (
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-pink-500/40 rounded-lg p-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="mb-3 text-white text-sm">
                  Check out <span className="font-bold text-cyber-success">@{modelUsername}</span> on Instagram!
                </div>
                
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-0.5 rounded-lg w-full mb-4">
                  <div className="bg-cyber-dark-lighter p-3 rounded-md flex items-center justify-center">
                    <FaInstagram className="text-pink-500 text-xl mr-2" />
                    <span className="font-bold text-xl text-white break-all">@{instagram}</span>
                  </div>
                </div>
                
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cyber bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 flex items-center justify-center w-full mb-2"
                >
                  <FaInstagram className="mr-2" />
                  Visit Instagram Profile
                </a>
                
                <div className="text-xs text-white/60 mt-2">
                  You can now follow and connect with this model on Instagram.
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple px-6 py-2"
            >
              Close
            </button>
          </div>
        ) : clientSecret ? (
          <div>
            <div className="mb-3">
              <p className="text-white mb-3 text-sm">
                Unlock <span className="font-bold text-cyber-pink">@{modelUsername}'s</span> Instagram handle for a one-time fee.
              </p>
              <div className="bg-cyber-dark/50 border border-white/10 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/80 text-sm">Reveal fee:</span>
                  <span className="text-cyber-pink font-bold">{amount}</span>
                </div>
                <div className="text-xs text-white/60">
                  One-time payment to reveal this model's Instagram.
                </div>
              </div>
            </div>
          
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
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
                }
              }}
            >
              <PaymentForm 
                clientSecret={clientSecret} 
                onSuccess={onSuccess}
                onError={onError}
                amount={amount}
              />
            </Elements>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-white mb-3 text-sm">
              Unlock <span className="font-bold text-cyber-pink">@{modelUsername}'s</span> Instagram handle for a one-time fee.
            </p>
            <div className="bg-cyber-dark/50 border border-white/10 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/80 text-sm">Reveal fee:</span>
                <span className="text-cyber-pink font-bold">{amount}</span>
              </div>
              <div className="text-xs text-white/60">
                One-time payment to reveal this model's Instagram.
              </div>
            </div>
            <button
              onClick={onRevealRequest}
              className="btn-cyber bg-gradient-to-r from-cyber-blue to-cyber-purple w-full py-2 flex items-center justify-center text-sm"
            >
              <FaCreditCard className="mr-2" />
              Pay {amount} to Reveal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramRevealModal;
