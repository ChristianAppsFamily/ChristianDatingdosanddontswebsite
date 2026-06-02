// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for a subscription and returns its URL/id.
//
// Deploy:
//   supabase functions deploy create-checkout-session --no-verify-jwt
// Secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_or_test_xxx
//
// The browser calls this via supabase.functions.invoke('create-checkout-session').

import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { priceId, plan, userId, email, successUrl, cancelUrl } = await req
      .json();

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // client_reference_id lets the webhook map the payment back to the user row.
      client_reference_id: userId ?? undefined,
      customer_email: email ?? undefined,
      metadata: { userId: userId ?? "", plan: plan ?? "" },
      success_url: successUrl ??
        (req.headers.get("origin") ?? "") + "/?checkout=success",
      cancel_url: cancelUrl ??
        (req.headers.get("origin") ?? "") + "/?checkout=cancel",
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
