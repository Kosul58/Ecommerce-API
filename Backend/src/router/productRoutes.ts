import express from "express";
import ProductController from "../controllers/productController.js";

const productRoutes = express.Router();

// Create product
productRoutes.post("/", ProductController.addProduct);
productRoutes.post("/addbatch", ProductController.addProducts);

// Read product(s)
productRoutes.get("/", ProductController.getProducts);
productRoutes.get("/:id", ProductController.getProductById);

// Update product
productRoutes.put("/:id", ProductController.updateProduct);

// Delete product
productRoutes.delete("/:id", ProductController.deleteProduct);

// Modify inventory
productRoutes.put("/modify/:id", ProductController.modifyInventory);

export default productRoutes;
