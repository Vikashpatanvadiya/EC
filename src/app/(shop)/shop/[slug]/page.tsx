import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/money";
import { AddToCartForm } from "./AddToCartForm";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not found — EXQUISITE CRAFT" };
  return {
    title: `${product.name} — EXQUISITE CRAFT`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, brands] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.phoneBrand.findMany({
      orderBy: { sortOrder: "asc" },
      include: { models: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!product || !product.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, collection: product.collection, id: { not: product.id } },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-cream py-8 lg:py-12">
        <div className="shell">
          <p className="micro">
            <Link href="/shop" className="underline underline-offset-4">
              The designs
            </Link>{" "}
            / {product.label}
          </p>
        </div>
      </section>

      <section className="bg-cream pb-16 lg:pb-24">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div
            className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[24px]"
            style={{ backgroundColor: product.tint }}
          >
            <Image
              src={product.image}
              alt={`${product.name} custom phone case`}
              width={684}
              height={1223}
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="h-[88%] w-auto drop-shadow-[0_20px_34px_rgba(23,35,28,0.22)]"
            />
          </div>

          <div>
            <p className="micro">{product.label}</p>
            <h1 className="mt-4 text-[length:var(--text-h2)]">{product.name}</h1>

            <p className="mt-4 text-[1.375rem] font-medium tracking-[-0.03em]">
              {formatInr(product.pricePaise)}
            </p>

            <p className="lede mt-5 max-w-[46ch]">{product.description}</p>

            <AddToCartForm
              productId={product.id}
              basePaise={product.pricePaise}
              brands={brands.map((b) => ({
                id: b.id,
                name: b.name,
                models: b.models.map((m) => ({
                  id: m.id,
                  name: m.name,
                  extraPaise: m.extraPaise,
                })),
              }))}
            />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="bg-cream pb-20">
          <div className="shell">
            <h2 className="text-[length:var(--text-h3)]">
              More from {product.collection}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/shop/${r.slug}`} className="group block">
                    <div
                      className="flex aspect-[352/420] items-center justify-center overflow-hidden rounded-[20px]"
                      style={{ backgroundColor: r.tint }}
                    >
                      <Image
                        src={r.image}
                        alt={r.name}
                        width={684}
                        height={1223}
                        sizes="(max-width: 1024px) 44vw, 300px"
                        className="h-[86%] w-auto transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                    </div>
                    <h3 className="mt-4">{r.name}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
