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
  verifyRole.verify("Seller"),
  productController.addProduct
);
productRoutes.post(
  "/addbatch",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  productController.addProducts
);

// Read product(s)
productRoutes.get("/", productController.getProducts);
productRoutes.get(
  "/myproduct",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  productController.getProduct
);
productRoutes.get("/:id", productController.getProductById);

// Update product
productRoutes.put(
  "/:id",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  productController.updateProduct
);

// Delete product
productRoutes.delete(
  "/all",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  productController.deleteProducts
);

productRoutes.delete(
  "/:productid",
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
