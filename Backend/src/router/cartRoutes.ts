import express from "express";
import CartController from "../controllers/cartController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
const cartRoutes = express.Router();

const cartController = container.resolve(CartController);
// Create cart item
cartRoutes.post(
  "/",
  verifyRole.verify("User", "Admin"),
  cartController.addProduct
);

// Calculate total cart price for a user
cartRoutes.get("/total", verifyRole.verify("User"), cartController.calcTotal);

// View all carts (for all users)
cartRoutes.get(
  "/",
  verifyRole.verify("User", "Admin"),
  cartController.viewCartProducts
);

// View all products in a user's cart
cartRoutes.get("/:userid", verifyRole.verify("User"), cartController.viewCart);

// View specific product in a user's cart
cartRoutes.get(
  "/:userid/:productid",
  verifyRole.verify("User"),
  cartController.viewCartProduct
);

// Update product in cart
cartRoutes.put("/", verifyRole.verify("User"), cartController.updateProduct);

// Delete specific product from cart
cartRoutes.delete(
  "/:userid/:productid",
  verifyRole.verify("User"),
  cartController.removeProduct
);

// Delete multiple products from a user's cart
cartRoutes.delete(
  "/",
  verifyRole.verify("User"),
  cartController.removeProducts
);

export default cartRoutes;
