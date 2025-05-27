import express from "express";
import OtpController from "../controllers/otpController";
import { container } from "tsyringe";
const otpController = container.resolve(OtpController);
const otpRoutes = express.Router();
otpRoutes.post("/resend", otpController.resend);
export default otpRoutes;
