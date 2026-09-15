import { category, product } from "@afrotalia/db/schema/shop";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/services";

const SORTS = ["newest", "price-asc", "price-desc", "name"] as const;
export type ProductSort = (typeof SORTS)[number];

const listProductsSchema = z.object({
  search: z.string().trim().max(200).optional(),
  categorySlug: z.string().max(200).optional(),
  condition: z.enum(["NEW", "USED", "NOT_WORKING"]).optional(),
  sort: z.enum(SORTS).default("newest"),
});

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  condition: "NEW" | "USED" | "NOT_WORKING";
  isWorking: boolean;
  price: number;
  stock: number;
  categoryName: string;
}

export interface ProductListResult {
  products: ProductListItem[];
  categories: { name: string; slug: string }[];
}

export const listProducts = createServerFn({ method: "GET" })
  .validator(listProductsSchema)
  .handler(async ({ data }): Promise<ProductListResult> => {
    const db = getDb();
    const categories = await db.select({ name: category.name, slug: category.slug }).from(category).orderBy(asc(category.name));

    const conditions = [];
    if (data.search) conditions.push(ilike(product.name, `%${data.search}%`));
    if (data.condition) conditions.push(eq(product.condition, data.condition));
    if (data.categorySlug) {
      const matched = categories.find((c) => c.slug === data.categorySlug);
      if (matched) {
        const [row] = await db.select({ id: category.id }).from(category).where(eq(category.slug, data.categorySlug)).limit(1);
        if (row) conditions.push(eq(product.categoryId, row.id));
      }
    }

    const orderBy =
      data.sort === "price-asc"
        ? asc(product.price)
        : data.sort === "price-desc"
          ? desc(product.price)
          : data.sort === "name"
            ? asc(product.name)
            : desc(product.createdAt);

    const rows = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        condition: product.condition,
        isWorking: product.isWorking,
        price: product.price,
        stock: product.stock,
        categoryName: category.name,
      })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderBy);

    return { products: rows, categories };
  });

const getProductSchema = z.object({ slug: z.string().min(1) });

export interface ProductDetail extends ProductListItem {
  description: string;
  sku: string;
  categorySlug: string;
}

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator(getProductSchema)
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const db = getDb();
    const [row] = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        condition: product.condition,
        price: product.price,
        stock: product.stock,
        description: product.description,
        sku: product.sku,
        isWorking: product.isWorking,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(product)
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.slug, data.slug))
      .limit(1);
    return row ?? null;
  });
