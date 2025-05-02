import express from "express";
import CartController from "../controllers/cartController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
import { idSchema } from "../validation/userSchema.js";
import {
  addCartSchema,
  removeProductsSchema,
  updateSchema,
  viewCartParamsSchema,
  viewUserCartParamsSchema,
} from "../validation/cartSchema.js";
const cartRoutes = express.Router();

const cartController = container.resolve(CartController);
const dataValidation = container.resolve(DataValidation);
// Create cart item
cartRoutes.post(
  "/",
  verifyRole.verify("User"),
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
  cartController.updateProduct
);

// Delete specific product from cart
cartRoutes.delete(
  "/:productid",
  verifyRole.verify("User"),
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
