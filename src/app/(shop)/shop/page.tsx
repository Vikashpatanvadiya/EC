import { prisma } from "@/lib/prisma";
import { ProductTile } from "@/components/ProductTile";

export const metadata = {
  title: "The designs — EXQUISITE CRAFT",
  description: "Every custom phone case design in the studio.",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-lime py-14 lg:py-20">
        <div className="shell">
          <p className="micro">The designs</p>
          <h1 className="mt-5 max-w-[14ch] text-[length:var(--text-h2)]">
            Every case in the studio.
          </h1>
          <p className="lede mt-6 max-w-[46ch]">
            Pick a design as it is, or bring your own photograph and artwork —
            every case is printed to order for your exact phone model.
          </p>
        </div>
      </section>

      <section className="bg-cream py-14 lg:py-20">
        <div className="shell">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {products.map((p, i) => (
              <li key={p.id}>
                <ProductTile product={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
