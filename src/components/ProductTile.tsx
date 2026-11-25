import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { formatInr } from "@/lib/money";

export function ProductTile({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div
        className="flex aspect-[352/420] items-center justify-center overflow-hidden rounded-[20px]"
        style={{ backgroundColor: product.tint }}
      >
        <Image
          src={product.image}
          alt={`${product.name} custom phone case`}
          width={684}
          height={1223}
          priority={priority}
          sizes="(max-width: 1024px) 45vw, 352px"
          style={{ transform: `rotate(${product.tilt}deg)` }}
          className="h-[86%] w-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <p className="micro mt-4 text-[0.6875rem] sm:mt-5 sm:text-[0.8125rem]">
        {product.label}
      </p>

      <div className="mt-1.5 flex items-start justify-between gap-2 sm:mt-2 sm:gap-4">
        <h3 className="text-[1.0625rem] sm:text-[length:var(--text-h3)]">
          {product.name}
        </h3>
        <span
          aria-hidden="true"
          className="shrink-0 text-base transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none sm:text-lg"
        >
          ↗
        </span>
      </div>

      <p className="mt-1 text-[0.875rem] tracking-[-0.02em] text-ink/70 sm:text-[0.9375rem]">
        {formatInr(product.pricePaise)}
      </p>
    </Link>
  );
}
