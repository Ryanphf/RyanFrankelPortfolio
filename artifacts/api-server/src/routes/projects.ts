import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectsResponse,
  ListProjectsResponseItem,
  GetProjectResponse,
  UpdateProjectResponse,
  ListFeaturedProjectsResponse,
  GetProjectStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (_req, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));
  res.json(ListProjectsResponse.parse(projects.map(p => ({
    ...p,
    tags: p.tags ?? [],
    createdAt: p.createdAt.toISOString(),
  }))));
});

router.get("/projects/featured", async (_req, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.featured, true))
    .orderBy(projectsTable.order, desc(projectsTable.createdAt));
  res.json(ListFeaturedProjectsResponse.parse(projects.map(p => ({
    ...p,
    tags: p.tags ?? [],
    createdAt: p.createdAt.toISOString(),
  }))));
});

router.get("/projects/stats", async (_req, res): Promise<void> => {
  const allProjects = await db.select().from(projectsTable);
  const totalProjects = allProjects.length;
  const featuredCount = allProjects.filter(p => p.featured).length;

  const categoryMap = new Map<string, number>();
  for (const p of allProjects) {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));

  res.json(GetProjectStatsResponse.parse({ totalProjects, featuredCount, categories }));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse({
    ...project,
    tags: project.tags ?? [],
    createdAt: project.createdAt.toISOString(),
  }));
});

function isAdmin(req: any): boolean {
  return req.session?.isAdmin === true;
}

router.post("/projects", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tags, ...rest } = parsed.data;
  const [project] = await db
    .insert(projectsTable)
    .values({ ...rest, tags: tags ?? [] })
    .returning();

  res.status(201).json(ListProjectsResponseItem.parse({
    ...project,
    tags: project.tags ?? [],
    createdAt: project.createdAt.toISOString(),
  }));
});

router.put("/projects/:id", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set(parsed.data)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(UpdateProjectResponse.parse({
    ...project,
    tags: project.tags ?? [],
    createdAt: project.createdAt.toISOString(),
  }));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
