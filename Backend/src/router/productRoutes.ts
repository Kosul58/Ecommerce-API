import express from "express";
import ProductController from "../controllers/productController.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
const productRoutes = express.Router();

// Create product
productRoutes.post(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  ProductController.addProduct
);
productRoutes.post(
  "/addbatch",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  ProductController.addProducts
);

// Read product(s)
productRoutes.get("/", ProductController.getProducts);
productRoutes.get("/:id", ProductController.getProductById);

// Update product
productRoutes.put(
  "/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  ProductController.updateProduct
);

// Delete product
productRoutes.delete(
  "/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  ProductController.deleteProduct
);

// Modify inventory
productRoutes.put(
  "/modify/:id",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  ProductController.modifyInventory
);

export default productRoutes;
