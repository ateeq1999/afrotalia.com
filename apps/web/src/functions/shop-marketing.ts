import { category, product } from "@afrotalia/db/schema/shop";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq, sql } from "drizzle-orm";

import { getDb } from "@/services";

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export const listShopCategories = createServerFn({ method: "GET" }).handler(async (): Promise<ShopCategory[]> => {
  const rows = await getDb()
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: sql<number>`count(${product.id})`.mapWith(Number),
    })
    .from(category)
    .leftJoin(product, eq(product.categoryId, category.id))
    .groupBy(category.id)
    .orderBy(asc(category.name));
  return rows;
});
