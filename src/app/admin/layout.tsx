import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

const TABS = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/products", label: "Products" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // The real gate. Middleware only checks that *someone* is signed in;
  // this is what keeps customers out of the studio.
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/account");

  return (
    <div className="min-h-dvh bg-cream">
      <header className="bg-ink text-cream">
        {/* Two rows on phones so nothing wraps mid-word; one row from sm up. */}
        <div className="shell flex flex-col gap-3 py-3 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
          <div className="flex items-center justify-between gap-6 sm:justify-start sm:gap-8">
            <Link
              href="/admin"
              className="whitespace-nowrap font-medium tracking-[-0.02em] text-lime"
            >
              EC STUDIO
            </Link>
            <div className="flex items-center gap-5 sm:hidden">
              <Link href="/" className="micro whitespace-nowrap normal-case">
                View shop
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="micro whitespace-nowrap normal-case underline underline-offset-4"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <nav
            aria-label="Admin"
            className="flex items-center gap-6 sm:order-first sm:ml-2"
          >
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="micro whitespace-nowrap normal-case"
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/" className="micro whitespace-nowrap normal-case">
              View shop
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="micro whitespace-nowrap normal-case underline underline-offset-4"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>
    </div>
  );
}
