import Image from "next/image";
import Link from "next/link";
import { getCart, cartTotals } from "@/lib/cart";
import { formatInr, FREE_SHIPPING_OVER_PAISE } from "@/lib/money";
import { updateQuantityAction, removeFromCartAction } from "@/app/actions/cart";

export const metadata = { title: "Your cart — EXQUISITE CRAFT" };

export default async function CartPage() {
  const cart = await getCart();
  const { subtotalPaise, shippingPaise, totalPaise, count } = cartTotals(cart);
  const items = cart?.items ?? [];

  return (
    <section className="bg-cream py-14 lg:py-20">
      <div className="shell">
        <p className="micro">Your cart</p>
        <h1 className="mt-5 text-[length:var(--text-h2)]">
          {count === 0 ? "Nothing here yet." : `${count} to make yours.`}
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 max-w-[46ch]">
            <p className="lede">
              Your cart is empty. Pick a design and we&rsquo;ll print it for your
              exact phone.
            </p>
            <Link href="/shop" className="pill mt-7">
              Explore the designs
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            <ul className="border-t border-ink/20">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[88px_1fr] gap-5 border-b border-ink/20 py-6 sm:grid-cols-[112px_1fr]"
                >
                  <div
                    className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[14px]"
                    style={{ backgroundColor: item.product.tint }}
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={684}
                      height={1223}
                      sizes="112px"
                      className="h-[86%] w-auto"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                      <div>
                        <h2 className="text-[1.125rem] font-medium tracking-[-0.03em]">
                          {item.product.name}
                        </h2>
                        <p className="mt-1 text-[0.875rem] text-ink/70">
                          {item.phoneModel.brand.name} {item.phoneModel.name}
                        </p>
                      </div>
                      <p className="font-medium tracking-[-0.02em]">
                        {formatInr(item.unitPaise * item.quantity)}
                      </p>
                    </div>

                    {item.design ? (
                      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-[0.75rem] font-medium">
                        <span aria-hidden="true">✦</span>
                        Your artwork attached
                      </p>
                    ) : null}

                    {item.note ? (
                      <p className="mt-2 max-w-[52ch] text-[0.875rem] italic text-ink/70">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center gap-4">
                      <form action={updateQuantityAction} className="flex items-center gap-2">
                        <input type="hidden" name="itemId" value={item.id} />
                        <label htmlFor={`qty-${item.id}`} className="micro">
                          Qty
                        </label>
                        <input
                          id={`qty-${item.id}`}
                          name="quantity"
                          type="number"
                          min={1}
                          max={10}
                          defaultValue={item.quantity}
                          className="h-11 w-16 rounded-lg border border-ink/25 bg-cream px-2 text-center"
                        />
                        <button
                          type="submit"
                          className="min-h-11 px-2 text-[0.8125rem] underline underline-offset-4"
                        >
                          Update
                        </button>
                      </form>

                      <form action={removeFromCartAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="min-h-11 text-[0.8125rem] text-ink/70 underline underline-offset-4 hover:text-ink"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-[24px] bg-lime p-7">
                <h2 className="text-[length:var(--text-h3)]">Summary</h2>

                <dl className="mt-6 space-y-3 text-[0.9375rem] tracking-[-0.02em]">
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

                {shippingPaise > 0 ? (
                  <p className="mt-4 text-[0.8125rem] text-ink/70">
                    Spend {formatInr(FREE_SHIPPING_OVER_PAISE - subtotalPaise)}{" "}
                    more for free shipping.
                  </p>
                ) : null}

                <Link href="/checkout" className="pill mt-7 w-full justify-center">
                  Checkout
                  <span aria-hidden="true">↗</span>
                </Link>

                <p className="mt-4 text-center text-[0.8125rem] text-ink/70">
                  We email a design proof before printing.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
