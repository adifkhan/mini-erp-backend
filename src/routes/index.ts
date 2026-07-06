import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import customerRoutes from "./customer.routes";
import saleRoutes from "./sale.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/sales", saleRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
