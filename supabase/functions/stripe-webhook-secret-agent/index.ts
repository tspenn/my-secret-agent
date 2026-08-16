/**
 * My Secret Agent — Stripe webhook
 *
 * Updates shared profiles.tier from payment-link / Checkout subscriptions:
 *   agent   ← Agent monthly/annual
 *   network ← Network monthly/annual
 *   sa_free ← subscription canceled / unpaid
 *
 * Env secrets (Supabase Dashboard → Edge Functions → Secrets):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET_SECRET_AGENT   ← from Stripe Dashboard webhook signing secret
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *
 * Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *   URL: https://psbdjnqcjpxapypcfigx.supabase.co/functions/v1/stripe-webhook-secret-agent
 *   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const FREE_TIER = "sa_free";

/** Live My Secret Agent price IDs → profiles.tier */
const PRICE_TO_TIER: Record<string, "agent" | "network"> = {
  price_1U54aOIVCtEWvFGCTRC8dikF: "agent", // Agent monthly $4.99
  price_1U54aVIVCtEWvFGCXoFo24YM: "agent", // Agent annual $49.99
  price_1U54aXIVCtEWvFGC4alzRSdR: "network", // Network monthly $14.99
  price_1U54aeIVCtEWvFGCuqbPyJ9R: "network", // Network annual $149.99
};

async function resolveUserId(
  supabase: ReturnType<typeof createClient>,
  metaUserId: string | null | undefined,
  email: string | null | undefined,
  customerId: string | null | undefined,
): Promise<string | null> {
  if (metaUserId) return metaUserId;

  if (customerId) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  if (email) {
    const { data } = await supabase.rpc("get_user_id_by_email", { p_email: email });
    if (data) return data as string;
  }

  return null;
}

function isSecretAgentSub(
  priceId: string,
  appMeta: string | undefined,
  tierMeta: string | undefined,
): boolean {
  return (
    appMeta === "secret-agent" ||
    !!PRICE_TO_TIER[priceId] ||
    tierMeta === "agent" ||
    tierMeta === "network"
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_SECRET_AGENT");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET_SECRET_AGENT not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY not set");
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const email = session.customer_details?.email ?? session.customer_email;
        const metaUserId = session.metadata?.user_id;
        const customerId = session.customer as string | null;
        const subscriptionId = session.subscription as string | null;

        let tier: string | undefined =
          session.metadata?.tier === "agent" || session.metadata?.tier === "network"
            ? session.metadata.tier
            : undefined;

        // Always resolve from line items so payment links (no session.metadata.tier) work
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id ?? "";
        tier = PRICE_TO_TIER[priceId] ?? tier;

        if (!tier) {
          console.log("checkout.session.completed ignored — not a Secret Agent price", session.id);
          break;
        }

        const userId = await resolveUserId(supabase, metaUserId, email, customerId);
        if (!userId) {
          console.error("Could not resolve user for Secret Agent checkout", {
            sessionId: session.id,
            email,
            customerId,
          });
          break;
        }

        const { error } = await supabase.from("profiles").upsert(
          {
            id: userId,
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          },
          { onConflict: "id" },
        );

        if (error) console.error("Profile upsert error:", error);
        else console.log(`✓ Secret Agent checkout → ${userId} → ${tier}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const mapped = PRICE_TO_TIER[priceId];
        const metaTier = sub.metadata?.tier;
        const appMeta = sub.metadata?.app;

        if (!isSecretAgentSub(priceId, appMeta, metaTier)) break;

        const tier = ["active", "trialing"].includes(sub.status)
          ? (mapped ?? (metaTier === "agent" || metaTier === "network" ? metaTier : FREE_TIER))
          : FREE_TIER;

        const customerId = sub.customer as string;
        const userId = await resolveUserId(supabase, sub.metadata?.user_id, null, customerId);

        if (userId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              tier,
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
            })
            .eq("id", userId);
          if (error) console.error("subscription.updated profile error:", error);
          else console.log(`✓ Secret Agent subscription.updated → ${userId} → ${tier}`);
        } else {
          const { error } = await supabase
            .from("profiles")
            .update({ tier })
            .eq("stripe_subscription_id", sub.id);
          if (error) console.error("subscription.updated by sub id error:", error);
          else console.log(`✓ Secret Agent subscription.updated (by sub) → ${sub.id} → ${tier}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const appMeta = sub.metadata?.app;
        const metaTier = sub.metadata?.tier;

        if (!isSecretAgentSub(priceId, appMeta, metaTier)) break;

        const customerId = sub.customer as string;
        const userId = await resolveUserId(supabase, sub.metadata?.user_id, null, customerId);

        if (userId) {
          const { error } = await supabase
            .from("profiles")
            .update({ tier: FREE_TIER })
            .eq("id", userId);
          if (error) console.error("subscription.deleted profile error:", error);
          else console.log(`✓ Secret Agent subscription.deleted → ${userId} → ${FREE_TIER}`);
        } else {
          const { error } = await supabase
            .from("profiles")
            .update({ tier: FREE_TIER })
            .eq("stripe_subscription_id", sub.id);
          if (error) console.error("subscription.deleted by sub id error:", error);
          else console.log(`✓ Secret Agent subscription.deleted (by sub) → ${sub.id} → ${FREE_TIER}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    console.error("Handler error:", (err as Error).message);
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
