import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminLoginResponse, AdminLogoutResponse, GetAdminMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme";

router.get("/admin/me", async (req, res): Promise<void> => {
  const isAdmin = (req as any).session?.isAdmin === true;
  res.json(GetAdminMeResponse.parse({ isAdmin }));
});

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  (req as any).session.isAdmin = true;
  res.json(AdminLoginResponse.parse({ isAdmin: true }));
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  (req as any).session.isAdmin = false;
  res.json(AdminLogoutResponse.parse({ isAdmin: false }));
});

export default router;
