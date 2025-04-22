import express from "express";
import CategoryController from "../controllers/categoryController.js";
const categoryRoutes = express.Router();

// Create category
categoryRoutes.post("/", CategoryController.createCategory);

// Read category
categoryRoutes.get("/", CategoryController.readCategories);
categoryRoutes.get("/:id", CategoryController.readCategory);

// Update category
categoryRoutes.put("/:id", CategoryController.updateCategory);

// Delete category
categoryRoutes.delete("/:id", CategoryController.deleteCategory);

export default categoryRoutes;
