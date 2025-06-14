import express from "express";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData";
import { idSchema, signInSchema, signUpSchema } from "../validation/userSchema";
import AdminController from "../controllers/adminController";
import { createAudit } from "../middlewares/auditMiddleware";
import verifyToken from "../middlewares/verifyToken";
import verifyRole from "../middlewares/verifyRole";

const adminController = container.resolve(AdminController);
const dataValidation = container.resolve(DataValidation);
const adminRoutes = express.Router();

// Admin signup
adminRoutes.post(
  "/signup",
  // upload.single("image"),
  dataValidation.validateBody(signUpSchema),
  createAudit({ action: "admin signup" }),
  adminController.signUp
);

// Admin signup
adminRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  createAudit({ action: "admin signin" }),
  adminController.signIn
);

adminRoutes.post(
  "/verifyadmin",
  createAudit({ action: "verify admin" }),
  adminController.verifyAdmin
);

adminRoutes.post(
  "/signout",
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "signout admin" }),
  adminController.signOut
);

// genereate new access token
adminRoutes.post("/refreshtoken", adminController.refreshToken);

adminRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  adminController.getAdmin
);

// Get one cloud file
adminRoutes.get(
  "/cloudFile",
  createAudit({ action: "get cloud file" }),
  adminController.getCloudFile
);

// Get all cloud files
adminRoutes.get(
  "/cloudFiles",
  createAudit({ action: "get all cloud files" }),
  adminController.getCloudFiles
);

// Get file data
adminRoutes.get(
  "/data",
  createAudit({ action: "get file data" }),
  adminController.getFileData
);

// Get presigned URL
adminRoutes.get(
  "/url",
  createAudit({ action: "get presigned URL" }),
  adminController.getPresignedURL
);

// Delete one file
adminRoutes.delete(
  "/one",
  createAudit({ action: "delete one cloud file" }),
  adminController.deleteCloudFile
);

// Delete all files
adminRoutes.delete(
  "/all",
  createAudit({ action: "delete all cloud files" }),
  adminController.deleteCloudFiles
);

// Rename file
adminRoutes.put(
  "/",
  createAudit({ action: "rename cloud file" }),
  adminController.renameCloudFile
);

export default adminRoutes;
