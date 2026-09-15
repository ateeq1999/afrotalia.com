import { cmsPage, project, service } from "@afrotalia/db/schema/web";
import { createServerFn } from "@tanstack/react-start";
import { asc, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/services";

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  summary: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image: string | null;
  clientName: string | null;
  outcome: string | null;
  completedAt: number | null;
}

export interface CmsBlock {
  slug: string;
  title: string | null;
  body: string | null;
}

export const listServices = createServerFn({ method: "GET" }).handler(async (): Promise<ServiceItem[]> => {
  return getDb().select({ id: service.id, name: service.name, slug: service.slug, summary: service.summary }).from(service).orderBy(asc(service.sortOrder));
});

export const listProjects = createServerFn({ method: "GET" }).handler(async (): Promise<ProjectItem[]> => {
  const rows = await getDb().select().from(project).orderBy(asc(project.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    image: row.image,
    clientName: row.clientName,
    outcome: row.outcome,
    completedAt: row.completedAt?.getTime() ?? null,
  }));
});

const getCmsBlocksSchema = z.object({ slugs: z.array(z.string()).min(1).max(50) });

/** Returns only the blocks that exist — callers render an empty state for any missing slug. */
export const getCmsBlocks = createServerFn({ method: "GET" })
  .validator(getCmsBlocksSchema)
  .handler(async ({ data }): Promise<Record<string, CmsBlock>> => {
    const rows = await getDb().select().from(cmsPage).where(inArray(cmsPage.slug, data.slugs));
    return Object.fromEntries(rows.map((row) => [row.slug, { slug: row.slug, title: row.title, body: row.body }]));
  });
