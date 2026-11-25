import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { readUpload } from "@/lib/storage";

/**
 * Serves customer artwork. Access is granted only to an admin, the
 * customer who owns the order it belongs to, or whoever currently holds
 * the cart that references it (so a guest can see their own preview).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const design = await prisma.designUpload.findUnique({
    where: { storageKey: key },
    include: {
      orderItems: { include: { order: true } },
      cartItems: true,
    },
  });
  if (!design) return new NextResponse("Not found", { status: 404 });

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  let allowed = isAdmin;

  if (!allowed && session?.user?.id) {
    allowed = design.orderItems.some((i) => i.order.userId === session.user.id);
  }

  if (!allowed) {
    const cart = await getCart();
    allowed = Boolean(
      cart && design.cartItems.some((ci) => ci.cartId === cart.id),
    );
  }

  if (!allowed) return new NextResponse("Not found", { status: 404 });

  let bytes: Buffer;
  try {
    bytes = await readUpload(key);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": design.mimeType,
      // Private: this is one customer's photograph, never a shared asset.
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${design.id}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
