import Stripe from "stripe";

/**
 * Stripe is optional: the shop runs end to end without keys, placing
 * orders as PENDING_PAYMENT for manual confirmation from admin. Adding
 * test keys to .env switches checkout to a real Stripe session.
 */
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

export function appUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
