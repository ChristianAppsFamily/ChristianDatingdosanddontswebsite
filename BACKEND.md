# Backend setup — Christian Dating Do's & Don'ts

## Supabase (done)

- Project ref: `tgacfeisoaonzushuugh`
- API URL: `https://tgacfeisoaonzushuugh.supabase.co`
- Schema + seed applied (`users`, `daily_words`, `community_posts`, reactions, replies)
- Anon key wired in [`project/config.jsx`](project/config.jsx)

> Note: A dedicated free project could not be created (org hit the 2 active free-project limit). Schema lives on the **Christian Dating Coach AI** project for now. When you free a slot, create `Christian Dating Dos Donts Website` and migrate.

### Auth dashboard checklist

In Supabase → Authentication → URL configuration, add:

- Site URL: your Vercel URL (e.g. `https://YOUR-APP.vercel.app`)
- Redirect URLs:
  - `https://YOUR-APP.vercel.app/auth/callback`
  - `http://127.0.0.1:8765/auth/callback` (local)
  - `http://localhost:8765/auth/callback`

Email provider: leave enabled. For smoother trials, turn **off** “Confirm email” under Providers → Email (or keep it on and use the in-app “check your inbox” path).

### Google OAuth

1. Google Cloud Console → OAuth client (Web) with authorized redirect:
   `https://tgacfeisoaonzushuugh.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Providers → Google → paste Client ID + Secret
3. Ensure the site redirect URLs above include `/auth/callback`

## Stripe (still needed)

1. Create Products/Prices in Stripe (test mode first):
   - Monthly → copy Price ID → `CONFIG.STRIPE_MONTHLY_PRICE_ID`
   - Annual → copy Price ID → `CONFIG.STRIPE_ANNUAL_PRICE_ID`
2. Set `CONFIG.STRIPE_PUBLISHABLE_KEY` to `pk_test_…` (or live)
3. Deploy edge functions from repo root:

```bash
supabase link --project-ref tgacfeisoaonzushuugh
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set PROJECT_URL=https://tgacfeisoaonzushuugh.supabase.co
supabase secrets set SERVICE_ROLE_KEY=eyJ...   # service_role from project settings
supabase functions deploy create-checkout-session --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

4. Stripe Dashboard → Webhooks → endpoint:
   `https://tgacfeisoaonzushuugh.supabase.co/functions/v1/stripe-webhook`
   Events: `checkout.session.completed`, `customer.subscription.deleted`

Until Stripe is filled in, Subscribe still unlocks premium in the UI for demos when `isStripeConfigured()` is false.

## Optional runtime override

Before `config.jsx` loads:

```html
<script>
  window.__CDDD_CONFIG__ = {
    STRIPE_PUBLISHABLE_KEY: 'pk_live_…',
    STRIPE_MONTHLY_PRICE_ID: 'price_…',
    STRIPE_ANNUAL_PRICE_ID: 'price_…',
  };
</script>
```
