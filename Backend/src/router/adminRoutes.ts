import express from "express";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
import { signUpSchema } from "../validation/userSchema.js";
import AdminController from "../controllers/adminController.js";
const adminController = container.resolve(AdminController);
const dataValidation = container.resolve(DataValidation);
const adminRoutes = express.Router();
adminRoutes.post(
  "/signup",
  dataValidation.validateBody(signUpSchema),
  adminController.signUp
);

export default adminRoutes;
