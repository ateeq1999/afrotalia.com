import { describe, expect, it } from "vitest";

import { computeItemsTotal, computeLineTotal, computeOrderTotal, outOfStockLines } from "./cart-rules";

describe("computeLineTotal", () => {
  it("multiplies unit price by quantity", () => {
    expect(computeLineTotal({ unitPrice: 15_000, quantity: 3 })).toBe(45_000);
  });
});

describe("computeItemsTotal", () => {
  it("sums line totals across the cart", () => {
    const total = computeItemsTotal([
      { unitPrice: 10_000, quantity: 2 },
      { unitPrice: 5_000, quantity: 1 },
    ]);
    expect(total).toBe(25_000);
  });

  it("is zero for an empty cart", () => {
    expect(computeItemsTotal([])).toBe(0);
  });
});

describe("computeOrderTotal", () => {
  it("adds the delivery fee on top of the items total", () => {
    const result = computeOrderTotal([{ unitPrice: 20_000, quantity: 2 }], 5_000);
    expect(result).toEqual({ itemsTotal: 40_000, deliveryFee: 5_000, total: 45_000 });
  });
});

describe("outOfStockLines", () => {
  it("flags lines whose quantity exceeds stock", () => {
    const lines = [
      { productId: "a", productName: "A", unitPrice: 1000, quantity: 2, stock: 1 },
      { productId: "b", productName: "B", unitPrice: 1000, quantity: 1, stock: 5 },
    ];
    expect(outOfStockLines(lines).map((l) => l.productId)).toEqual(["a"]);
  });

  it("returns an empty array when everything is in stock", () => {
    const lines = [{ productId: "a", productName: "A", unitPrice: 1000, quantity: 1, stock: 1 }];
    expect(outOfStockLines(lines)).toEqual([]);
  });
});
