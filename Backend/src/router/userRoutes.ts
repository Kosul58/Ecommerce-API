// routes/userRoutes.ts
import express from "express";
import userController from "../controllers/userController.js";
import verifyRole from "../middleware/verifyRole.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();

router.get(
  "/:userid",
  verifyToken.verify,
  verifyRole.verify("Admin"),
  userController.getUser
);
router.post("/signup/:role", userController.signUp);
router.post("/signin", userController.signIn);
router.delete("/:userid", userController.deleteUser);
router.put("/:userid", userController.updateUserInfo);

export default router;
