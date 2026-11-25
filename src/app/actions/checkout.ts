"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCart, cartTotals, newOrderReference } from "@/lib/cart";
import { stripe, stripeEnabled, appUrl } from "@/lib/stripe";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Enter the delivery name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(1, "Enter the address").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Enter the city").max(80),
  state: z.string().trim().min(1, "Enter the state").max(80),
  postcode: z
    .string()
    .trim()
    .regex(/^[0-9]{5,6}$/, "Enter a valid PIN code"),
});

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/checkout");

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return { error: "Your cart is empty" };
  }

  const { subtotalPaise, shippingPaise, totalPaise } = cartTotals(cart);

  const address = await prisma.address.create({
    data: { ...parsed.data, line2: parsed.data.line2 || null, userId: session.user.id },
  });

  // Build the order and hand the cart's lines over to it in one
  // transaction, so a failure can't leave a half-placed order behind.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: newOrderReference(),
        userId: session.user.id,
        addressId: address.id,
        subtotalPaise,
        shippingPaise,
        totalPaise,
        status: "PENDING_PAYMENT",
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            phoneModelId: i.phoneModelId,
            designKind: i.designKind,
            designId: i.designId,
            note: i.note,
            quantity: i.quantity,
            unitPaise: i.unitPaise,
            productName: i.product.name,
            modelName: `${i.phoneModel.brand.name} ${i.phoneModel.name}`,
          })),
        },
      },
    });

    // Clear the lines but keep the cart row, so the shopper keeps the
    // same cart token for their next visit.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  if (!stripeEnabled || !stripe) {
    // No gateway configured — the order stands as pending for the studio
    // to confirm from the admin panel.
    redirect(`/order/${order.reference}`);
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      ...cart.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "inr",
          unit_amount: i.unitPaise,
          product_data: {
            name: `${i.product.name} — ${i.phoneModel.brand.name} ${i.phoneModel.name}`,
          },
        },
      })),
      ...(shippingPaise > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "inr" as const,
                unit_amount: shippingPaise,
                product_data: { name: "Shipping" },
              },
            },
          ]
        : []),
    ],
    metadata: { orderId: order.id, reference: order.reference },
    success_url: appUrl(`/order/${order.reference}?paid=1`),
    cancel_url: appUrl(`/cart`),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  redirect(checkout.url as string);
}
