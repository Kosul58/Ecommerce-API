import express from "express";
import CategoryController from "../controllers/categoryController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
const categoryRoutes = express.Router();

const categoryController = container.resolve(CategoryController);
// Create category
categoryRoutes.post(
  "/",
  verifyRole.verify("Seller", "Admin"),
  categoryController.createCategory
);

// Read category
categoryRoutes.get(
  "/",
  verifyRole.verify("Seller", "Admin"),
  categoryController.readCategories
);
categoryRoutes.get(
  "/:categoryid",
  verifyRole.verify("Seller", "Admin"),
  categoryController.readCategory
);

// Update category
categoryRoutes.put(
  "/:categoryid",
  verifyRole.verify("Seller", "Admin"),
  categoryController.updateCategory
);

// Delete category
categoryRoutes.delete(
  "/:categoryid",
  verifyRole.verify("Seller", "Admin"),
  categoryController.deleteCategory
);

export default categoryRoutes;
