import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateProductAction } from "@/app/actions/admin";

export const metadata = { title: "Products — EC Studio" };

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { orderItems: true } } },
  });

  return (
    <div className="shell py-10">
      <h1 className="text-[length:var(--text-h3)]">Products</h1>
      <p className="mt-3 max-w-[56ch] text-[0.9375rem] text-ink/70">
        Change a price or take a design off the shop. Prices are in rupees;
        existing orders keep the price they were placed at.
      </p>

      <ul className="mt-8 space-y-4">
        {products.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-[64px_1fr] items-center gap-5 rounded-[20px] border border-ink/15 p-4 sm:grid-cols-[64px_1fr_auto]"
          >
            <div
              className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px]"
              style={{ backgroundColor: p.tint }}
            >
              <Image
                src={p.image}
                alt={p.name}
                width={684}
                height={1223}
                sizes="64px"
                className="h-[86%] w-auto"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-[1.0625rem] font-medium">{p.name}</h2>
              <p className="text-[0.8125rem] text-ink/65">
                {p.collection} · {p._count.orderItems} sold
              </p>
            </div>

            <form
              action={updateProductAction}
              className="col-span-2 flex flex-wrap items-end gap-4 sm:col-span-1"
            >
              <input type="hidden" name="productId" value={p.id} />

              <div>
                <label
                  htmlFor={`price-${p.id}`}
                  className="micro block normal-case"
                >
                  Price ₹
                </label>
                <input
                  id={`price-${p.id}`}
                  name="priceInr"
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={p.pricePaise / 100}
                  className="mt-1.5 h-11 w-28 rounded-lg border border-ink/25 bg-cream px-3"
                />
              </div>

              <label className="flex min-h-11 items-center gap-2 text-[0.875rem]">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={p.active}
                  className="h-4 w-4"
                />
                Visible
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[0.875rem] font-medium text-cream"
              >
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
