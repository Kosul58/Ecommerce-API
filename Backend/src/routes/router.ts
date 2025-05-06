import express from "express";

import orderRoutes from "./orderRoutes.js";
import cartRoutes from "./cartRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import userRoutes from "./userRoutes.js";
import verifyToken from "../middlewares/verifyToken.js";
import sellerRoutes from "./sellerRoutes.js";
import adminRoutes from "./adminRoutes.js";
import mailRoutes from "./mailRoutes.js";
const router = express.Router();

router.use("/order", verifyToken.verify, orderRoutes);
router.use("/cart", verifyToken.verify, cartRoutes);
router.use("/product", productRoutes);
router.use("/category", verifyToken.verify, categoryRoutes);
router.use("/user", userRoutes);
router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/mail", mailRoutes);

export default router;
