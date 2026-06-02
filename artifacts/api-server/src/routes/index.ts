import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import adminRouter from "./admin";
import resumeRouter from "./resume";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(adminRouter);
router.use(resumeRouter);
router.use(leaderboardRouter);

export default router;
