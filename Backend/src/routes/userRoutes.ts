import express from "express";
import verifyRole from "../middlewares/verifyRole";
import verifyToken from "../middlewares/verifyToken";
import UserController from "../controllers/userController";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData";
import {
  idSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  updateSchema,
} from "../validation/userSchema";
import { createAudit } from "../middlewares/auditMiddleware";
import { upload } from "../middlewares/imageMiddleware";

const userController = container.resolve(UserController);
const dataValidation = container.resolve(DataValidation);
const userRoutes = express.Router();

userRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("User"),
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
  // upload.single("image"),
  dataValidation.validateBody(signUpSchema),
  createAudit({ action: "signup user" }),
  userController.signUp
);

userRoutes.post(
  "/verifyuser",
  createAudit({ action: "verify user" }),
  userController.verifyUser
);

userRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  createAudit({ action: "signin user" }),
  userController.signIn
);

userRoutes.post(
  "/signout",
  dataValidation.validateTokenData(idSchema),
  createAudit({ action: "signout user" }),
  userController.signOut
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
  upload.single("image"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(updateSchema),
  createAudit({ action: "update user" }),
  userController.updateUserInfo
);

userRoutes.put(
  "/changepassword",
  verifyToken.verify,
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(updatePasswordSchema),
  createAudit({ action: "update userpassword" }),
  userController.changePassword
);

export default userRoutes;
