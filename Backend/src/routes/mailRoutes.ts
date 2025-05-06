import express from "express";
import UserController from "../controllers/userController.js";
import { container } from "tsyringe";
const userController = container.resolve(UserController);
const mailRoutes = express.Router();

mailRoutes.put("/", userController.sendMail);

mailRoutes.post("/", userController.pdf);
export default mailRoutes;
