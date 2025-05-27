import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";
import OtpServices from "../services/otpService";

@injectable()
export default class OtpController {
  constructor(
    @inject(OtpServices) private otpService: OtpServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public resend: RequestHandler = async (req, res, next) => {
    const email = req.body.email;
    try {
      logger.info("Resending otp for email verification");
      const result = await this.otpService.resend(email);
      if (!result) {
        logger.warn("Failed to resend otp data");
        return this.responseHandler.error(
          res,
          "Failed to resend otp data via mail"
        );
      }
      logger.info("Successfully resent otp data");
      return this.responseHandler.success(
        res,
        "Successfullt resent otp data via mail"
      );
    } catch (err) {
      return next(err);
    }
  };
}
