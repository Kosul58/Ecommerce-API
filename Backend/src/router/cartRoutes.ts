import express from "express";
import CartController from "../controllers/cartController.js";
import verifyRole from "../middleware/verifyRole.js";
const cartRoutes = express.Router();

// Create cart item
cartRoutes.post(
  "/",
  verifyRole.verify("User", "Admin"),
  CartController.addProduct
);

// View all carts (for all users)
cartRoutes.get(
  "/",
  verifyRole.verify("User", "Admin"),
  CartController.viewCartProducts
);

// View all products in a user's cart
cartRoutes.get("/:userid", verifyRole.verify("User"), CartController.viewCart);

// View specific product in a user's cart
cartRoutes.get(
  "/:userid/:productid",
  verifyRole.verify("User"),
  CartController.viewCartProduct
);

// Update product in cart
cartRoutes.put("/", verifyRole.verify("User"), CartController.updateProduct);

// Delete specific product from cart
cartRoutes.delete(
  "/:userid/:productid",
  verifyRole.verify("User"),
  CartController.removeProduct
);

// Delete multiple products from a user's cart
cartRoutes.delete(
  "/",
  verifyRole.verify("User"),
  CartController.removeProducts
);

// Calculate total cart price for a user
cartRoutes.get(
  "/total/:id",
  verifyRole.verify("User"),
  CartController.calcTotal
);

export default cartRoutes;
