import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { HeaderNav } from "./HeaderNav";

/**
 * Server shell: resolves session + cart count, then hands presentation to
 * the client component that owns the mobile menu state.
 */
export async function SiteHeader() {
  const [session, cart] = await Promise.all([auth(), getCart()]);
  const { count } = cartTotals(cart);

  return (
    <HeaderNav
      cartCount={count}
      isSignedIn={Boolean(session?.user)}
      isAdmin={session?.user?.role === "ADMIN"}
      name={session?.user?.name ?? null}
    />
  );
}
