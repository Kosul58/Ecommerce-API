import express from "express";
import ProductController from "../controllers/productController";
import verifyRole from "../middlewares/verifyRole";
import verifyToken from "../middlewares/verifyToken";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData";
import { hideSchema, idSchema } from "../validation/userSchema";
import {
  addSchema,
  modifySchema,
  productParamsSchema,
  removeImageSchema,
} from "../validation/productSchema";
import { createAudit } from "../middlewares/auditMiddleware";
import { upload } from "../middlewares/imageMiddleware";

const productRoutes = express.Router();

const productController = container.resolve(ProductController);
const dataValidation = container.resolve(DataValidation);

// CREATE
productRoutes.post(
  "/",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  upload.array("images", 10),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(addSchema),
  createAudit({ action: "add product" }),
  productController.addProduct
);

productRoutes.post(
  "/addbatch",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "add batch products" }),
  productController.addProducts
);

productRoutes.post(
  "/image/:productid",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  upload.array("images", 10),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  createAudit({ action: "add product image" }),
  productController.addImage
);

// READ
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

// UPDATE
productRoutes.put(
  "/status",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(hideSchema),
  createAudit({ action: "update product status" }),
  productController.updateStatus
);

productRoutes.put(
  "/:productid",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  createAudit({ action: "update product" }),
  productController.updateProduct
);

productRoutes.put(
  "/modify/:productid",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  dataValidation.validateBody(modifySchema),
  createAudit({ action: "modify product inventory" }),
  productController.modifyInventory
);

// DELETE
productRoutes.delete(
  "/all",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "delete all products" }),
  productController.deleteProducts
);
productRoutes.delete(
  "/image",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(removeImageSchema),
  createAudit({ action: "delete product image" }),
  productController.removeImage
);
productRoutes.delete(
  "/:productid",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateParams(productParamsSchema),
  createAudit({ action: "delete a product" }),
  productController.deleteProduct
);

export default productRoutes;
