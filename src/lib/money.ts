/**
 * Money is stored and passed around in paise (integers) everywhere.
 * It is only turned into rupees at the point of display.
 */
export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

export const FREE_SHIPPING_OVER_PAISE = 99900;
export const SHIPPING_PAISE = 7900;

export function shippingFor(subtotalPaise: number): number {
  if (subtotalPaise === 0) return 0;
  return subtotalPaise >= FREE_SHIPPING_OVER_PAISE ? 0 : SHIPPING_PAISE;
}
