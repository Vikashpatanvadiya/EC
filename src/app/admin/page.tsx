import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/money";
import { ALL_STATUSES, STATUS_LABEL, STATUS_TINT } from "@/lib/orderStatus";

export const metadata = { title: "Orders — EC Studio" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = ALL_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const [orders, counts, revenue] = await Promise.all([
    prisma.order.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({
      _sum: { totalPaise: true },
      where: { status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  const countFor = (s: OrderStatus) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((n, c) => n + c._count._all, 0);

  return (
    <div className="shell py-10">
      <h1 className="text-[length:var(--text-h3)]">Orders</h1>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="All orders" value={String(total)} tint="#ffffff" />
        <Stat
          label="Needs attention"
          value={String(countFor("PENDING_PAYMENT") + countFor("PAID"))}
          tint="#f9e88d"
        />
        <Stat
          label="Confirmed revenue"
          value={formatInr(revenue._sum.totalPaise ?? 0)}
          tint="#d6ef78"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip href="/admin" label={`All (${total})`} active={!active} />
        {ALL_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin?status=${s}`}
            label={`${STATUS_LABEL[s]} (${countFor(s)})`}
            active={active === s}
          />
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-12 text-ink/70">
          No orders{active ? ` with status “${STATUS_LABEL[active]}”` : ""} yet.
        </p>
      ) : (
        <>
          {/* Phones get a card per order — a sideways-scrolling table is
              miserable on the device most of this shop's traffic uses. */}
          <ul className="mt-8 space-y-3 lg:hidden">
            {orders.map((o) => {
              const units = o.items.reduce((n, i) => n + i.quantity, 0);
              const uploads = o.items.filter(
                (i) => i.designKind === "UPLOAD",
              ).length;
              return (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="block rounded-[16px] border border-ink/15 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{o.reference}</p>
                        <p className="mt-0.5 truncate text-[0.8125rem] text-ink/70">
                          {o.user.name ?? o.user.email}
                        </p>
                      </div>
                      <p className="shrink-0 font-medium">
                        {formatInr(o.totalPaise)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[0.75rem] font-medium"
                        style={{ backgroundColor: STATUS_TINT[o.status] }}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-[0.75rem] text-ink/65">
                        {units} item{units === 1 ? "" : "s"}
                      </span>
                      {uploads > 0 ? (
                        <span className="rounded-full bg-lime px-2 py-0.5 text-[0.75rem] font-medium">
                          {uploads} artwork
                        </span>
                      ) : null}
                      <span className="ml-auto text-[0.75rem] text-ink/65">
                        {o.createdAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-[0.9375rem]">
            <thead>
              <tr className="border-y border-ink/20 text-left">
                <Th>Reference</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Placed</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const units = o.items.reduce((n, i) => n + i.quantity, 0);
                const uploads = o.items.filter(
                  (i) => i.designKind === "UPLOAD",
                ).length;
                return (
                  <tr key={o.id} className="border-b border-ink/15">
                    <td className="py-4">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium underline underline-offset-4"
                      >
                        {o.reference}
                      </Link>
                    </td>
                    <td className="py-4">
                      {o.user.name ?? "—"}
                      <span className="block text-[0.8125rem] text-ink/65">
                        {o.user.email}
                      </span>
                    </td>
                    <td className="py-4">
                      {units}
                      {uploads > 0 ? (
                        <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[0.75rem] font-medium">
                          {uploads} artwork
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 text-ink/70">
                      {o.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-4">
                      <span
                        className="rounded-full px-3 py-1 text-[0.75rem] font-medium"
                        style={{ backgroundColor: STATUS_TINT[o.status] }}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium">
                      {formatInr(o.totalPaise)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div
      className="rounded-[16px] p-4 sm:rounded-[20px] sm:p-5"
      style={{ backgroundColor: tint }}
    >
      <p className="micro text-[0.625rem] leading-tight sm:text-[0.8125rem]">
        {label}
      </p>
      <p className="mt-2 text-[1.25rem] font-medium tracking-[-0.03em] sm:text-[1.75rem]">
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-[0.8125rem] font-medium ${
        active ? "border-ink bg-ink text-cream" : "border-ink/25 text-ink/75"
      }`}
    >
      {label}
    </Link>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`py-3 micro font-medium ${className}`}>{children}</th>;
}
