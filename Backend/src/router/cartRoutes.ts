import express from "express";
import CartController from "../controllers/cartController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
import { idSchema } from "../schemas/userSchema.js";
import {
  addCartSchema,
  removeProductSchema,
  removeProductsSchema,
  updateSchema,
  viewCartParamsSchema,
  viewUserCartParamsSchema,
} from "../schemas/cartSchema.js";
const cartRoutes = express.Router();

const cartController = container.resolve(CartController);
const dataValidation = container.resolve(DataValidation);
// Create cart item
cartRoutes.post(
  "/",
  verifyRole.verify("User", "Admin"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(addCartSchema),
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
  verifyRole.verify("User", "Admin"),
  cartController.viewCartProducts
);

// View all products in a user's cart
cartRoutes.get(
  "/:userid",
  verifyRole.verify("User"),
  dataValidation.validateParams(viewUserCartParamsSchema),
  cartController.viewCart
);

// View specific product in a user's cart
cartRoutes.get(
  "/:userid/:productid",
  verifyRole.verify("User"),
  dataValidation.validateParams(viewCartParamsSchema),
  cartController.viewCartProduct
);

// Update product in cart
cartRoutes.put(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateBody(updateSchema),
  cartController.updateProduct
);

// Delete specific product from cart
cartRoutes.delete(
  "/:userid/:productid",
  verifyRole.verify("User"),
  dataValidation.validateBody(removeProductSchema),
  cartController.removeProduct
);

// Delete multiple products from a user's cart
cartRoutes.delete(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateBody(removeProductsSchema),
  cartController.removeProducts
);

export default cartRoutes;
