import express from "express";
import ProductController from "../controllers/productController.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import { container } from "tsyringe";
const productRoutes = express.Router();

const productController = container.resolve(ProductController);

// Create product
productRoutes.post(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.addProduct
);
productRoutes.post(
  "/addbatch",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.addProducts
);

// Read product(s)
productRoutes.get("/", productController.getProducts);
productRoutes.get("/:id", productController.getProductById);

// Update product
productRoutes.put(
  "/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.updateProduct
);

// Delete product
productRoutes.delete(
  "/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.deleteProduct
);

// Modify inventory
productRoutes.put(
  "/modify/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.modifyInventory
);

export default productRoutes;
