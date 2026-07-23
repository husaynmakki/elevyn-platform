# Elevyn Payment Server

This is a small, real backend that lets the Command Center accept genuine
Stripe payments for any dollar amount — invoices, POS sales, payment
links, all of it. It's about 100 lines of code and takes roughly 10
minutes to get running.

## Why this exists

The Command Center itself is a static site — it has no server, and it
can't safely hold a Stripe secret key (any key sitting in browser code is
visible to anyone who opens dev tools). Real payment processing always
needs *some* server holding that secret key. This is that server, kept
as small and simple as possible.

## What you need first

1. A free [Stripe account](https://dashboard.stripe.com/register)
2. Your Stripe **secret key**, from Dashboard → Developers → API keys
   (use the test key, `sk_test_...`, until you're ready to accept real
   money — then switch to the live key)

## Step 1 — Install dependencies

```bash
cd elevyn-payment-server
npm install
```

## Step 2 — Configure your keys

```bash
cp .env.example .env
```

Open `.env` and paste in your real `STRIPE_SECRET_KEY`. Leave everything
else as default for now.

## Step 3 — Test it locally (optional but recommended)

```bash
npm start
```

You should see `Elevyn Payment Server running on port 4242`. Visit
`http://localhost:4242/health` in a browser — it should show
`{"status":"ok",...}`.

## Step 4 — Deploy it somewhere real

This needs to run on an actual server, not your laptop, so the Command
Center can reach it from anywhere. Any of these work well and have a
generous free tier:

- **[Render](https://render.com)** — easiest option. Create a new "Web
  Service", connect this folder (via a GitHub repo), set the build
  command to `npm install` and the start command to `npm start`, then
  add your `.env` values under Render's "Environment" tab.
- **[Railway](https://railway.app)** — similar process, also very quick.
- **[Fly.io](https://fly.io)** — a bit more setup, more control.

Whichever you pick, the steps are the same shape: push this folder to a
Git repo, connect it, add your environment variables in that host's
dashboard (never commit your real `.env` file), and deploy.

## Step 5 — Connect it to the Command Center

Once deployed, you'll get a URL like `https://elevyn-payments.onrender.com`.

1. Open the Command Center → **Payment Links & Gift Cards** → **Payment
   Gateway** tab
2. Paste that URL into **Backend Checkout Endpoint**
3. Click **Test Connection** — it should say "Connected"
4. From then on, every "Collect Payment", POS checkout, and "Pay" button
   across the whole platform will redirect to a real, live Stripe
   Checkout page for that exact amount

## How payment status makes it back into the Command Center

This is the part that used to require a real database — now it works:

1. When you click "Collect Payment" (or check out a POS sale, or pay a
   Payment Link), the Command Center sends along a reference ID (the
   invoice ID, transaction ID, etc.) as Stripe metadata.
2. When the customer actually finishes paying, Stripe calls this
   server's `/webhook` endpoint, and the payment — along with that
   reference ID — gets written to `payments-log.json`.
3. The Command Center periodically asks this server "what's completed
   since I last checked?" via `/completed-payments`, and automatically
   marks the matching invoice, POS sale, or payment link as paid.

This sync runs automatically every time you open Billing, Point of
Sale, or the Payment Gateway tab, or you can trigger it manually with
the **Sync Payments Now** button on the Payment Gateway tab.

### Setting up the webhook (required for sync to work)

1. In the Stripe Dashboard, go to **Developers → Webhooks → Add
   endpoint**
2. Set the endpoint URL to `https://your-deployed-server.com/webhook`
3. Select the `checkout.session.completed` event
4. Stripe will give you a **signing secret** (starts with `whsec_`) —
   copy it into your `.env` file as `STRIPE_WEBHOOK_SECRET`, then
   redeploy

Without this step, checkout still works and customers can still pay —
you just won't get the automatic sync back into the Command Center's
records, since the server won't know a payment happened. In that case
you'd still see it appear as a completed session directly in your
Stripe Dashboard.

### About the storage (please read before relying on this for real money)

Completed payments are currently kept in a `payments-log.json` file on
the server. This is genuinely real and works — but most free hosting
tiers (Render, Railway, etc.) use an **ephemeral filesystem**, meaning
that file can be wiped whenever the host restarts your server (which
can happen for all kinds of routine reasons — deploys, scaling,
inactivity). For light use or testing, that's a fine tradeoff. Once
you're relying on this for real money, swap the three storage functions
at the top of `server.js` (`loadPayments` / `savePayment` /
`getPaymentsSince`) to use a real database instead — a free tier of
Postgres or Redis from the same host works well and is a small change,
not a rewrite.

## Files in this folder

- `server.js` — the actual server code
- `package.json` — dependency list
- `.env.example` — template for your configuration (copy to `.env`)
- `payments-log.json` — created automatically once your first payment
  completes; this is the file-based store described above
