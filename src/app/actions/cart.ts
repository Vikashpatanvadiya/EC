"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCart, getOrCreateCart } from "@/lib/cart";
import {
  MAX_UPLOAD_BYTES,
  extensionFor,
  saveUpload,
  deleteUpload,
} from "@/lib/storage";

export type CartActionState = { error?: string; ok?: boolean };

const addSchema = z.object({
  productId: z.string().min(1),
  phoneModelId: z.string().min(1, "Choose your phone model"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
});

export async function addToCartAction(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = addSchema.safeParse({
    productId: formData.get("productId"),
    phoneModelId: formData.get("phoneModelId"),
    note: formData.get("note"),
    quantity: formData.get("quantity") ?? 1,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your selections" };
  }
  const { productId, phoneModelId, note, quantity } = parsed.data;

  const [product, model] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.phoneModel.findUnique({ where: { id: phoneModelId } }),
  ]);
  if (!product?.active) return { error: "That design is no longer available" };
  if (!model) return { error: "Choose your phone model" };

  // Optional customer artwork.
  let designId: string | null = null;
  const file = formData.get("artwork");

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "That image is over 10MB — please send a smaller file" };
    }
    if (!extensionFor(file.type)) {
      return { error: "Send a JPG, PNG, WEBP, HEIC or AVIF image" };
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const { storageKey } = await saveUpload(bytes, file.type);

    const design = await prisma.designUpload.create({
      data: {
        storageKey,
        originalName: file.name.slice(0, 200),
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });
    designId = design.id;
  }

  const cart = await getOrCreateCart();
  const unitPaise = product.pricePaise + model.extraPaise;

  // Identical catalog lines merge; anything carrying its own artwork or
  // brief stays a separate line, because the two aren't interchangeable.
  if (!designId && !note) {
    const twin = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        phoneModelId,
        designKind: "CATALOG",
        designId: null,
        note: null,
      },
    });
    if (twin) {
      await prisma.cartItem.update({
        where: { id: twin.id },
        data: { quantity: Math.min(twin.quantity + quantity, 10) },
      });
      revalidatePath("/cart");
      return { ok: true };
    }
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      phoneModelId,
      designKind: designId ? "UPLOAD" : "CATALOG",
      designId,
      note: note || null,
      quantity,
      unitPaise,
    },
  });

  revalidatePath("/cart");
  return { ok: true };
}

/** Guards that the item really belongs to the caller's own cart. */
async function ownedItem(itemId: string) {
  const cart = await getCart();
  if (!cart) return null;
  return prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { design: true },
  });
}

export async function updateQuantityAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!itemId || !Number.isFinite(quantity)) return;

  const item = await ownedItem(itemId);
  if (!item) return;

  if (quantity < 1) {
    await removeItem(item.id, item.design?.storageKey, item.designId);
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(Math.trunc(quantity), 10) },
    });
  }
  revalidatePath("/cart");
}

export async function removeFromCartAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const item = await ownedItem(itemId);
  if (!item) return;

  await removeItem(item.id, item.design?.storageKey, item.designId);
  revalidatePath("/cart");
}

async function removeItem(
  itemId: string,
  storageKey?: string,
  designId?: string | null,
) {
  await prisma.cartItem.delete({ where: { id: itemId } });

  // Drop the artwork too — it only existed for this line.
  if (designId) {
    await prisma.designUpload.delete({ where: { id: designId } }).catch(() => {});
    if (storageKey) await deleteUpload(storageKey);
  }
}
