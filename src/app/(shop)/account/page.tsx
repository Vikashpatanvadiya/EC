import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/money";
import { STATUS_LABEL, STATUS_TINT } from "@/lib/orderStatus";
import { signOutAction } from "@/app/actions/auth";

export const metadata = { title: "Your account — EXQUISITE CRAFT" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/account");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <section className="bg-cream py-14 lg:py-20">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="micro">Your account</p>
            <h1 className="mt-5 text-[length:var(--text-h2)]">
              Hello{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="lede mt-4 text-ink/70">{session.user.email}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-11 underline underline-offset-4"
            >
              Sign out
            </button>
          </form>
        </div>

        <h2 className="mt-14 text-[length:var(--text-h3)]">Your orders</h2>

        {orders.length === 0 ? (
          <div className="mt-6 max-w-[46ch]">
            <p className="lede">
              No orders yet. When you place one it&rsquo;ll show up here with its
              progress.
            </p>
            <Link href="/shop" className="pill mt-7">
              Explore the designs
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 border-t border-ink/20">
            {orders.map((order) => (
              <li key={order.id} className="border-b border-ink/20 py-6">
                <Link
                  href={`/order/${order.reference}`}
                  className="flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium tracking-[-0.02em]">
                      {order.reference}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-ink/70">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      {order.items.reduce((n, i) => n + i.quantity, 0)} item
                      {order.items.reduce((n, i) => n + i.quantity, 0) === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <span
                      className="rounded-full px-3 py-1 text-[0.75rem] font-medium"
                      style={{ backgroundColor: STATUS_TINT[order.status] }}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span className="font-medium">
                      {formatInr(order.totalPaise)}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
