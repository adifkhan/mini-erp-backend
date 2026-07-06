import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from "../validations/customer.validation";

const router = Router();

router.use(protect);

// View: Admin, Manager, Employee (employee needs this to pick a customer when creating a sale)
router.get("/", getCustomers);
router.get("/:id", validate(customerIdParamSchema), getCustomerById);

// Manage: Admin, Manager only
router.post("/", authorize("admin", "manager"), validate(createCustomerSchema), createCustomer);
router.put("/:id", authorize("admin", "manager"), validate(updateCustomerSchema), updateCustomer);
router.delete("/:id", authorize("admin", "manager"), deleteCustomer);

export default router;
