import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { shippingFor } from "./money";

const CART_COOKIE = "ec_cart";

export type CartWithItems = NonNullable<
  Awaited<ReturnType<typeof findCart>>
>;

const itemInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: true,
      phoneModel: { include: { brand: true } },
      design: true,
    },
  },
} as const;

async function findCart(token: string | undefined, userId: string | undefined) {
  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: itemInclude,
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;
  }
  if (token) {
    return prisma.cart.findUnique({ where: { token }, include: itemInclude });
  }
  return null;
}

/** Reads the current cart without creating one. */
export async function getCart() {
  const session = await auth();
  const token = (await cookies()).get(CART_COOKIE)?.value;
  return findCart(token, session?.user?.id);
}

/**
 * Returns the cart, creating it if needed. On sign-in, a guest cart is
 * adopted by the user rather than abandoned, so nothing is lost at login.
 */
export async function getOrCreateCart() {
  const session = await auth();
  const userId = session?.user?.id;
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value;

  const existing = await findCart(token, userId);

  if (existing) {
    // Guest cart + freshly signed-in user → attach it to the account.
    if (userId && !existing.userId) {
      return prisma.cart.update({
        where: { id: existing.id },
        data: { userId },
        include: itemInclude,
      });
    }
    return existing;
  }

  if (!token) {
    token = randomBytes(24).toString("hex");
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60,
    });
  }

  return prisma.cart.create({
    data: { token, userId: userId ?? null },
    include: itemInclude,
  });
}

export function cartTotals(cart: { items: { quantity: number; unitPaise: number }[] } | null) {
  const subtotalPaise =
    cart?.items.reduce((sum, i) => sum + i.unitPaise * i.quantity, 0) ?? 0;
  const shippingPaise = shippingFor(subtotalPaise);
  const count = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  return {
    subtotalPaise,
    shippingPaise,
    totalPaise: subtotalPaise + shippingPaise,
    count,
  };
}

/** Human-facing order reference, e.g. EC-8F3K2D. */
export function newOrderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (const byte of randomBytes(6)) out += alphabet[byte % alphabet.length];
  return `EC-${out}`;
}
