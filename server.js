/**
 * Elevyn Payment Server
 * ----------------------
 * A minimal, real backend that creates genuine Stripe Checkout Sessions
 * for any dollar amount. This is the piece a static site (like the
 * Command Center) can never safely do on its own, because it requires
 * your Stripe SECRET key, which must never be exposed to a browser.
 *
 * What this does:
 *   POST /create-checkout-session  { amount: 42.00, description: "..." }
 *     -> creates a real Stripe Checkout Session and returns { url }
 *   GET  /health
 *     -> simple reachability check used by the "Test Connection" button
 *   POST /webhook
 *     -> (stubbed) where Stripe would notify you when a payment actually
 *        completes — see the note at the bottom of this file.
 *
 * What this does NOT do:
 *   - It does not update the Command Center's data automatically. The
 *     Command Center is a static, browser-only tool with no database of
 *     its own beyond localStorage in your browser, so there's nothing
 *     for this server to "write back" to. Payment confirmation is real
 *     and happens on Stripe's side; reflecting that status back into the
 *     Command Center's own records would require giving the Command
 *     Center a real backend/database too — a bigger step, and a
 *     reasonable next one once this is running.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY in your .env file. See .env.example.');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Allow requests from your Command Center's origin. In production, replace
// '*' with your actual deployed domain for better security.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

// Stripe's webhook endpoint needs the raw request body, so it's registered
// before the JSON body parser below.
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event = req.body;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // A real payment just completed. This is where you'd write to a real
    // database, send a confirmation email, etc. Logged here for now:
    console.log('✅ Payment completed:', {
      amount: session.amount_total / 100,
      currency: session.currency,
      customerEmail: session.customer_details ? session.customer_details.email : null,
      sessionId: session.id,
    });
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elevyn-payment-server' });
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'A valid positive "amount" is required.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Elevyn Wellness Elevated — Payment',
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: (process.env.SUCCESS_URL || 'https://example.com/success') + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL || 'https://example.com/cancel',
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Elevyn Payment Server running on port ${PORT}`);
});
