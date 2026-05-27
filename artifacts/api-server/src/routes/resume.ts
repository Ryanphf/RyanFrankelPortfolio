import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";
import { GetResumeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const RESUME_DIR = path.join(process.cwd(), "resume_files");
const RESUME_FILENAME = "resume.pdf";
const RESUME_PATH = path.join(RESUME_DIR, RESUME_FILENAME);

router.get("/resume", async (_req, res): Promise<void> => {
  const exists = fs.existsSync(RESUME_PATH);
  if (!exists) {
    res.json(GetResumeResponse.parse({
      hasResume: false,
      downloadUrl: null,
      fileName: null,
      updatedAt: null,
    }));
    return;
  }

  const stat = fs.statSync(RESUME_PATH);
  res.json(GetResumeResponse.parse({
    hasResume: true,
    downloadUrl: "/api/resume/download",
    fileName: RESUME_FILENAME,
    updatedAt: stat.mtime.toISOString(),
  }));
});

router.get("/resume/download", (_req, res): void => {
  if (!fs.existsSync(RESUME_PATH)) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  res.download(RESUME_PATH, RESUME_FILENAME);
});

router.get("/resume/view", (_req, res): void => {
  if (!fs.existsSync(RESUME_PATH)) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=resume.pdf");
  fs.createReadStream(RESUME_PATH).pipe(res);
});

export default router;
