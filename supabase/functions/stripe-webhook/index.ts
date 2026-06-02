// Supabase Edge Function: stripe-webhook
// Verifies Stripe webhook signatures and flips public.users.is_premium.
// This is the ONLY place is_premium is granted — never trust the client.
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_xxx
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
//   supabase secrets set SERVICE_ROLE_KEY=eyJ...   (service_role key)
//   supabase secrets set PROJECT_URL=https://YOUR_PROJECT.supabase.co
//
// In the Stripe Dashboard, point a webhook endpoint at this function's URL and
// subscribe to: checkout.session.completed, customer.subscription.deleted.

import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SERVICE_ROLE_KEY") ?? "",
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

async function setPremiumByUserId(userId: string, value: boolean, customerId?: string) {
  if (!userId) return;
  const patch: Record<string, unknown> = { is_premium: value };
  if (customerId) patch.stripe_customer_id = customerId;
  const { error } = await supabase.from("users").update(patch).eq("id", userId);
  if (error) console.error("update by userId failed:", error);
}

async function setPremiumByCustomer(customerId: string, value: boolean) {
  if (!customerId) return;
  const { error } = await supabase
    .from("users")
    .update({ is_premium: value })
    .eq("stripe_customer_id", customerId);
  if (error) console.error("update by customer failed:", error);
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response(`Webhook Error: ${String(err)}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ??
          (session.metadata?.userId ?? "");
        const customerId = typeof session.customer === "string"
          ? session.customer
          : undefined;
        await setPremiumByUserId(userId, true, customerId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : "";
        await setPremiumByCustomer(customerId, false);
        break;
      }
      default:
        // ignore other events
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
