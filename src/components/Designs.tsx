import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductTile } from "./ProductTile";

export async function Designs() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section id="designs" className="bg-cream py-16 lg:py-20">
      <div className="shell">
        <p className="micro">01 / The good stuff</p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <h2 className="max-w-[12ch]">Pick your personality.</h2>
          <p className="lede max-w-[34ch] lg:max-w-[22ch] lg:pt-1">
            A few of our favourite starting points. Make the final word yours.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductTile product={p} />
            </li>
          ))}
        </ul>

        <p className="micro mt-14">
          Studio concepts / A preview of what your case could be.{" "}
          <Link href="/shop" className="underline underline-offset-4">
            See all designs
          </Link>
        </p>
      </div>
    </section>
  );
}
