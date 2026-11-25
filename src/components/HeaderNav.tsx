"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { label: "The designs", href: "/shop" },
  { label: "Make it yours", href: "/#make-it-yours" },
  { label: "Our story", href: "/#our-story" },
];

export function HeaderNav({
  cartCount,
  isSignedIn,
  isAdmin,
  name,
}: {
  cartCount: number;
  isSignedIn: boolean;
  isAdmin: boolean;
  name: string | null;
}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? name?.split(" ")[0] || "Account" : "Sign in";

  return (
    <header className="bg-cream">
      <div className="shell flex h-[88px] items-center justify-between gap-6 lg:h-[104px]">
        <Link
          href="/"
          className="whitespace-nowrap text-[1.0625rem] font-medium tracking-[-0.02em] sm:text-[1.25rem] lg:text-[1.5625rem]"
        >
          EXQUISITE CRAFT
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="micro normal-case">
              {item.label}
            </Link>
          ))}

          {isAdmin ? (
            <Link href="/admin" className="micro normal-case text-blue">
              Admin
            </Link>
          ) : null}

          <Link href={accountHref} className="micro normal-case">
            {accountLabel}
          </Link>

          <CartLink count={cartCount} />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <CartLink count={cartCount} />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 items-center justify-center"
          >
            <span className="relative block h-3.5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-ink transition-transform duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-ink transition-transform duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="bg-cream lg:hidden">
        <nav aria-label="Primary mobile" className="shell flex flex-col pb-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-t border-ink/15 py-4 text-2xl font-medium tracking-[-0.03em]"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="border-t border-ink/15 py-4 text-2xl font-medium tracking-[-0.03em] text-blue"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href={accountHref}
            onClick={() => setOpen(false)}
            className="border-y border-ink/15 py-4 text-2xl font-medium tracking-[-0.03em]"
          >
            {accountLabel}
          </Link>
          <Link href="/shop" onClick={() => setOpen(false)} className="pill mt-6 justify-center">
            Explore cases
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="pill !min-h-[44px] !gap-2 !py-2.5 !pl-5 !pr-4"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      Cart
      <span
        aria-hidden="true"
        className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-lime px-1.5 text-[0.75rem] font-semibold text-ink"
      >
        {count}
      </span>
    </Link>
  );
}
