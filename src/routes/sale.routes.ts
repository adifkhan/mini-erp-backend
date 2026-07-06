import { Router } from "express";
import {
  createSale,
  getSales,
  getSaleById,
} from "../controllers/sale.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createSaleSchema,
  saleIdParamSchema,
} from "../validations/sale.validation";

const router = Router();

router.use(protect);

// Create Sale: Admin, Manager, Employee
router.post(
  "/",
  authorize("admin", "manager", "employee"),
  validate(createSaleSchema),
  createSale,
);

// Sale history / reporting: Admin, Manager
router.get("/", authorize("admin", "manager"), getSales);
router.get(
  "/:id",
  authorize("admin", "manager"),
  validate(saleIdParamSchema),
  getSaleById,
);

export default router;
