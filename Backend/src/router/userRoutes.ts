// routes/userRoutes.ts
import express from "express";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
import UserController from "../controllers/userController.js";
import { container } from "tsyringe";

const userController = container.resolve(UserController);
const router = express.Router();
router.get(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  userController.getUser
);
router.post("/signup/:role", userController.signUp);
router.post("/signin", userController.signIn);
router.delete(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("Admin", "User"),
  userController.deleteUser
);
router.put(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("User"),
  userController.updateUserInfo
);

export default router;
