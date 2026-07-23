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

## About the webhook (optional, for later)

Right now, this server creates real checkout sessions, but it doesn't
automatically know *when* a customer finishes paying — that requires
setting up a webhook in the Stripe Dashboard pointed at
`https://your-server.com/webhook`. The code for handling that is already
in `server.js` (it currently just logs the completed payment). Wiring
that further back into the Command Center's own records would mean
giving the Command Center a real database instead of browser storage —
a reasonable next step once you're comfortable with this piece.

## Files in this folder

- `server.js` — the actual server code
- `package.json` — dependency list
- `.env.example` — template for your configuration (copy to `.env`)
