"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ALL_STATUSES } from "@/lib/orderStatus";

export type AdminState = { ok?: boolean; error?: string };

const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ALL_STATUSES as [OrderStatus, ...OrderStatus[]]),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function updateOrderAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "You don't have access to do that" };
  }

  const parsed = updateOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the values and try again" };

  const { orderId, status, adminNote } = parsed.data;

  await prisma.order.update({
    where: { id: orderId },
    data: { status, adminNote: adminNote || null },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

const productSchema = z.object({
  productId: z.string().min(1),
  pricePaise: z.coerce.number().int().min(0).max(10_000_00),
  active: z.coerce.boolean(),
});

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    productId: formData.get("productId"),
    // Entered in rupees; stored in paise.
    pricePaise: Math.round(Number(formData.get("priceInr") ?? 0) * 100),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return;

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { pricePaise: parsed.data.pricePaise, active: parsed.data.active },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
