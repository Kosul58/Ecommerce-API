import express from "express";
import CategoryController from "../controllers/categoryController.js";
import verifyRole from "../middleware/verifyRole.js";
const categoryRoutes = express.Router();

// Create category
categoryRoutes.post(
  "/",
  verifyRole.verify("Seller", "Admin"),
  CategoryController.createCategory
);

// Read category
categoryRoutes.get(
  "/",
  verifyRole.verify("Seller", "Admin"),
  CategoryController.readCategories
);
categoryRoutes.get(
  "/:id",
  verifyRole.verify("Seller", "Admin"),
  CategoryController.readCategory
);

// Update category
categoryRoutes.put(
  "/:id",
  verifyRole.verify("Seller", "Admin"),
  CategoryController.updateCategory
);

// Delete category
categoryRoutes.delete(
  "/:id",
  verifyRole.verify("Seller", "Admin"),
  CategoryController.deleteCategory
);

export default categoryRoutes;
