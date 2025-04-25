// routes/userRoutes.ts
import express from "express";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import UserController from "../controllers/userController.js";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
const userController = container.resolve(UserController);
const dataValidation = container.resolve(DataValidation);
const userRoutes = express.Router();
userRoutes.get(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.userValidation(),
  userController.getUser
);
userRoutes.get(
  "/all",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  dataValidation.userValidation(),
  userController.getUsers
);
userRoutes.post(
  "/signup/",
  dataValidation.signUpValidation(),
  userController.signUp
);
userRoutes.post(
  "/signin",
  dataValidation.signInValidation(),
  userController.signIn
);
userRoutes.delete(
  "/",
  verifyToken.verify,
  verifyRole.verify("Admin", "User"),
  dataValidation.userValidation(),
  userController.deleteUser
);
userRoutes.put(
  "/",
  verifyToken.verify,
  verifyRole.verify("User"),
  dataValidation.userValidation(),
  dataValidation.updateUserValidation(),
  userController.updateUserInfo
);

export default userRoutes;
