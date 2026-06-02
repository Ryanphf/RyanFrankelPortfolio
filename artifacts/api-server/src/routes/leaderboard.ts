import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, leaderboardTable } from "@workspace/db";
import {
  GetLeaderboardParams,
  GetLeaderboardResponse,
  GetLeaderboardResponseItem,
  SubmitScoreBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard/:game", async (req, res): Promise<void> => {
  const { game } = GetLeaderboardParams.parse(req.params);
  const entries = await db
    .select()
    .from(leaderboardTable)
    .where(eq(leaderboardTable.game, game))
    .orderBy(desc(leaderboardTable.score))
    .limit(10);
  res.json(GetLeaderboardResponse.parse(entries.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }))));
});

router.post("/leaderboard", async (req, res): Promise<void> => {
  const body = SubmitScoreBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { playerName, score, game } = body.data;
  const [entry] = await db
    .insert(leaderboardTable)
    .values({ playerName: playerName.trim(), score, game })
    .returning();
  res.status(201).json(GetLeaderboardResponseItem.parse({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));
});

export default router;
