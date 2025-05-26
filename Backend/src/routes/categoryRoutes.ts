import express from "express";
import CategoryController from "../controllers/categoryController";
import verifyRole from "../middlewares/verifyRole";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData";
import {
  categoryParamsSchema,
  createSchema,
  StatusSchema,
  updateSchema,
} from "../validation/catagorySchema";
import { createAudit } from "../middlewares/auditMiddleware";

const categoryRoutes = express.Router();

const categoryController = container.resolve(CategoryController);
const dataValidation = container.resolve(DataValidation);

// Create category
categoryRoutes.post(
  "/",
  verifyRole.verify("Admin"),
  dataValidation.validateBody(createSchema),
  createAudit({ action: "create category" }),
  categoryController.createCategory
);

// Read category
categoryRoutes.get(
  "/list",
  verifyRole.verify("Admin", "Seller"),
  categoryController.categoryList
);
categoryRoutes.get(
  "/sub/:categoryid",
  verifyRole.verify("Admin"),
  categoryController.findSub
);
categoryRoutes.get(
  "/",
  verifyRole.verify("Admin", "Seller"),
  categoryController.readCategories
);
categoryRoutes.get(
  "/:categoryid",
  verifyRole.verify("Admin"),
  dataValidation.validateParams(categoryParamsSchema),
  categoryController.readCategory
);

// Update category
categoryRoutes.put(
  "/status",
  verifyRole.verify("Admin"),
  dataValidation.validateBody(StatusSchema),
  createAudit({ action: "update category status" }),
  categoryController.updateStatus
);

categoryRoutes.put(
  "/:categoryid",
  verifyRole.verify("Admin"),
  dataValidation.validateParams(categoryParamsSchema),
  dataValidation.validateBody(updateSchema),
  createAudit({ action: "update category" }),
  categoryController.updateCategory
);

// Delete category
categoryRoutes.delete(
  "/:categoryid",
  verifyRole.verify("Admin"),
  dataValidation.validateParams(categoryParamsSchema),
  createAudit({ action: "delete category" }),
  categoryController.deleteCategory
);

export default categoryRoutes;
