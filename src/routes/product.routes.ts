import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { uploadProductImage } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "../validations/product.validation";

const router = Router();

// All product routes require authentication
router.use(protect);

// View: Admin, Manager, Employee
router.get("/", getProducts);
router.get("/:id", validate(productIdParamSchema), getProductById);

// Manage: Admin, Manager only
router.post(
  "/",
  authorize("admin", "manager"),
  uploadProductImage,
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  authorize("admin", "manager"),
  uploadProductImage,
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", authorize("admin", "manager"), deleteProduct);

export default router;
