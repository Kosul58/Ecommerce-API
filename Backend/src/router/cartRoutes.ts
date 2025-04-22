import express from "express";
import CartController from "../controllers/cartController.js";

const cartRoutes = express.Router();

// Create cart item
cartRoutes.post("/", CartController.addProduct);

// View all carts (for all users)
cartRoutes.get("/", CartController.viewCartProducts);

// View all products in a user's cart
cartRoutes.get("/:userid", CartController.viewCart);

// View specific product in a user's cart
cartRoutes.get("/:userid/:productid", CartController.viewCartProduct);

// Update product in cart
cartRoutes.put("/", CartController.updateProduct);

// Delete specific product from cart
cartRoutes.delete("/:userid/:productid", CartController.removeProduct);

// Delete multiple products from a user's cart
cartRoutes.delete("/", CartController.removeProducts);

// Calculate total cart price for a user
cartRoutes.get("/total/:id", CartController.calcTotal);

export default cartRoutes;
