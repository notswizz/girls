import React from 'react';

/**
 * Component for displaying errors
 */
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
    <div className="card-neo border-cyber-pink border-2 p-6 max-w-lg w-full">
      <div className="flex items-center justify-center text-cyber-pink mb-4">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-bold text-xl mb-2 text-center">Error Detected</h3>
      <p className="text-white/70 text-center mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="btn-cyber w-full flex items-center justify-center"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorDisplay;
