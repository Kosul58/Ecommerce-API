import express from "express";

import orderRoutes from "./orderRoutes";
import cartRoutes from "./cartRoutes";
import productRoutes from "./productRoutes";
import categoryRoutes from "./categoryRoutes";
import userRoutes from "./userRoutes";
import verifyToken from "../middlewares/verifyToken";
import sellerRoutes from "./sellerRoutes";
import adminRoutes from "./adminRoutes";
import mailRoutes from "./mailRoutes";
import otpRoutes from "./otpRoutes";
import discountRoutes from "./discountRotes";
const router = express.Router();

router.use("/order", verifyToken.verify, orderRoutes);
router.use("/cart", verifyToken.verify, cartRoutes);
router.use("/product", productRoutes);
router.use("/category", verifyToken.verify, categoryRoutes);
router.use("/user", userRoutes);
router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/mail", mailRoutes);
router.use("/otp", otpRoutes);
router.use("/discount", discountRoutes);

export default router;
