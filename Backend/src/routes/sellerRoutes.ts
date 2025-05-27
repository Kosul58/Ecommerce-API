import express from "express";
import verifyRole from "../middlewares/verifyRole";
import verifyToken from "../middlewares/verifyToken";
import { container } from "tsyringe";
import SellerController from "../controllers/sellerController";
import DataValidation from "../middlewares/validateData";
import { idSchema } from "../validation/userSchema";
import {
  signInSchema,
  signUpSchema,
  updateSchema,
} from "../validation/sellerSchema";
import { createAudit } from "../middlewares/auditMiddleware";
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
  // upload.single("image"),
  dataValidation.validateBody(signUpSchema),
  createAudit({ action: "signup seller" }),
  sellerController.signUp
);

sellerRoutes.post(
  "/verifySeller",
  createAudit({ action: "verify seller" }),
  sellerController.verifySeller
);

sellerRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  createAudit({ action: "signin seller" }),
  sellerController.signIn
);

sellerRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("Seller"),
  dataValidation.validateBody(updateSchema),
  createAudit({ action: "update seller" }),
  sellerController.updateSeller
);

sellerRoutes.delete(
  "/:sellerid",
  verifyToken.verify,
  verifyRole.verify("Admin", "Seller"),
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "delete seller" }),
  sellerController.deleteSeller
);

export default sellerRoutes;
