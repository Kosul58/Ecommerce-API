import express from "express";
import CartController from "../controllers/cartController.js";
import verifyRole from "../middlewares/verifyRole.js";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData.js";
import { idSchema } from "../validation/userSchema.js";
import {
  addCartSchema,
  removeProductsSchema,
  updateSchema,
  viewCartParamsSchema,
} from "../validation/cartSchema.js";
import { createAudit } from "../middlewares/auditMiddleware.js";

const cartRoutes = express.Router();

const cartController = container.resolve(CartController);
const dataValidation = container.resolve(DataValidation);

// Create cart item
cartRoutes.post(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(addCartSchema),
  createAudit({ action: "add to cart" }),
  cartController.addProduct
);

// Calculate total cart price for a user
cartRoutes.get(
  "/total",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  cartController.calcTotal
);

// View all carts (for all users)
cartRoutes.get(
  "/",
  verifyRole.verify("Admin"),
  cartController.viewCartProducts
);

// View all products in a user's cart
cartRoutes.get("/user", verifyRole.verify("User"), cartController.viewCart);

// View specific product in a user's cart
cartRoutes.get(
  "/user/:productid",
  verifyRole.verify("User"),
  dataValidation.validateParams(viewCartParamsSchema),
  cartController.viewCartProduct
);

// Update product in cart
cartRoutes.put(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateBody(updateSchema),
  createAudit({ action: "update cart" }),
  cartController.updateProduct
);

// Delete specific product from cart
cartRoutes.delete(
  "/:productid",
  verifyRole.verify("User"),
  createAudit({ action: "remove from cart" }),
  cartController.removeProduct
);

// Delete multiple products from a user's cart
cartRoutes.delete(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateBody(removeProductsSchema),
  createAudit({ action: "remove multiple from cart" }),
  cartController.removeProducts
);

export default cartRoutes;
