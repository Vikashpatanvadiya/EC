import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { formatInr } from "@/lib/money";
import { stripeEnabled } from "@/lib/stripe";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout — EXQUISITE CRAFT" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/checkout");

  const cart = await getCart();
  const { subtotalPaise, shippingPaise, totalPaise } = cartTotals(cart);

  if (!cart || cart.items.length === 0) {
    return (
      <section className="bg-cream py-14 lg:py-20">
        <div className="shell">
          <h1 className="text-[length:var(--text-h2)]">Your cart is empty.</h1>
          <Link href="/shop" className="pill mt-8">
            Explore the designs
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream py-14 lg:py-20">
      <div className="shell">
        <p className="micro">Checkout</p>
        <h1 className="mt-5 text-[length:var(--text-h2)]">Where to send it.</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <CheckoutForm
            defaultName={session.user.name ?? ""}
            stripeEnabled={stripeEnabled}
          />

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[24px] bg-lime p-7">
              <h2 className="text-[length:var(--text-h3)]">Your order</h2>

              <ul className="mt-5 space-y-3 border-b border-ink/25 pb-5 text-[0.875rem]">
                {cart.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4">
                    <span className="min-w-0">
                      {i.product.name}
                      <span className="block text-ink/70">
                        {i.phoneModel.brand.name} {i.phoneModel.name} × {i.quantity}
                        {i.design ? " · your artwork" : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatInr(i.unitPaise * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-3 text-[0.9375rem]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium">{formatInr(subtotalPaise)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="font-medium">
                    {shippingPaise === 0 ? "Free" : formatInr(shippingPaise)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-ink/25 pt-3 text-[1.125rem]">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-medium">{formatInr(totalPaise)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
