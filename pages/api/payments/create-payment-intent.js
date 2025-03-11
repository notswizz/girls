import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get the cost from environment variable or default to 100 cents ($1)
const REVEAL_COST_CENTS = parseInt(process.env.INSTAGRAM_REVEAL_COST_CENTS || '100', 10);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { modelId, modelName } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    console.log('Creating payment intent for model:', { modelId, modelName });
    console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY ? 'Key exists (hidden)' : 'Key missing');
    console.log('Reveal cost (cents):', REVEAL_COST_CENTS);

    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: REVEAL_COST_CENTS, // Amount in cents from environment variable
        currency: 'usd',
        // Use explicit payment method types approach (option 1)
        payment_method_types: ['card', 'cashapp'],
        // Note: We're NOT using automatic_payment_methods here to avoid the conflict
        metadata: {
          modelId,
          modelName,
          feature: 'instagram_reveal',
          cost_cents: REVEAL_COST_CENTS.toString()
        },
        description: `Instagram reveal for model ${modelName || modelId} ($${(REVEAL_COST_CENTS / 100).toFixed(2)})`
      });

      console.log('Payment intent created successfully:', paymentIntent.id);
      
      // Return the client secret
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        amount: REVEAL_COST_CENTS,
        formatted_amount: `$${(REVEAL_COST_CENTS / 100).toFixed(2)}`
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return res.status(500).json({ 
        error: 'Stripe API error', 
        message: stripeError.message,
        type: stripeError.type
      });
    }
  } catch (error) {
    console.error('Server error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
} 