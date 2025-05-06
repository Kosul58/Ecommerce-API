import express from "express";
import CategoryController from "../controllers/categoryController.js";
import verifyRole from "../middlewares/verifyRole.js";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData.js";
import {
  categoryParamsSchema,
  createSchema,
  StatusSchema,
  updateSchema,
} from "../validation/catagorySchema.js";
const categoryRoutes = express.Router();

const categoryController = container.resolve(CategoryController);

const dataValidation = container.resolve(DataValidation);
// Create category
categoryRoutes.post(
  "/",
  verifyRole.verify("Admin"),
  dataValidation.validateBody(createSchema),
  categoryController.createCategory
);

// Read category
categoryRoutes.get(
  "/sub/:categoryid",
  verifyRole.verify("Admin"),
  categoryController.findSub
);
categoryRoutes.get(
  "/",
  verifyRole.verify("Admin"),
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
  categoryController.updateStatus
);
categoryRoutes.put(
  "/:categoryid",
  verifyRole.verify("Admin"),
  dataValidation.validateParams(categoryParamsSchema),
  dataValidation.validateBody(updateSchema),
  categoryController.updateCategory
);

// Delete category
categoryRoutes.delete(
  "/:categoryid",
  verifyRole.verify("Admin"),
  dataValidation.validateParams(categoryParamsSchema),
  categoryController.deleteCategory
);

export default categoryRoutes;
