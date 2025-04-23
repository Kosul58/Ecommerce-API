import express from "express";

import orderRoutes from "./orderRoutes.js";
import cartRoutes from "./cartRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import userRouter from "./userRoutes.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();

router.use("/order", verifyToken.verify, orderRoutes);
router.use("/cart", verifyToken.verify, cartRoutes);
router.use("/product", productRoutes);
router.use("/category", verifyToken.verify, categoryRoutes);
router.use("/user", userRouter);

export default router;
