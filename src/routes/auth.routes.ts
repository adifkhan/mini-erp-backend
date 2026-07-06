import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validations/auth.validation";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
