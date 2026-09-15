export interface CartLine {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  /** Current stock, for validation — not part of the total. */
  stock: number;
}

export function computeLineTotal(line: Pick<CartLine, "unitPrice" | "quantity">): number {
  return line.unitPrice * line.quantity;
}

export function computeItemsTotal(lines: Pick<CartLine, "unitPrice" | "quantity">[]): number {
  return lines.reduce((sum, line) => sum + computeLineTotal(line), 0);
}

export interface OrderTotal {
  itemsTotal: number;
  deliveryFee: number;
  total: number;
}

export function computeOrderTotal(lines: Pick<CartLine, "unitPrice" | "quantity">[], deliveryFee: number): OrderTotal {
  const itemsTotal = computeItemsTotal(lines);
  return { itemsTotal, deliveryFee, total: itemsTotal + deliveryFee };
}

/** Line items whose requested quantity exceeds current stock. */
export function outOfStockLines(lines: CartLine[]): CartLine[] {
  return lines.filter((line) => line.quantity > line.stock);
}
