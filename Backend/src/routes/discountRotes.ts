import express from "express";
import DiscountController from "../controllers/discountController";
import { container } from "tsyringe";
import verifyRole from "../middlewares/verifyRole";
import DataValidation from "../middlewares/validateData";
import { createSchema, deleteSchema } from "../validation/discountValidation";
import { idSchema } from "../validation/userSchema";
import verifyToken from "../middlewares/verifyToken";
const discountController = container.resolve(DiscountController);
const dataValidation = container.resolve(DataValidation);

const discountRoutes = express.Router();

discountRoutes.get("/", discountController.get);

discountRoutes.post(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(createSchema),
  discountController.create
);

discountRoutes.delete(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(deleteSchema),
  discountController.delete
);

export default discountRoutes;
