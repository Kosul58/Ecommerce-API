import express from "express";
import verifyRole from "../middlewares/verifyRole.js";
import verifyToken from "../middlewares/verifyToken.js";
import UserController from "../controllers/userController.js";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData.js";
import {
  idSchema,
  signInSchema,
  signUpSchema,
  updateSchema,
} from "../validation/userSchema.js";
import { createAudit } from "../middlewares/auditMiddleware.js";

const userController = container.resolve(UserController);
const dataValidation = container.resolve(DataValidation);
const userRoutes = express.Router();

userRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "User"),
  dataValidation.validateTokenData(idSchema),
  userController.getUser
);

userRoutes.get(
  "/all",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  userController.getUsers
);

userRoutes.post(
  "/signup",
  dataValidation.validateBody(signUpSchema),
  createAudit({ action: "signup user" }),
  userController.signUp
);

userRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  createAudit({ action: "signin user" }),
  userController.signIn
);

userRoutes.delete(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("Admin", "User"),
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "delete user" }),
  userController.deleteUser
);

userRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(updateSchema),
  createAudit({ action: "update user" }),
  userController.updateUserInfo
);

export default userRoutes;
