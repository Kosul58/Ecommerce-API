// routes/userRoutes.ts
import express from "express";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import UserController from "../controllers/userController.js";
import { container } from "tsyringe";
// import UserValidation from "../middleware/userValidation.js";
import DataValidation from "../middleware/validateData.js";
import {
  idSchema,
  signInSchema,
  signUpSchema,
  updateSchema,
} from "../validation/userSchema.js";
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
  "/signup/",
  dataValidation.validateBody(signUpSchema),
  userController.signUp
);
userRoutes.post(
  "/signin",
  dataValidation.validateBody(signInSchema),
  userController.signIn
);
userRoutes.delete(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("Admin", "User"),
  dataValidation.validateTokenData(idSchema),
  userController.deleteUser
);
userRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(updateSchema),
  userController.updateUserInfo
);

export default userRoutes;
