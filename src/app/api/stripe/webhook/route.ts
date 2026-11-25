import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";

/**
 * Marks an order paid once Stripe confirms it.
 *
 * The signature check is what makes this trustworthy — without it anyone
 * could POST here and flip an order to PAID, so an unverifiable request
 * is rejected rather than trusted.
 */
export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return new NextResponse("Stripe not configured", { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.updateMany({
        // Only advance an order that is still awaiting payment, so a
        // replayed event can't move a shipped order backwards.
        where: { id: orderId, status: "PENDING_PAYMENT" },
        data: {
          status: "PAID",
          stripePaymentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
