import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatInr } from "@/lib/money";
import { STATUS_LABEL, STATUS_TINT } from "@/lib/orderStatus";
import { OrderControls } from "./OrderControls";

export const metadata = { title: "Order — EC Studio" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: { include: { product: true, design: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="shell py-10">
      <p className="micro">
        <Link href="/admin" className="underline underline-offset-4">
          Orders
        </Link>{" "}
        / {order.reference}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
        <h1 className="text-[length:var(--text-h3)]">{order.reference}</h1>
        <span
          className="rounded-full px-4 py-1.5 text-[0.8125rem] font-medium"
          style={{ backgroundColor: STATUS_TINT[order.status] }}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div>
          <h2 className="text-[1.125rem] font-medium">Items to make</h2>

          <ul className="mt-5 space-y-5">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[88px_1fr] gap-5 rounded-[20px] border border-ink/15 p-5 sm:grid-cols-[112px_1fr]"
              >
                <div
                  className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[14px]"
                  style={{ backgroundColor: item.product.tint }}
                >
                  <Image
                    src={item.product.image}
                    alt={item.productName}
                    width={684}
                    height={1223}
                    sizes="112px"
                    className="h-[86%] w-auto"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[1.0625rem] font-medium">
                        {item.productName}
                      </h3>
                      <p className="mt-1 text-[0.875rem] text-ink/70">
                        {item.modelName} · qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatInr(item.unitPaise * item.quantity)}
                    </p>
                  </div>

                  {item.note ? (
                    <div className="mt-4 rounded-xl bg-yellow p-4">
                      <p className="micro">Customer brief</p>
                      <p className="mt-2 text-[0.9375rem] italic">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    </div>
                  ) : null}

                  {item.design ? (
                    <div className="mt-4">
                      <p className="micro">Customer artwork</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {/* Served through the authorised upload route, so it
                            renders for admins and no one else. */}
                        <Image
                          src={`/api/uploads/${item.design.storageKey}`}
                          alt={`Artwork supplied for ${item.productName}`}
                          width={160}
                          height={160}
                          unoptimized
                          className="h-40 w-40 rounded-xl border border-ink/20 object-cover"
                        />
                        <div className="text-[0.8125rem] text-ink/70">
                          <p className="break-all">{item.design.originalName}</p>
                          <p className="mt-1">
                            {(item.design.sizeBytes / 1024 / 1024).toFixed(2)} MB ·{" "}
                            {item.design.mimeType}
                          </p>
                          <a
                            href={`/api/uploads/${item.design.storageKey}`}
                            download
                            className="mt-2 inline-block underline underline-offset-4"
                          >
                            Download original
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8">
          <OrderControls
            orderId={order.id}
            status={order.status}
            adminNote={order.adminNote ?? ""}
          />

          <div className="rounded-[20px] border border-ink/15 p-5">
            <h2 className="micro">Customer</h2>
            <p className="mt-3 font-medium">{order.user.name ?? "—"}</p>
            <p className="text-[0.875rem] text-ink/70">{order.user.email}</p>
            {order.user.phone ? (
              <p className="text-[0.875rem] text-ink/70">{order.user.phone}</p>
            ) : null}

            <h3 className="micro mt-6">Ship to</h3>
            <address className="mt-2 text-[0.875rem] not-italic text-ink/75">
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
              {order.address.city}, {order.address.state}{" "}
              {order.address.postcode}
              <br />
              {order.address.phone}
            </address>
          </div>

          <div className="rounded-[20px] bg-lime p-5">
            <h2 className="micro">Totals</h2>
            <dl className="mt-4 space-y-2 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatInr(order.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{formatInr(order.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/25 pt-2 font-medium">
                <dt>Total</dt>
                <dd>{formatInr(order.totalPaise)}</dd>
              </div>
            </dl>
            {order.stripePaymentId ? (
              <p className="mt-4 break-all text-[0.75rem] text-ink/70">
                Stripe: {order.stripePaymentId}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
