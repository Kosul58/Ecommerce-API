// routes/userRoutes.ts
import express from "express";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import { container } from "tsyringe";
import SellerController from "../controllers/sellerController.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
const sellerController = container.resolve(SellerController);
const sellerRoutes = express.Router();
sellerRoutes.use("/product", productRoutes);
sellerRoutes.use("/order", orderRoutes);
sellerRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  sellerController.getSeller
);
sellerRoutes.get(
  "/sellers",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  sellerController.getSellers
);
sellerRoutes.post("/signup", sellerController.signUp);
sellerRoutes.post("/signin", sellerController.signIn);
sellerRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("Seller", "Admin"),
  sellerController.updateSeller
);
sellerRoutes.delete(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  sellerController.deleteSeller
);

export default sellerRoutes;
