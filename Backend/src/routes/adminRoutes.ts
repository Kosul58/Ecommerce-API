import express from "express";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData.js";
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

adminRoutes.get("/cloudFile", adminController.getCloudFile);
adminRoutes.get("/cloudFiles", adminController.getCloudFiles);
adminRoutes.get("/data", adminController.getFileData);
adminRoutes.get("/url", adminController.getSignedURL);
adminRoutes.delete("/one", adminController.deleteCloudFile);
adminRoutes.delete("/all", adminController.deleteCloudFiles);
adminRoutes.put("/", adminController.renameCloudFile);

export default adminRoutes;
