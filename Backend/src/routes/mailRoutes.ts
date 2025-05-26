import express from "express";
import UserController from "../controllers/userController";
import { container } from "tsyringe";
import { upload } from "../middlewares/imageMiddleware";
const userController = container.resolve(UserController);
const mailRoutes = express.Router();

mailRoutes.put("/", userController.sendMail);

mailRoutes.post("/", userController.pdf);

mailRoutes.post("/image", upload.array("images", 10), userController.image);

export default mailRoutes;
