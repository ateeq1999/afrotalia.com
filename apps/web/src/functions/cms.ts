import { cmsPage, project, service, teamMember } from "@afrotalia/db/schema/web";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/services";

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  preview: string;
  body: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  kind: string;
  summary: string;
  scope: string | null;
  image: string | null;
  clientName: string | null;
  outcome: string | null;
  featured: boolean;
  completedAt: number | null;
}

export interface CmsBlock {
  slug: string;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  portrait: string | null;
}

export const listServices = createServerFn({ method: "GET" }).handler(async (): Promise<ServiceItem[]> => {
  return getDb()
    .select({ id: service.id, name: service.name, slug: service.slug, preview: service.preview, body: service.body })
    .from(service)
    .orderBy(asc(service.sortOrder));
});

export const listProjects = createServerFn({ method: "GET" }).handler(async (): Promise<ProjectItem[]> => {
  const rows = await getDb().select().from(project).orderBy(asc(project.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    kind: row.kind,
    summary: row.summary,
    scope: row.scope,
    image: row.image,
    clientName: row.clientName,
    outcome: row.outcome,
    featured: row.featured,
    completedAt: row.completedAt?.getTime() ?? null,
  }));
});

export const listTeamMembers = createServerFn({ method: "GET" }).handler(async (): Promise<TeamMemberItem[]> => {
  const rows = await getDb()
    .select({ id: teamMember.id, name: teamMember.name, role: teamMember.role, bio: teamMember.bio, portrait: teamMember.portrait })
    .from(teamMember)
    .orderBy(asc(teamMember.sortOrder));
  return rows;
});

const getCmsBlocksSchema = z.object({ slugs: z.array(z.string()).min(1).max(50) });

/** Returns only the blocks that exist — callers render an empty state for any missing slug. */
export const getCmsBlocks = createServerFn({ method: "GET" })
  .validator(getCmsBlocksSchema)
  .handler(async ({ data }): Promise<Record<string, CmsBlock>> => {
    const rows = await getDb().select().from(cmsPage).where(inArray(cmsPage.slug, data.slugs));
    return Object.fromEntries(
      rows.map((row) => [row.slug, { slug: row.slug, eyebrow: row.eyebrow, title: row.title, body: row.body }]),
    );
  });

/** Single-block convenience wrapper around getCmsBlocks, for routes that only need one. */
export const getCmsBlock = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }): Promise<CmsBlock | null> => {
    const [row] = await getDb().select().from(cmsPage).where(eq(cmsPage.slug, data.slug)).limit(1);
    return row ? { slug: row.slug, eyebrow: row.eyebrow, title: row.title, body: row.body } : null;
  });
