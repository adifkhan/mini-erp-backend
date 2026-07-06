import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.use(protect);

//  Admin, Manager only
router.get("/stats", authorize("admin", "manager"), getDashboardStats);

export default router;
