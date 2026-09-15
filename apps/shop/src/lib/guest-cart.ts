/**
 * Guest cart: browser localStorage only, merged into the DB cart on sign-in
 * (see `/cart`'s loader). Signed-in users never touch this — their cart
 * lives entirely server-side (`functions/cart.ts`).
 */

const GUEST_CART_KEY = "afrotalia-shop-guest-cart";

export interface GuestCartLine {
  productId: string;
  productName: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
}

export function readGuestCart(): GuestCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const GUEST_CART_EVENT = "afrotalia-shop-guest-cart-updated";

function writeGuestCart(lines: GuestCartLine[]): GuestCartLine[] {
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing / quota exceeded — cart just won't persist across reloads.
  }
  window.dispatchEvent(new CustomEvent(GUEST_CART_EVENT));
  return lines;
}

export function clearGuestCart(): void {
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

export function addToGuestCart(
  product: { id: string; name: string; slug: string; image: string | null; price: number; stock: number },
  quantity: number,
): GuestCartLine[] {
  const lines = readGuestCart();
  const existing = lines.find((l) => l.productId === product.id);
  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    existing.stock = product.stock;
    existing.unitPrice = product.price;
  } else {
    lines.push({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.image,
      unitPrice: product.price,
      stock: product.stock,
      quantity: Math.min(product.stock, quantity),
    });
  }
  return writeGuestCart(lines);
}

export function setGuestCartQuantity(productId: string, quantity: number): GuestCartLine[] {
  const lines = readGuestCart();
  if (quantity <= 0) return writeGuestCart(lines.filter((l) => l.productId !== productId));
  const existing = lines.find((l) => l.productId === productId);
  if (existing) existing.quantity = Math.min(existing.stock, quantity);
  return writeGuestCart(lines);
}

export function removeFromGuestCart(productId: string): GuestCartLine[] {
  return writeGuestCart(readGuestCart().filter((l) => l.productId !== productId));
}
