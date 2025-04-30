// routes/userRoutes.ts
import express from "express";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import { container } from "tsyringe";
import SellerController from "../controllers/sellerController.js";
import DataValidation from "../middleware/validateData.js";
import { idSchema } from "../validation/userSchema.js";
import {
  signInSchema,
  signUpSchema,
  updateSchema,
} from "../validation/sellerSchema.js";
const sellerController = container.resolve(SellerController);
const dataValidation = container.resolve(DataValidation);
const sellerRoutes = express.Router();
sellerRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  sellerController.getSeller
);
sellerRoutes.get(
  "/sellers",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  sellerController.getSellers
);
sellerRoutes.post(
  "/signup",
  dataValidation.validateBody(signUpSchema),
  sellerController.signUp
);
sellerRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  sellerController.signIn
);
sellerRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("Seller", "Admin"),
  dataValidation.validateBody(updateSchema),
  sellerController.updateSeller
);
sellerRoutes.delete(
  "/:sellerid",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  sellerController.deleteSeller
);

export default sellerRoutes;
