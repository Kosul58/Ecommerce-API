import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType.js";
import UserServices from "../services/userServices.js";
import ResponseHandler from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
@injectable()
export default class AdminController {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  private logError(context: string, err: unknown, extra?: object) {
    if (err instanceof Error) {
      logger.error(context, { error: err.message });
    } else {
      logger.error(`${context} - Unknown error`, { error: err, ...extra });
    }
  }

  public signUp: RequestHandler = async (req, res, next) => {
    const user: AddUser = req.body;
    try {
      logger.info("Registering user.");
      const data = await this.userServices.signUp(user, "Admin");
      logger.info("User registered successfully");
      const { result, token } = data;
      return this.responseHandler.created(
        res,
        "Admin registered successfully",
        {
          result,
          token,
        }
      );
    } catch (err) {
      this.logError("Failed to register user", err);
      return next(err);
    }
  };
}
