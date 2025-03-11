// API utility functions for HeadToHead comparison

/**
 * Check if anonymous user has remaining access
 */
export const checkAnonymousAccess = async () => {
  try {
    const response = await fetch('/api/auth/check-anonymous');
    if (!response.ok) {
      throw new Error('Failed to check access');
    }
    
    const data = await response.json();
    
    return {
      allowed: data.allowed,
      remaining: data.remaining,
      authenticated: data.authenticated
    };
  } catch (error) {
    console.error('Error checking anonymous access:', error);
    return { allowed: true, remaining: 3, authenticated: false }; // Default to allowed in case of error
  }
};

/**
 * Fetch images for comparison
 */
export const fetchComparisonImages = async () => {
  const response = await fetch('/api/images/compare?count=2');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch images');
  }
  
  const data = await response.json();
  
  if (!data.success || !data.images || data.images.length < 2) {
    throw new Error('Not enough images for comparison');
  }
  
  return data.images;
};

/**
 * Fetch model data for an image
 */
export const fetchModelData = async (modelId) => {
  // Ensure modelId is valid format (24 character hex string)
  if (!modelId || !String(modelId).match(/^[0-9a-fA-F]{24}$/)) {
    console.warn(`Invalid model ID format: ${modelId}`);
    return null;
  }
  
  try {
    const modelResponse = await fetch(`/api/models/${modelId}`);
    if (modelResponse.ok) {
      const modelData = await modelResponse.json();
      return modelData.model;
    } else {
      console.warn(`Failed to fetch model data: ${modelResponse.status}`);
      return null;
    }
  } catch (e) {
    console.error('Error fetching model data:', e);
    return null;
  }
};

/**
 * Submit a winner selection
 */
export const submitWinnerSelection = async (winnerId, loserId, userId = null) => {
  const payload = {
    winnerId,
    loserId,
    ...(userId && { userId })
  };
  
  const response = await fetch('/api/scores/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit matchup result');
  }
  
  return await response.json();
};

/**
 * Create payment intent for Instagram reveal
 */
export const createPaymentIntent = async (modelId, modelName) => {
  const response = await fetch('/api/payments/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelId,
      modelName: modelName || 'Unknown'
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Payment intent creation failed:', data);
    throw new Error(data.message || 'Failed to create payment intent');
  }
  
  return data;
};
