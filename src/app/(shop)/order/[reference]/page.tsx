import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/money";
import { STATUS_LABEL } from "@/lib/orderStatus";

export const metadata = { title: "Order confirmed — EXQUISITE CRAFT" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/order/${reference}`);

  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true, address: true },
  });

  // Not found and not-yours look identical, so an order reference can't
  // be probed for existence.
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <section className="bg-lime py-14 lg:py-20">
      <div className="shell max-w-[720px]">
        <p className="micro">Order {order.reference}</p>
        <h1 className="mt-5 text-[length:var(--text-h2)]">
          Thank you — we&rsquo;re on it.
        </h1>
        <p className="lede mt-6 max-w-[48ch]">
          We&rsquo;ll email a design proof before anything is printed. Current
          status: <strong>{STATUS_LABEL[order.status]}</strong>.
        </p>

        <div className="mt-10 rounded-[24px] bg-cream p-7">
          <h2 className="text-[length:var(--text-h3)]">What you ordered</h2>

          <ul className="mt-5 space-y-4 border-b border-ink/20 pb-5">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 text-[0.9375rem]">
                <span>
                  {i.productName}
                  <span className="block text-ink/70">
                    {i.modelName} × {i.quantity}
                    {i.designKind === "UPLOAD" ? " · your artwork" : ""}
                  </span>
                  {i.note ? (
                    <span className="mt-1 block italic text-ink/70">
                      &ldquo;{i.note}&rdquo;
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 font-medium">
                  {formatInr(i.unitPaise * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 text-[0.9375rem]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatInr(order.subtotalPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>
                {order.shippingPaise === 0
                  ? "Free"
                  : formatInr(order.shippingPaise)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink/20 pt-2 text-[1.125rem] font-medium">
              <dt>Total</dt>
              <dd>{formatInr(order.totalPaise)}</dd>
            </div>
          </dl>

          <h3 className="mt-8 text-[1rem] font-medium">Delivering to</h3>
          <address className="mt-2 text-[0.9375rem] not-italic text-ink/75">
            {order.address.fullName}
            <br />
            {order.address.line1}
            {order.address.line2 ? (
              <>
                <br />
                {order.address.line2}
              </>
            ) : null}
            <br />
            {order.address.city}, {order.address.state} {order.address.postcode}
            <br />
            {order.address.phone}
          </address>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/account" className="pill">
            Your orders
            <span aria-hidden="true">↗</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center underline underline-offset-4"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    </section>
  );
}
