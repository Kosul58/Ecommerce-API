import express from "express";
import ProductController from "../controllers/productController.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
import { hideSchema, idSchema } from "../validation/userSchema.js";
import {
  modifySchema,
  productParamsSchema,
} from "../validation/productSchema.js";
const productRoutes = express.Router();

const productController = container.resolve(ProductController);
const dataValidation = container.resolve(DataValidation);
// Create product
productRoutes.post(
  "/",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  productController.addProduct
);
productRoutes.post(
  "/addbatch",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  productController.addProducts
);

// Read product(s)
productRoutes.get("/", productController.getProducts);
productRoutes.get(
  "/myproduct",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  productController.getSellerProducts
);
productRoutes.get(
  "/hiddenproduct",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  productController.getHiddenProducts
);
productRoutes.get("/:productid", productController.getProductById);

// Update product
productRoutes.put(
  "/status",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(hideSchema),
  productController.updateStatus
);

productRoutes.put(
  "/:productid",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  productController.updateProduct
);

// Delete product
productRoutes.delete(
  "/all",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  productController.deleteProducts
);

productRoutes.delete(
  "/:productid",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  productController.deleteProduct
);

// Modify inventory
productRoutes.put(
  "/modify/:productid",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  dataValidation.validateBody(modifySchema),
  productController.modifyInventory
);

export default productRoutes;
