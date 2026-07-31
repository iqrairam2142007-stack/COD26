# COD26 — backend status

Backend is live. Payment provider is **Razorpay**.

Project: `Cod26 2.0` · `5409c200-771b-4986-886c-0eec2ce1e7a6` · region `ap-southeast`
Host: `https://9eah3y4t.ap-southeast.insforge.app`
Dashboard: https://insforge.dev/dashboard/project/5409c200-771b-4986-886c-0eec2ce1e7a6

---

## Done

| | |
|---|---|
| Project linked | `.insforge/project.json` (gitignored — contains an admin key) |
| Tables | `profiles`, `school_codes`, `quiz_questions`, `quiz_attempts`, `unit_progress`, `activity_logs`, `orders`, `pricing` + `leaderboard_view` |
| RLS | every table, plus `payments.razorpay_orders` and `payments.stripe_checkout_sessions` |
| Triggers | `on_auth_user_created`, `profiles_protect_columns`, `on_payment_webhook` |
| Quiz bank | 36 questions across all 17 units, 0 with a mismatched answer |
| Edge functions | `quiz`, `school-code`, `admin` — all `active` |
| Frontend env | `.env` written with real URL + anon key |
| Build | `npm run build` → compiled successfully |

Migrations applied:

```
20260731120000_cod26-schema
20260731120100_payments-fulfillment
20260731120200_seed-quiz-bank
20260801000000_pricing-and-amount-check
```

---

## Left to do — 3 things, all yours

### 1. Razorpay keys

Secret — you set this, not me.

```bash
npx @insforge/cli payments razorpay config set --environment test --key-id rzp_test_XXXX --key-secret YOUR_KEY_SECRET
```

Then confirm:

```bash
npx @insforge/cli payments razorpay status
```

### 2. Razorpay webhook — manual, in the Razorpay Dashboard

Razorpay does **not** auto-register webhooks. Without this, payments succeed
and nobody gets access.

1. InsForge Dashboard → Payments → Settings → Webhooks. Copy the **URL** and
   the **secret**.
2. Razorpay Dashboard → Settings → Webhooks → Add New Webhook. Paste both.
3. Tick at minimum: `order.paid`, `payment.captured`, `payment.failed`.

Razorpay only delivers to a public HTTPS URL — `localhost` will not receive
webhooks. To test the full flow you need the app deployed.

### 3. Make yourself admin

Sign up through the app once, then:

```bash
npx @insforge/cli db query "UPDATE public.profiles SET role='admin', access_status='active' WHERE email='iqrairam2142007@gmail.com'"
```

---

## Run it

```bash
npm start
```

---

## Changing the fee

The price is **not** in code. It lives in one database row:

```bash
npx @insforge/cli db query "SELECT * FROM public.pricing"
```

```bash
npx @insforge/cli db query "UPDATE public.pricing SET amount_minor=70000, access_months=6 WHERE id='class_fee'"
```

`amount_minor` is **paise** — 70000 = ₹700. The checkout screen, the Razorpay
order, and the server-side amount check all read this same row, so they cannot
drift apart.

## Going live

Only after you have tested with Razorpay test keys:

```bash
npx @insforge/cli payments razorpay config set --environment live --key-id rzp_live_XXXX --key-secret YOUR_LIVE_SECRET
```

Add a second webhook in the Razorpay Dashboard pointing at the **live** URL,
then set `REACT_APP_PAYMENT_ENV=live` in `.env` and rebuild.

## Security note

Razorpay order amounts are sent by the browser, so a crafted request could
create a ₹1 order. The fulfillment trigger re-checks `razorpay_orders.amount_paid`
against `public.pricing` before granting access — an underpaid order buys
nothing. Do not remove that check.
