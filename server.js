/**
 * Elevyn Payment Server
 * ----------------------
 * A minimal, real backend that creates genuine Stripe Checkout Sessions
 * for any dollar amount, and now also tracks which ones actually complete
 * so the Command Center can pull that status back into its own records.
 *
 * What this does:
 *   POST /create-checkout-session  { amount, description, refId, refType }
 *     -> creates a real Stripe Checkout Session and returns { url }
 *      refId/refType (e.g. an invoice ID) ride along as Stripe metadata,
 *      so we can later say exactly which invoice/order got paid.
 *   POST /webhook
 *     -> Stripe calls this the instant a payment actually completes.
 *        We record it (see storage note below).
 *   GET  /completed-payments?since=<ISO timestamp>
 *     -> returns every completed payment recorded since that time, so the
 *        Command Center can poll this and mark matching invoices as paid.
 *   GET  /health
 *     -> simple reachability check used by the "Test Connection" button
 *
 * Storage note:
 *   Completed payments are kept in a local payments-log.json file on
 *   disk. That's enough to survive a normal server restart, but most
 *   free hosting tiers (Render, Railway, etc.) use an EPHEMERAL
 *   filesystem — meaning the file can be wiped if the host spins up a
 *   fresh container. For anything beyond testing/light use, swap this
 *   file-based store for a real database (even a free hosted Postgres
 *   or Redis instance works well here) — the three functions at the top
 *   (loadPayments/savePayment/getPaymentsSince) are the only things
 *   you'd need to point at that database instead.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY in your .env file. See .env.example.');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

const LOG_FILE = path.join(__dirname, 'payments-log.json');

/* ---------- Tiny file-backed payment store ---------- */
function loadPayments() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}
function savePayment(record) {
  const all = loadPayments();
  all.push(record);
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(all, null, 2));
  } catch (err) {
    console.error('Could not write payments-log.json (non-fatal — payment is still real on Stripe\'s side):', err.message);
  }
}
function getPaymentsSince(sinceIso) {
  const all = loadPayments();
  if (!sinceIso) return all;
  const since = new Date(sinceIso).getTime();
  return all.filter(p => new Date(p.completedAt).getTime() > since);
}

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
      return res.status(400).send('Webhook Error: ' + err.message);
    }
  } else {
    // No webhook secret configured yet — parse the raw body as JSON so
    // local testing still works. Set STRIPE_WEBHOOK_SECRET before going live.
    try { event = JSON.parse(req.body); } catch (err) { /* leave as-is */ }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const record = {
      sessionId: session.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      refId: session.metadata ? session.metadata.refId || null : null,
      refType: session.metadata ? session.metadata.refType || null : null,
      description: session.metadata ? session.metadata.description || null : null,
      customerEmail: session.customer_details ? session.customer_details.email : null,
      completedAt: new Date().toISOString(),
    };
    savePayment(record);
    console.log('Payment completed and recorded:', record);
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elevyn-payment-server' });
});

app.get('/completed-payments', (req, res) => {
  res.json({ payments: getPaymentsSince(req.query.since) });
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, description, refId, refType } = req.body;

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
      metadata: {
        refId: refId || '',
        refType: refType || '',
        description: description || '',
      },
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
  console.log('Elevyn Payment Server running on port ' + PORT);
});
